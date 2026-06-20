# Confirmation Email — Design Spec

## Overview

Khi admin xác nhận bàn cho một booking, hệ thống tự động gửi email xác nhận đến khách (nếu khách có cung cấp email). Email được gửi qua **Gmail SMTP (Nodemailer)** — miễn phí, không cần domain riêng. Gửi email chạy nền, không block flow gán bàn/xác nhận. Kiến trúc được thiết kế để sau này có thể thêm **Resend** làm primary provider một cách dễ dàng.

## Trigger

- **Khi nào:** Booking chuyển sang `confirmed`
  - Admin gán bàn qua `confirmReservation()`
  - Admin đổi status sang `confirmed`
  - Admin tạo booking thủ công với bàn được gán sẵn
  - Admin edit booking pending và gán bàn
  - Admin đổi/thêm email cho booking đã confirmed
- **Điều kiện:** `reservation.email` phải có giá trị (optional field)
- **Nếu không có email:** Bỏ qua, không gửi, không lỗi
- **Hiệu năng:** Không `await` email. Mutation trả kết quả ngay sau khi DB update thành công.

## Architecture

```
confirmReservation() [lib/reservations/mutations.ts]
    └── xác nhận bàn thành công
    └── nếu reservation.email tồn tại:
            └── sendConfirmationEmailInBackground(reservation)
                    └── void sendConfirmationEmail(reservation)
                    └── Nodemailer transporter (Gmail SMTP)
                    └── renderConfirmationEmail(reservation) [lib/email/templates/confirmation.ts]
                    └── gửi text-only email
                    └── log success/failure server-side
    └── nếu email lỗi:
            └── Booking vẫn confirmed — email lỗi không block flow
            └── Không trả emailWarning về UI vì gửi nền
```

## Files

| File | Trạng thái | Mục đích |
|------|-----------|----------|
| lib/email/mailer.ts | MỚI | sendConfirmationEmail() — orchestrator gửi email |
| lib/email/templates/confirmation.ts | MỚI | Render subject + text email |
| lib/reservations/mutations.ts | SỬA | Gọi sendConfirmationEmailInBackground() sau khi booking confirmed |
| lib/reservation-types.ts | SỬA | Thêm ReservationEditInput cho patch-style edit |
| Admin confirm UI | KHÔNG CẦN | Email gửi nền, UI không chờ và không hiện email warning |

## Email Template

Subject: Xác nhận đặt bàn - Flambé

Nội dung text-only để giảm khả năng vào Spam khi đang gửi bằng Gmail cá nhân:
- Lời chào theo tên khách
- Thông báo đặt bàn đã được xác nhận
- Ngày, giờ, số khách, bàn
- Mã đặt bàn
- Nhắc khách liên hệ Flambé nếu cần thay đổi hoặc hủy

## Error Handling

| Tình huống | Xử lý |
|-----------|-------|
| GMAIL_USER / GMAIL_APP_PASSWORD chưa cấu hình | Log error server-side, không block booking |
| Gửi thất bại (mạng, sai config) | Log error server-side, không block booking |
| Khách không có email | Skip hoàn toàn |
| Gmail đưa mail vào Spam | Giảm bằng text-only; production nên dùng domain `flambe.vn` + transactional provider |

## Env Vars

GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
GMAIL_FROM_NAME=Flambé Restaurant

## Upgrade Path (tương lai)

Khi có domain riêng, thêm RESEND_API_KEY vào env, mailer.ts thử Resend trước rồi fallback Gmail.
Không cần thay đổi mutations hay UI.
