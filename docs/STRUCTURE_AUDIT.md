# Structure Audit

Tài liệu này audit codebase hiện tại theo `docs/PROJECT_STRUCTURE.md`.

Mục tiêu:
- chỉ ra phần nào đang đúng hướng
- chỉ ra phần nào đang lệch structure contract
- đề xuất thứ tự refactor ít rủi ro trước khi tiếp tục scale backend và product

---

## 1. Kết luận nhanh

Codebase hiện tại **đã có nền tảng đúng**:
- đã dùng Next.js App Router
- đã tách `app/`, `components/`, `lib/`, `supabase/`, `docs/`
- đã có Supabase SSR helpers riêng
- đã có domain types riêng cho reservation
- đã có tách một phần admin UI thành subcomponents

Các phase structure lớn đã được triển khai xong:
- reservation domain đã được module hóa
- staff auth guard đã đi vào `lib/auth/guards.ts`
- admin dashboard đã tách filter state và action orchestration ra hook riêng
- timeline math của calendar đã ra helper riêng

Hiện tại, codebase còn **3 điểm cần tiếp tục cải thiện dần**:

1. `lib/reservation-actions.ts` vẫn còn là compatibility entrypoint chuyển tiếp cho UI cũ.

2. `components/admin/create-modal.tsx` và `components/admin/edit-modal.tsx` vẫn khá dày vì đang chứa nhiều flow form + table-selection UI.

3. Reservation provider vẫn là điểm tập trung state quan trọng; nếu product mở rộng thêm realtime hoặc optimistic UI, cần giữ nó rất kỷ luật.

---

## 2. Những phần đang ổn

### Route layer tương đối mỏng

Các route chính:
- `app/page.tsx`
- `app/admin/page.tsx`
- `app/admin/login/page.tsx`

Hiện tại route layer chưa bị nhồi quá nhiều business logic. Đây là nền tốt và nên giữ.

### UI đã có tách domain tương đối rõ

Hiện đã có:
- `components/booking/*`
- `components/admin/*` (gồm cả accounts, settings đã được tách module)
- `components/home/*`
- `components/ui/*`

Đây là hướng rất đúng với cấu trúc App Router hiện đại.

### Supabase integration đã có boundary cơ bản

Đã có:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`
- `lib/supabase/config.ts`

Phần này khá đúng hướng theo Supabase SSR guide, nên không cần đảo cấu trúc lớn nữa.

### Shared types đã có điểm đặt tương đối ổn

`lib/reservation-types.ts` đang là nơi đặt type dùng chung cho booking/admin. Đây là quyết định tốt và nên tiếp tục giữ làm nguồn type trung tâm cho domain reservation.

### Migration folder đã tồn tại

`supabase/migrations/` đã là nơi giữ schema history. Đây là đúng boundary cần có cho giai đoạn backend.

---

## 3. Những phần đang lệch structure contract

### [Medium] `lib/reservation-actions.ts` hiện là compatibility entrypoint chuyển tiếp

File hiện tại đã mỏng lại đáng kể và chủ yếu chỉ còn async wrappers để giữ ổn định import hiện tại của UI.

Đánh giá:
- không còn là nút thắt lớn như trước
- nhưng về dài hạn nên để UI import dần từ module reservation rõ nghĩa hơn
- chưa cần ưu tiên dọn ngay nếu product còn thay đổi nhanh

### [Medium] `components/admin-dashboard.tsx` đã nhẹ đi rõ rệt

File hiện tại đã giảm còn khoảng `200` dòng.

Những gì đã tách ra:
- filter state + derived list -> `lib/hooks/use-admin-reservation-filters.ts`
- modal state + action orchestration -> `lib/hooks/use-admin-reservation-actions.ts`
- top/header UI -> component riêng
- search/filter UI -> component riêng

Đánh giá:
- đây đã là page shell hợp lý
- chưa cần chia nhỏ thêm trừ khi admin xuất hiện thêm view hoặc bulk actions

### [Medium] `components/admin/day-calendar-view.tsx` đã bỏ được phần grid math nặng

File hiện tại đã giảm còn khoảng `255` dòng.

Đã tách:
- timeline/grid math -> `lib/admin-calendar.ts`
- row rendering -> `components/admin/timeline-row.tsx`
- reservation detail modal -> `components/admin/calendar-reservation-details.tsx`

Đánh giá:
- đủ tốt cho hiện tại
- có thể tách tiếp header controls nếu calendar phát triển thành week/multi-room planner

### [Medium] `components/admin/create-modal.tsx` đang ôm khá nhiều rule create/assign

File khoảng `473` dòng.

Nếu modal này tiếp tục tăng logic:
- disable giờ quá khứ
- check available tables
- hide/show manual arrangement
- validate joined tables

thì nó sẽ thành một “mini dashboard” riêng.

Nên đưa các rule dùng lại được sang `lib/reservations/validators.ts` hoặc ít nhất helper riêng.

### [Done] Auth đã có module rõ ràng hơn

Hiện tại:
- `lib/auth-actions.ts` giữ login/logout
- `lib/auth/guards.ts` giữ staff access guard dùng lại cho admin server actions

Đây là trạng thái đúng hướng cho phase tiếp theo.

### [Medium] Provider đang làm client bridge hợp lý nhưng có nguy cơ thành state hub quá lớn

`components/reservation-provider.tsx` hiện khoảng `220` dòng, chưa quá lớn, nhưng vì nó đứng giữa UI và server actions nên rất dễ phình.

Rule nên giữ:
- provider chỉ làm bridge và state sync
- không nhét thêm business rule nặng vào đây

---

## 4. Đánh giá theo từng layer

### `app/`

Trạng thái: `Good`

- route tương đối mỏng
- chưa thấy dấu hiệu cần refactor mạnh

### `components/`

Trạng thái: `Mostly good, but some components are too orchestration-heavy`

Ưu điểm:
- đã chia theo domain

Cần cải thiện:
- giảm trọng lượng ở dashboard-level components
- giảm business logic nhúng trong modal lớn

### `lib/`

Trạng thái: `Needs refactor first`

Đây là layer cần ưu tiên nhất vì hiện tại domain logic đang tập trung quá dày ở một file.

### `supabase/`

Trạng thái: `Good base`

- cấu trúc folder hợp lý
- bước tiếp theo là giữ migration, RLS, RPC, helper sync với frontend rules

### `docs/`

Trạng thái: `Improving`

Hiện đã có:
- `ARCHITECTURE.md`
- `RULES.md`
- `PROJECT_STRUCTURE.md`

Nên coi bộ ba này là nền tài liệu chuẩn để team và AI cùng theo.

---

## 5. Refactor order đề xuất

Không nên dọn toàn bộ codebase một lần. Thứ tự ít rủi ro nhất là:

### Phase 1: Tách `lib/reservation-actions.ts`

Status hiện tại: `Done`

Mục tiêu:
- giữ nguyên behavior
- chỉ tách file

Tách dần thành:

```text
lib/reservations/
  actions.ts
  queries.ts
  mutations.ts
  mappers.ts
  validators.ts
