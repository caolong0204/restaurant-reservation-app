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
    `Xin chào anh/chị ${data.guestName},`,
    '',
    'Flambé xin xác nhận đặt bàn của anh/chị:',
    '',
    `Ngày: ${formatDate(data.date)}`,
    `Giờ: ${data.time}`,
    `Số khách: ${data.partySize} người`,
    `Bàn: Flambé sẽ chủ động sắp xếp bàn phù hợp theo tình hình bàn trống tại nhà hàng.`,
    '',
    'Bàn sẽ được giữ trong vòng 15 phút kể từ giờ đặt. Nếu cần thay đổi hoặc hủy đặt bàn, anh/chị vui lòng liên hệ Flambé trước giờ hẹn.',
    'Hotline: 0927355656',
    '',
    'Rất mong được đón anh/chị tại Flambé, 23 Gia Ngư.',
    '',
    'Trân trọng,',
    'Flambé',
  ].join('\n')

  return { subject, text }
}
