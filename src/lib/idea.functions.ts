import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BUCKET = "tattoo-ideas";
const dataUrl = z.string().regex(/^data:image\/(png|jpeg|webp);base64,/).max(15_000_000);

function decodeDataUrl(value: string): { bytes: Uint8Array; type: string; ext: string } {
  const match = /^data:(image\/(png|jpeg|webp));base64,(.*)$/s.exec(value);
  if (!match) throw new Error("Unsupported image");
  const bytes = Uint8Array.from(atob(match[3] ?? ""), (char) => char.charCodeAt(0));
  return { bytes, type: match[1] ?? "image/png", ext: match[2] === "jpeg" ? "jpg" : (match[2] ?? "png") };
}

export const attachIdea = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        appointmentId: z.string().uuid(),
        holdSecret: z.string().min(32).max(128),
        description: z.string().max(1000),
        referenceImage: dataUrl.nullable(),
        conceptSketch: dataUrl.nullable(),
        sketchAttempts: z.number().int().min(0).max(3),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("appointments")
      .select("id,status,idea_description,reference_image_path,hold_expires_at")
      .eq("id", data.appointmentId)
      .eq("hold_secret", data.holdSecret)
      .maybeSingle();
    if (error || !row) throw new Error("Booking not found");
    if (row.status !== "pending" || !row.hold_expires_at || new Date(row.hold_expires_at) <= new Date() || row.idea_description !== null || row.reference_image_path !== null) {
      throw new Error("Idea already saved for this booking");
    }
    const upload = async (value: string | null, name: string): Promise<string | null> => {
      if (!value) return null;
      const file = decodeDataUrl(value);
      if (file.bytes.byteLength > 10 * 1024 * 1024) throw new Error("Image too large");
      const path = `${data.appointmentId}/${name}.${file.ext}`;
      if (path.includes('..')) throw new Error("Invalid file path");
      const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, file.bytes, { contentType: file.type, upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      return path;
    };
    const referencePath = await upload(data.referenceImage, "reference");
    const sketchPath = await upload(data.conceptSketch, "concept-sketch");
    const { error: updateError } = await supabaseAdmin
      .from("appointments")
      .update({
        idea_description: data.description.trim() || null,
        reference_image_path: referencePath,
        concept_sketch_path: sketchPath,
        sketch_attempts: data.sketchAttempts,
      })
      .eq("id", data.appointmentId)
      .eq("hold_secret", data.holdSecret);
    if (updateError) throw new Error(updateError.message);
    return { ok: true };
  });

export interface IdeaView {
  description: string | null;
  referenceUrl: string | null;
  sketchUrl: string | null;
}

export const getIdeaByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(16).max(128) }).parse(data))
  .handler(async ({ data }): Promise<IdeaView | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("appointments")
      .select("idea_description,reference_image_path,concept_sketch_path")
      .eq("access_token", data.token)
      .eq("status", "confirmed")
      .maybeSingle();
    if (!row) return null;
    const sign = async (path: string | null): Promise<string | null> => {
      if (!path) return null;
      if (path.includes('..')) throw new Error("Invalid file path");
      const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
      return signed?.signedUrl ?? null;
    };
    return {
      description: row.idea_description,
      referenceUrl: await sign(row.reference_image_path),
      sketchUrl: await sign(row.concept_sketch_path),
    };
  });
