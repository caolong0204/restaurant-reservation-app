# Step-by-step Setup Supabase Cho Booking App

## Summary

- Setup Supabase theo hướng production v1: Postgres + RLS + Supabase Auth email/password + Next.js SSR cookie client.
- Không chạy migration draft hiện tại nguyên trạng; trước tiên rewrite/sync migration theo logic FE mới.
- Nguồn chính thức cần bám theo:
  - Supabase SSR client: https://supabase.com/docs/guides/auth/server-side/creating-a-client
  - Supabase SSR Auth: https://supabase.com/docs/guides/auth/server-side
  - Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

## Step-by-step Setup

### 1. Tạo Supabase Project

- Vào Supabase Dashboard, tạo project mới.
- Lưu lại:
  - Project URL.
  - Publishable key dạng `sb_publishable_...`.
  - Project ref từ URL dashboard.
- Không dùng legacy anon key nếu project có publishable key mới.

### 2. Cấu hình env local

- Tạo/cập nhật `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

- Khi env này tồn tại, app sẽ chạy Supabase mode.
- Khi env thiếu, app giữ demo mode.

### 3. Chuẩn hóa Supabase client SSR

- Kiểm tra lại các file hiện có:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/proxy.ts`
  - `proxy.ts`
- Client phải dùng `@supabase/ssr`.
- Browser client dùng `createBrowserClient`.
- Server Action/Server Component client dùng `createServerClient`.
- Proxy phải refresh session bằng cookie flow theo docs Supabase SSR.
- `/admin` redirect `/admin/login` khi Supabase mode bật và chưa login.

### 4. Rewrite migration DB

- Thay migration draft hiện tại bằng schema production-ready:
  - `staff_profiles`
  - `restaurant_tables`
  - `reservations`
  - `reservation_table_assignments`
- Không dùng `secondary_table_ids` CSV text cho production.
- `reservation_table_assignments` lưu:
  - `reservation_id`
  - `table_id`
  - `role`: `primary | secondary`
- `reservations` lưu thêm:
  - `manual_arrangement boolean default false`
  - `status pending|confirmed|cancelled`
  - `reservation_date date`
  - `reservation_time time`
  - generated/service window theo party size.

### 5. Sync business rules trong SQL/RPC

- Duration:
  - 1-4 khách: 120 phút.
  - 5-6 khách: 150 phút.
  - 7+ khách: 180 phút.
- Slot:
  - 15 phút/lần.
  - Bắt đầu `10:30`.
  - Weekday cutoff `22:00`.
  - Friday/Saturday/Sunday cutoff `22:30`.
- Availability:
  - Pending/cancelled không block bàn.
  - Confirmed block cả primary và secondary tables.
  - Capacity thiếu chỉ cho confirm nếu có bàn ghép đủ hoặc `manual_arrangement = true`.

### 6. Seed table inventory

- Seed đúng 17 bàn hiện tại từ `lib/table-seed.ts`.
- Nên dùng UUID ổn định trong DB, sau đó update FE seed/demo map nếu cần.
- Table code/capacity/sort order phải khớp calendar/admin hiện tại.

### 7. Bật RLS và policy

- Bật RLS cho mọi bảng public nhạy cảm.
- Policy public:
  - Chỉ cho insert reservation `pending`.
  - Không cho public select/update/delete reservations.
  - Không cho public tạo table assignments.
- Policy staff:
  - Active staff đọc/sửa/xóa reservations.
  - Active staff đọc/sửa table assignments.
  - Active staff đọc restaurant tables.
- Function `is_active_staff()` dùng `auth.uid()` và `staff_profiles.active = true`.

### 8. Tạo admin user

- Tạo user trong Supabase Auth bằng email/password.
- Insert profile:

```sql
insert into public.staff_profiles (user_id, display_name, role, active)
values ('AUTH_USER_ID_HERE', 'Admin', 'admin', true)
on conflict (user_id) do update
set role = 'admin', active = true;
```

### 9. Refactor Server Actions sang schema mới

- `createReservation`:
  - Insert reservation pending, không table assignment.
- `getAdminSnapshot`:
  - Load reservations + tables + assignments.
  - Map về FE type hiện tại.
- `confirmReservation`:
  - Gọi RPC/transaction atomic để confirm và insert primary/secondary assignments.
  - Chặn overlap ở DB.
- `editReservation`:
  - Update guest info/date/time/party/status.
  - Nếu đổi assignment thì validate overlap/capacity lại.
- `cancelReservation`:
  - Set cancelled.
  - Booking cancelled không block availability.
- `deleteReservation`:
  - Cascade/delete assignments.

### 10. Generate/update TypeScript DB types

- Sau khi migration ổn, generate lại `lib/database.types.ts`.
- Cập nhật mapping trong `lib/reservation-actions.ts`.
- FE public/admin không đổi contract lớn, chỉ thêm `manualArrangement` nếu cần.

### 11. Test & smoke

- Chạy:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

- Thêm unit + smoke tests:
  - Duration mapping.
  - Slot generation.
  - Overlap primary/secondary.
  - Pending không block.
  - Capacity guard.
  - RLS public/staff behavior.
- Manual QA:
  - Public booking tạo pending.
  - Admin login được.
  - `/admin` redirect khi chưa login.
  - Confirm booking với bàn đủ ghế.
  - Không thể double-book overlap.
  - Ghép bàn block đúng cả secondary tables.
  - Calendar/list render đúng từ Supabase.

## Acceptance Criteria

- Supabase mode chạy thành công với `.env.local`.
- Demo mode vẫn chạy khi thiếu env.
- Public user không đọc trực tiếp được reservations.
- Admin chưa login bị redirect `/admin/login`.
- Active staff login vào được `/admin`.
- Public booking tạo pending reservation trong DB.
- Pending booking không block available tables.
- Confirm booking tạo primary assignment bắt buộc.
- Secondary assignments được lưu bằng join table.
- DB/RPC chặn double-book trên primary và secondary tables.
- Booking thiếu ghế bị chặn nếu không ghép bàn hoặc manual arrangement.
- Calendar/admin list hiển thị dữ liệu Supabase đúng với UI hiện tại.
- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` đều pass.

## Assumptions

- Project chưa có production data cần migrate.
- Admin v1 chỉ cần email/password, chưa cần magic link/OAuth.
- Timezone vận hành là giờ nhà hàng tại Việt Nam; DB lưu `date` + `time` local.
- Email confirmation, payment, customer account, report/export nằm ngoài phase này.
