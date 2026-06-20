import nodemailer from 'nodemailer'
import type { Reservation } from '@/lib/reservation-types'
import { renderConfirmationEmail } from '@/lib/email/templates/confirmation'

interface EmailResult {
  ok: boolean
  error?: string
}

/** Creates a Gmail SMTP transporter. Returns null if env vars are not configured. */
function createGmailTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '')

  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

/**
 * Sends a booking confirmation email to the guest.
 * Best-effort: returns { ok: false, error } on failure without throwing.
 * Skips silently if guest has no email. Missing Gmail config is reported.
 */
export async function sendConfirmationEmail(
  reservation: Reservation,
): Promise<EmailResult> {
  if (!reservation.email) return { ok: true }

  const transporter = createGmailTransporter()
  if (!transporter) {
    console.error('[email] Gmail env is missing. Set GMAIL_USER and GMAIL_APP_PASSWORD in root .env.local.')
    return { ok: false, error: 'Email service chưa được cấu hình.' }
  }

  const tableCode = reservation.table
    ? reservation.table.code
    : reservation.tableId ?? 'N/A'

  const { subject, text } = renderConfirmationEmail({
    guestName: reservation.name,
    guestEmail: reservation.email,
    date: reservation.date,
    time: reservation.time,
    partySize: reservation.partySize,
    tableCode,
    reservationId: reservation.id,
  })

  const fromName = process.env.GMAIL_FROM_NAME ?? 'Flambé Restaurant'
  const fromEmail = process.env.GMAIL_USER!

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: reservation.email,
      subject,
      text,
    })
    console.info('[email] Confirmation email sent:', {
      reservationId: reservation.id,
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId,
    })
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] Failed to send confirmation email:', message)
    return { ok: false, error: 'Không gửi được email xác nhận cho khách.' }
  }
}
