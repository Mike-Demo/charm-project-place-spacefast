import { resolvePaddlePrice } from "@/lib/payments.functions";

export const SLOT_LOCK_PRICE_ID = "slot_lock_1usd";

interface PaddleCheckoutEvent {
  name?: string;
}

interface PaddleCheckoutOptions {
  items: Array<{ priceId: string; quantity: number }>;
  customer?: { email: string };
  customData?: Record<string, string>;
  settings: {
    displayMode: "overlay";
    successUrl: string;
    allowLogout: boolean;
    variant: "one-page";
  };
}

interface PaddleGlobal {
  Environment: { set: (env: "sandbox" | "production") => void };
  Initialize: (options: { token: string; eventCallback?: (event: PaddleCheckoutEvent) => void }) => void;
  Checkout: { open: (options: PaddleCheckoutOptions) => void };
}

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

const clientToken: string | undefined = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let initPromise: Promise<void> | null = null;
let eventListener: ((event: PaddleCheckoutEvent) => void) | null = null;

export function setPaddleEventListener(listener: ((event: PaddleCheckoutEvent) => void) | null): void {
  eventListener = listener;
}

export function initializePaddle(): Promise<void> {
  if (initPromise) return initPromise;
  if (!clientToken) return Promise.reject(new Error("Payments are not configured."));
  const token = clientToken;
  initPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      const paddle = window.Paddle;
      if (!paddle) {
        reject(new Error("Checkout failed to load."));
        return;
      }
      paddle.Environment.set(getPaddleEnvironment() === "sandbox" ? "sandbox" : "production");
      paddle.Initialize({ token, eventCallback: (event) => eventListener?.(event) });
      resolve();
    };
    script.onerror = () => {
      initPromise = null;
      reject(new Error("Checkout failed to load."));
    };
    document.head.appendChild(script);
  });
  return initPromise;
}

export async function openSlotCheckout(options: { appointmentId: string; email: string; holdSecret: string }): Promise<void> {
  await initializePaddle();
  const paddlePriceId = await resolvePaddlePrice({
    data: { environment: getPaddleEnvironment() },
  });
  window.Paddle?.Checkout.open({
    items: [{ priceId: paddlePriceId, quantity: 1 }],
    customer: { email: options.email },
    customData: { appointmentId: options.appointmentId },
    settings: {
      displayMode: "overlay",
      successUrl: `${window.location.origin}/?paid=${options.appointmentId}&s=${encodeURIComponent(options.holdSecret)}`,
      allowLogout: false,
      variant: "one-page",
    },
  });
}
