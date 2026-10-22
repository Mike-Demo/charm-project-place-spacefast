REVOKE EXECUTE ON FUNCTION public.get_booking_token(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_confirmed_booking(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_booking_token(p_id uuid, p_secret text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT a.access_token
  FROM public.appointments a
  WHERE a.id = p_id
    AND a.hold_secret = p_secret
    AND p_secret IS NOT NULL
    AND a.status = 'confirmed'
    AND a.payment_status = 'paid';
$$;

REVOKE ALL ON FUNCTION public.get_booking_token(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_token(uuid, text) TO anon, authenticated;
