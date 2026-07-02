/** Text email template for booking confirmation — supports VI and EN. */
export interface ConfirmationEmailData {
  guestName: string
  date: string        // 'YYYY-MM-DD'
  time: string        // 'HH:MM'
  partySize: number
  tableCode: string
  reservationId: string
  locale?: 'vi' | 'en'
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function renderVI(data: ConfirmationEmailData): { subject: string; text: string } {
  const subject = `Xác nhận đặt bàn - Flambé`
  const text = [
    `Hi ${data.guestName},`,
    '',
    `Nhà hàng Flambé đã nhận lịch đặt bàn của bạn:`,
    `- Thời gian: ${data.time}, ngày ${formatDate(data.date)}`,
    `- Số lượng: ${data.partySize} người`,
    '',
    'Tụi mình sẽ chuẩn bị bàn chu đáo nhất. Bàn sẽ được giữ 15 phút nên anh/chị nhớ đến đúng giờ nhé.',
    'Cần hỗ trợ gấp, vui lòng gọi: 0927355656.',
    '',
    'Hẹn gặp bạn tại nhà hàng!',
    '',
    'Thân mến,',
    'Flambé',
  ].join('\n')

  return { subject, text }
}

function renderEN(data: ConfirmationEmailData): { subject: string; text: string } {
  const subject = `Table Confirmed - Flambé`
  const text = [
    `Hi ${data.guestName},`,
    '',
    'Your table at Flambé is booked:',
    `- When: ${data.time} on ${formatDate(data.date)}`,
    `- Guests: ${data.partySize}`,
    '',
    "We'll prepare the best spot for you! We hold tables for 15 minutes, so please be on time.",
    'Need help? Call us at 0927355656.',
    '',
    'See you at our restaurant!',
    '',
    'Cheers,',
    'Flambé',
  ].join('\n')

  return { subject, text }
}

export function renderConfirmationEmail(
  data: ConfirmationEmailData,
): { subject: string; text: string } {
  return data.locale === 'en' ? renderEN(data) : renderVI(data)
}
