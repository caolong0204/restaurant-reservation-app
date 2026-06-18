# Project Structure Contract

Tài liệu này mô tả cấu trúc **nên theo** cho project, dựa trên các khuyến nghị chính thức của:

- Next.js App Router project structure và file colocation
- Next.js Server / Client Components
- Next.js Server Functions (`use server`)
- Supabase SSR client setup cho Next.js

Tài liệu này **không** coi codebase hiện tại là chân lý tuyệt đối. Nếu code hiện tại lệch, tài liệu này là đích cần tiến tới.

---

## 1. Nguồn nguyên tắc

### Từ Next.js

- Next.js App Router dùng **filesystem routing** và cho phép **safe colocation**: file không phải route có thể colocate gần route nếu hợp lý. [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure), [Project Organization and Colocation](https://nextjs.org/docs/13/app/building-your-application/routing/colocation)
- Mặc định nên ưu tiên **Server Components**, chỉ dùng Client Components cho phần cần state, effect, browser API, event handlers. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [`use client`](https://nextjs.org/docs/app/api-reference/directives/use-client)
- Server Functions / Server Actions nên nằm trong **dedicated file** khi cần import từ client side. [`use server`](https://nextjs.org/docs/app/api-reference/directives/use-server), [Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)

### Từ Supabase

- Với SSR auth, nên tách client thành:
  - browser client
  - server client
  - proxy/middleware session refresh
  [Supabase SSR Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)

---

## 2. Cấu trúc mục tiêu

Project nên đi theo cấu trúc này:

```text
app/
  layout.tsx
  page.tsx
  globals.css
  admin/
    page.tsx
    login/
      page.tsx

components/
  booking/
  admin/
  home/
  ui/
  reservation-provider.tsx
  site-header.tsx

lib/
  reservations/
    actions.ts
    queries.ts
    mutations.ts
    mappers.ts
    validators.ts
    constants.ts
    types.ts
  auth/
    actions.ts
    guards.ts
  supabase/
    client.ts
    server.ts
    proxy.ts
    config.ts
  hooks/
  utils.ts
  database.types.ts

supabase/
  migrations/

docs/
  ARCHITECTURE.md
  RULES.md
  PROJECT_STRUCTURE.md
```

---

## 3. Vai trò từng tầng

### `app/` = Route layer

Chỉ nên chứa:
- route files (`page.tsx`, `layout.tsx`)
- metadata
- very thin composition

Không nên chứa:
- validation booking
- Supabase query trực tiếp
- status transition logic
- table assignment rules

Rule:
- `app/*/page.tsx` nên càng mỏng càng tốt
- nếu page bắt đầu chứa nhiều state/interaction/domain logic, đẩy xuống `components/` hoặc `lib/`

### `components/` = UI layer

Chia theo domain:
- `components/booking/`: public booking flow
- `components/admin/`: admin operations UI
- `components/home/`: public landing/shell blocks
- `components/ui/`: primitive, reusable, domain-agnostic

Rule:
- component không query DB trực tiếp
- component không import Supabase client trực tiếp
- component được nhận data đã map sẵn từ `lib/`

### `lib/` = Domain + application logic

Đây là tầng chứa:
- server functions
- auth logic
- domain validation
- database mapping
- data access
- shared typed contracts

Rule:
- Mọi mutation quan trọng phải nằm ở đây
- Booking rules phải có một nguồn sự thật ở đây, không rải trong UI

### `supabase/` = Backend schema history

Chỉ chứa:
- SQL migrations
- backend artifacts liên quan schema/runtime

Rule:
- migration là source of truth cho schema
- không để schema thực tế drift quá xa so với migration repo

---

## 4. Boundary bắt buộc

### Boundary 1: Route vs Domain

- Route compose UI
- Domain logic ở `lib/`

Không làm:
- `app/admin/page.tsx` tự validate reservation input
- `app/admin/page.tsx` tự query Supabase

### Boundary 2: UI vs Data access

- UI component chỉ gọi provider hoặc receive props
- Data access nằm trong server function / domain layer

Không làm:
- import `createClient()` trong client component
- fetch trực tiếp Supabase ở `components/admin/*`

### Boundary 3: Primitive UI vs Business UI

- `components/ui/` không biết `Reservation`, `RestaurantTable`, `staff_profiles`
- `components/admin/` và `components/booking/` được biết domain booking

---

## 5. Tổ chức reservation domain

Với project booking này, reservation là core domain, nên nên có module riêng.

### Mục tiêu

```text
lib/reservations/
  actions.ts
  queries.ts
  mutations.ts
  mappers.ts
  validators.ts
  constants.ts
  types.ts
```

### Trách nhiệm

- `actions.ts`
  - export các server functions được UI gọi
- `queries.ts`
  - load tables, reservations, snapshot
- `mutations.ts`
  - create/edit/confirm/cancel/delete
- `mappers.ts`
  - DB row -> app model
- `validators.ts`
  - validate input, capacity, past-time, status transition
- `constants.ts`
  - domain constants nếu không thuộc `restaurant.ts`
- `types.ts`
  - chỉ dùng nếu reservation types quá lớn; nếu chưa cần, giữ ở `lib/reservation-types.ts`

### Quy tắc chuyển đổi

Hiện tại project vẫn đang dùng `lib/reservation-actions.ts` khá lớn.  
Đó là chấp nhận được trong giai đoạn chuyển tiếp, nhưng **đích cấu trúc** nên là module hóa reservation domain như trên.

---

## 6. Tổ chức auth domain

Tối thiểu nên tách:

```text
lib/auth/
  actions.ts
  guards.ts
```

### `actions.ts`
- login
- logout

### `guards.ts`
- check current staff
- check active profile
- shared auth assertions cho admin route / action

Lý do:
- auth là cross-cutting concern
- không nên bị trộn sâu trong reservation module

---

## 7. Tổ chức Supabase integration

Theo Supabase SSR guide, project nên giữ rõ 3 client role:

```text
lib/supabase/
  client.ts   // browser
  server.ts   // server actions / server components
  proxy.ts    // session refresh
  config.ts   // env read only
```

Rule:
- không trộn helper khác vào đây
- folder này chỉ nói về **kết nối Supabase**, không nói business logic booking

---

## 8. Colocation: khi nào colocate, khi nào tách

Next.js cho phép colocate file cạnh route. Tuy nhiên với app cỡ này:

### Nên colocate khi:
- component hoặc helper chỉ phục vụ đúng một route nhỏ
- không có giá trị tái sử dụng ngoài route đó

### Nên tách ra `components/` hoặc `lib/` khi:
- được dùng ở nhiều route
- là business logic
- là action/query/mutation
- là admin/public shared UI

Rule thực tế cho project này:
- route-level helper nhỏ có thể colocate
- booking/admin domain logic thì không colocate trong `app/`

---

## 9. Naming convention

### File names

- file component: `kebab-case.tsx`
- file helper/domain: `kebab-case.ts`
- giữ nhất quán, không trộn `camelCase` filename

### Component names

- `PascalCase`
- đặt theo vai trò UI

Tốt:
- `AssignTableModal`
- `DayCalendarView`
- `CapacityWarningAlert`

Kém:
- `Modal2`
- `Helper`
- `DataThing`

### Function names

- query: `listReservations`, `getAdminSnapshot`
- mutation: `createReservation`, `confirmReservation`
- mapper: `mapReservation`, `mapTable`
- validator: `validateReservationInput`, `validateAssignmentCapacity`

---

## 10. Quy tắc thêm feature mới

### Nếu thêm admin feature mới

Ví dụ `customer notes history`

Không nên:
- nhét hết vào `components/admin-dashboard.tsx`

Nên:
- UI nhỏ vào `components/admin/`
- data contract / action vào `lib/`
- nếu đủ lớn, tạo sub-domain mới trong `lib/`

### Nếu thêm page mới

Ví dụ `/admin/customers`

Nên:
- route mới ở `app/admin/customers/page.tsx`
- page chỉ compose
- phần lớn UI ở `components/admin/`
- data logic ở `lib/`

---

## 11. Anti-pattern cần tránh

- Client component gọi Supabase trực tiếp
- Route file ôm quá nhiều logic
- `components/ui/` chứa business component
- Một file vừa query DB, vừa render UI, vừa validate domain
- Dùng `any` cho reservation data
- Hardcode booking rule ở nhiều nơi
- Mỗi modal tự viết lại cùng một validation rule

---

## 12. Recommended migration path cho codebase hiện tại

Để đưa codebase gần hơn với cấu trúc chuẩn này, thứ tự nên là:

1. Tách `lib/reservation-actions.ts` thành reservation module
2. Tách auth helper thành `lib/auth/*`
3. Giữ `components/admin-dashboard.tsx` mỏng hơn bằng cách đẩy bớt orchestration nhỏ ra component con
4. Dọn tài liệu để mọi file docs phản ánh đúng runtime hiện tại

---

## 13. Quy tắc chốt trước khi merge

Trước khi merge feature mới, tự hỏi:

- File này đang thuộc route layer, UI layer, hay domain layer?
- Nó có đang vượt boundary không?
- Nó có đang làm việc mà đúng ra tầng khác phải làm không?
- Có đang duplicating booking rule ở nơi khác không?
- Tên file và vị trí file đã giúp người mới tìm được nó chưa?

Nếu không trả lời rõ được, cấu trúc đang có vấn đề.
