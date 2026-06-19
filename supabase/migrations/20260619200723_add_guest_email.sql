-- Add guest_email to reservations table
ALTER TABLE reservations
ADD COLUMN guest_email TEXT;
