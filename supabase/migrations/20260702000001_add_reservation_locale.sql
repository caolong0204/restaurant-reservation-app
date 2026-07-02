-- Add locale column to reservations to remember the language the guest used when booking.
-- Used by the email system to send confirmation emails in the correct language.
-- Defaults to 'vi' for all existing and future rows unless explicitly set.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'vi'
    CHECK (locale IN ('vi', 'en'));