```

Acceptance:
- public booking flow không đổi
- admin flow không đổi
- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` pass

Kết quả đã triển khai:

```text
lib/reservations/
  actions.ts
  guards.ts
  mappers.ts
  mutations.ts
  queries.ts
  shared.ts
  types.ts
  validators.ts
```

Ghi chú:
- `lib/reservation-actions.ts` hiện là compatibility entrypoint mỏng để tránh phải đổi import hàng loạt trong UI.
- Đây là bước chuyển tiếp hợp lý; các feature mới nên ưu tiên import từ reservation module rõ ràng hơn khi an toàn.

### Phase 2: Tách auth guard khỏi reservation module

Status hiện tại: `Done`

Mục tiêu:
- đưa `requireStaff` và auth-related helper sang `lib/auth/guards.ts`

Acceptance:
- `/admin` vẫn bảo vệ đúng
- server actions admin vẫn chặn account không hợp lệ

### Phase 3: Giảm tải `admin-dashboard.tsx`

Status hiện tại: `Done`

Mục tiêu:
- tách derived state, filter state, action handlers ra hook/helper

Ưu tiên:
- filters
- selected reservation / modal state
- submit handlers

Acceptance:
- file dashboard giảm đáng kể
- row view và calendar view không đổi hành vi

### Phase 4: Tách timeline math khỏi `day-calendar-view.tsx`

Status hiện tại: `Done`

Mục tiêu:
- đưa logic vị trí booking, span duration, offset 15 phút, header labels sang helper riêng

Acceptance:
- UI timeline giữ nguyên
- logic hiển thị 30 phút và offset giữa ô dễ test hơn

---

## 6. Rule vận hành cho team từ bây giờ

Khi thêm feature mới, ưu tiên theo các rule sau:

1. Nếu là route mới:
   - thêm ở `app/`
   - page giữ mỏng

2. Nếu là UI domain-specific:
   - thêm ở `components/booking` hoặc `components/admin`

3. Nếu là primitive tái sử dụng:
   - thêm ở `components/ui`

4. Nếu là booking rule, validation, mapping, query, mutation:
   - thêm vào reservation domain trong `lib/`

5. Nếu là auth/role check:
   - thêm vào auth domain trong `lib/auth`

6. Nếu là schema/RPC/index/RLS:
   - thêm bằng migration trong `supabase/migrations`

7. Không thêm logic mới trực tiếp vào các file đã quá to nếu có thể tách riêng mà không đổi behavior.

---

## 7. Quyết định thực tế cho project này

Nếu phải chọn đúng một chỗ để dọn tiếp trước khi scale product, hãy dọn:

`components/admin/create-modal.tsx` và `components/admin/edit-modal.tsx`

Lý do:
- đây là nơi đang giữ nhiều rule UI nhất sau khi dashboard và calendar đã nhẹ đi
- mỗi thay đổi về confirm/assign/validate rất dễ chạm vào hai modal này
- nếu sau này thêm bulk assign, suggest table combo, hay audit note, hai file này sẽ phình rất nhanh

---

## 8. Definition of “structure done”

Có thể coi structure đã đi đúng hướng khi:

- route layer mỏng
- Supabase helpers không lẫn business logic
- reservation domain có module rõ ràng
- auth guard có module riêng
- dashboard shell chủ yếu compose UI
- timeline/grid logic có helper riêng
- AI và dev mới vào project có thể đoán đúng chỗ đặt code mà không cần hỏi lại
