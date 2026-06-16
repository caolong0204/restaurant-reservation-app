# Restaurant Reservation App Implementation Plan

## Summary

- Build in two passes: polish the existing frontend flows first, then connect Supabase/Postgres/Auth.
- Admin v1 uses a hybrid workflow: reservations list as the main operations view, plus a day calendar and a table-assignment modal.
- Guests do not choose tables. New public bookings are `pending` and do not hold tables.
- Only `confirmed` bookings with a `table_id` occupy a table.
- Email, payment/deposit, customer accounts, and guest table selection are out of scope for v1.

## Key Changes

- Move shared booking domain types into `lib/reservation-types.ts`.
- Add Supabase/Postgres schema for `staff_profiles`, `restaurant_tables`, and `reservations`.
- Seed 17 default tables:
  - Floor 1: 9 small/medium/large tables.
  - Floor 2: 8 larger/private-room/balcony tables.
- Keep service slots from `10:00` to `21:00`.
- Use a 120-minute dining window to detect table overlap.
- Add RLS so only active staff users can read or mutate admin data.
- Public booking submits through a Server Action instead of direct client-side data writes.
- Admin mutations run through authenticated Server Actions and re-check authorization inside each action.

## Frontend

- Keep the existing 4-step public booking wizard.
- Add loading, error, unavailable-slot, and success states.
- Add admin views:
  - Reservations list with search, date filter, status filter, quick actions.
  - Day calendar grouped by time slot with overflow chips and a details panel.
  - Assign-table modal that lists available tables for a booking before confirmation.

## Backend

- Use `@supabase/ssr` and `@supabase/supabase-js`.
- Use cookie-based Supabase SSR clients.
- Add `proxy.ts` for session refresh.
- Protect `/admin` with Supabase Auth when environment variables are configured.
- Keep demo mode available when Supabase env vars are missing so local UI QA still works.

## Test Plan

- `pnpm lint` runs successfully.
- `pnpm build` passes.
- Browser QA:
  - Guest booking succeeds and appears in admin as pending.
  - Pending bookings do not occupy a table.
  - Admin can assign a free table and confirm a booking.
  - Overlapping confirmed bookings cannot use the same table.
  - Calendar handles multiple bookings in the same slot with visible overflow.
  - `/admin` redirects to login when Supabase Auth is configured and no staff session exists.

## Assumptions

- The restaurant operates in a single local timezone.
- UI dates and times represent restaurant-local service time.
- No email notifications in v1.
- No guest-facing account system in v1.

## Acceptance Criteria (AC)

### Thông tin nhà hàng
- **Tên:** Flambé
- **Địa chỉ:** 23 Gia Ngư, Hà Nội
- **Hotline:** 0927355656
- **Số bàn hiện tại:** 17 bàn, có thể cấu hình thêm/sửa/tắt bàn.

### Yêu cầu Nền tảng & Mục tiêu
- **Mục tiêu chính:** Quản lý đặt bàn, bàn trống/bận, lịch theo ngày, cảnh báo lỗi, báo cáo nguồn/KOL trong một ứng dụng riêng.
- **Nền tảng khuyến nghị:** Web app responsive (dùng được trên máy tính, điện thoại, iPad). Chưa cần app mobile native.
- **Ưu tiên MVP:** Đăng nhập, nhập booking, lịch theo ngày, bàn trống/bận, cần xử lý, báo cáo nguồn/KOL, xuất Excel.

### Quy tắc Nghiệp vụ (Business Rules)
- **Khung giờ booking:** 10:00 - 22:30.
- **Thời gian sử dụng bàn theo số người:**
  - Bàn 2, 3 người: 2 tiếng (120 phút).
  - Bàn 4, 5 người: 2.5 tiếng (150 phút).
  - Bàn 6 người trở lên: 3 tiếng (180 phút).
- **Logic quan trọng nhất:** Không cho trùng bàn nếu khung giờ bị chồng lên nhau, trừ khi booking bị Huỷ (Cancelled) hoặc No-show.

### KPI Vận hành
- **Thời gian nhập 1 booking:** < 30 giây.
- **Tìm booking theo SĐT:** < 3 giây.
- **Check bàn trống/bận:** Nhìn được trong 1 màn hình.
- **Cảnh báo trùng bàn:** Ngay khi lưu/chọn bàn.
- **Xuất báo cáo:** Xuất Excel theo ngày/tháng.

