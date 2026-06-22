/** Text email template for booking confirmation. */
export interface ConfirmationEmailData {
  guestName: string
  guestEmail: string
  date: string        // 'YYYY-MM-DD'
  time: string        // 'HH:MM'
  partySize: number
  tableCode: string
  reservationId: string
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function renderConfirmationEmail(data: ConfirmationEmailData): { subject: string; text: string } {
  const subject = `Xác nhận đặt bàn - Flambé`
  const text = [
    `Xin chào ${data.guestName},`,
    '',
    'Đặt bàn của bạn đã được xác nhận.',
    '',
    `Ngày: ${formatDate(data.date)}`,
    `Giờ: ${data.time}`,
    `Số khách: ${data.partySize} người`,
    `Bàn: ${data.tableCode}`,
    '',
    'Nếu cần thay đổi hoặc hủy đặt bàn, vui lòng liên hệ với Flambé trước giờ hẹn.',
  ].join('\n')

  return { subject, text }
}
