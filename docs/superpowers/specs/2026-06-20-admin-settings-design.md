# Admin Settings Design

## Overview

Admin needs two admin management areas:

1. `Cài đặt`: manage restaurant tables, walk-in holds, and weekly operating hours.
2. `Tài khoản`: manage staff login accounts and role permissions.

These changes should ship in phases to reduce risk. The admin UI will gain a `Cài đặt` section for operational configuration and a separate `Tài khoản` section at the same navigation level.

## Goals

- Let admin adjust operational settings without code changes.
- Keep public booking availability consistent with database validation.
- Preserve historical reservation data.
- Keep staff/admin authorization enforced on the server, not only hidden in UI.
- Avoid expanding `admin-dashboard.tsx` into large settings/account implementation files.

## Non-Goals

- Username login is out of scope for this version.
- Hard-deleting restaurant tables is out of scope.
- Sending invite/reset emails for staff accounts is out of scope.
- Special one-off holiday schedules are out of scope for this phase; weekly hours only.

## Phasing

Implementation status:

- Phase 1 complete: table availability states, walk-in hold guard, table settings UI.
- Phase 2 complete: weekly operating hours, footer label setting, schedule-backed slot validation.
- Phase 3 complete: separate account navigation section, self password change, staff account creation/update actions and UI. Creating or resetting another account password requires server-only `SUPABASE_SERVICE_ROLE_KEY`.

### Phase 1: Table Management And Walk-In Holds

Add admin table management and introduce explicit table availability states.

#### Table States

Add a table state field:

```ts
availability_status: 'active' | 'held_for_walk_in' | 'inactive'
```

Meanings:

- `active`: available for public booking, admin assignment, and admin timeline.
- `held_for_walk_in`: reserved for walk-in guests. Public cannot book it, and admin cannot assign it to reservations.
- `inactive`: table is out of service. Public and admin cannot use it for new reservations.

The existing `active` boolean can be migrated into `availability_status` and kept temporarily for backward compatibility if needed. New application logic should use `availability_status`.

#### Walk-In Requirement

The restaurant wants to keep two tables unavailable for booking:

- One 2-seat table.
- One 4-seat table.

Admin chooses which tables are held. The system should warn if the current held table set does not match this target, but the warning does not have to block saving.

#### Table Actions

Admin can:

- Add a new table.
- Edit table code, floor, area, capacity, sort order, notes, and availability status.
- Move a table between `active`, `held_for_walk_in`, and `inactive`.
- Reactivate held or inactive tables.

Admin cannot hard-delete tables. A "remove" action in UI should mean setting status to `inactive`.

#### Future Booking Guard

When admin tries to change a table from `active` to `held_for_walk_in` or `inactive`, the server must check future reservations.

If the table is used as either a primary or secondary table in any future reservation, block the change.

Show an error like:

```txt
Bàn này đang được gán cho X booking trong tương lai. Vui lòng đổi bàn hoặc xử lý các booking đó trước khi tắt/giữ bàn.
```

The UI should offer a way to inspect or filter related future bookings.

#### Database And Availability

Update the availability logic:

- `get_available_tables()` only returns tables with `availability_status = 'active'`.
- `get_slot_availability()` inherits the same behavior through `get_available_tables()`.
- Public booking therefore only uses the 15 active booking tables.
- Admin assignment also uses only active tables.

Historical reservations remain linked to tables even if those tables later become held or inactive.

#### UI

Add `Cài đặt` to admin navigation.

Inside settings, add `Bàn` tab:

- Compact table list or dense cards.
- Table columns: code, floor, capacity, status, sort order, notes/actions.
- Status control: `Đang dùng`, `Giữ walk-in`, `Tắt`.
- Add/edit modal for table details.
- Warning banner if held walk-in set is not one 2-seat table plus one 4-seat table.

## Phase 2: Weekly Operating Hours

Add editable weekly operating hours used by frontend labels and booking validation.

### Data Model

Add a weekly hours table:

```ts
restaurant_weekly_hours
- weekday: 1..7 // 1=Monday, 7=Sunday
- is_open: boolean
- open_time: time
- close_time: time
- last_booking_time: time
```

Add a display setting for the public booking footer:

```ts
restaurant_display_settings
- show_closed_days_in_footer: boolean // default false
```

### Rules

- Admin edits each weekday separately.
- If `is_open = false`, public booking has no slots for that day.
- Public booking only shows slots from `open_time` through `last_booking_time`.
- Admin create/edit booking uses the same schedule.
- Database validation must use the same schedule, not hardcoded times.
- `last_booking_time` is separate from `close_time`.
- Save is blocked if:
  - `open_time >= close_time`
  - `last_booking_time < open_time`
  - `last_booking_time > close_time`
  - times are not on 15-minute boundaries

### Future Booking Guard

When admin changes weekly hours, the server must check future reservations.

If the new schedule would make any future reservation invalid, block the save and show affected bookings. Admin should update those bookings before changing hours.

### Frontend Labels

Replace hardcoded `RESTAURANT.hours` for user-facing hours labels with data derived from `restaurant_weekly_hours`.

The UI should group identical open schedules into concise labels. Closed days are shown only when `show_closed_days_in_footer = true`.

When closed days are shown:

```txt
Thứ Ba - Thứ Năm: 10:30 - 22:00
Thứ Sáu - Chủ Nhật: 10:30 - 22:30
Thứ Hai: Nghỉ
```

When closed days are hidden, which is the default:

```txt
Thứ Ba - Thứ Năm: 10:30 - 22:00
Thứ Sáu - Chủ Nhật: 10:30 - 22:30
```

This setting affects only the footer label. It must not change slot availability, booking validation, or admin create/edit booking rules.

### UI

Settings tab `Giờ hoạt động`:

- Seven rows from Monday to Sunday.
- Toggle open/closed.
- Time controls for open, close, and last booking.
- Toggle for `Hiển thị ngày nghỉ trong footer booking page`, default off.
- Preview of public label.
- Save button with validation errors.

## Phase 3: Staff Account Management

Add admin-only staff account management.

### Roles

Keep existing roles:

- `admin`: can manage bookings, tables, hours, and accounts.
- `staff`: can manage bookings, assign tables, and view calendar, but cannot manage settings.

UI hiding is not enough. Server actions must enforce admin-only access.

### Account Actions

Admin can:

- Create staff/admin account with email, temporary password, display name, and role.
- Activate/deactivate staff account.
- Change a staff member's role.

Logged-in user can:

- Change their own password.

System should not allow the last active admin to deactivate themselves or demote themselves.

### Supabase Auth

Creating users requires Supabase Auth Admin API with `SUPABASE_SERVICE_ROLE_KEY`.

Rules:

- Service role key is server-only.
- Never expose service role key to client.
- Never log temporary passwords.
- Password minimum length: 8 characters.
- After creating auth user, insert `staff_profiles`.
- If profile insert fails, deactivate or delete the created auth user if possible, or surface a clear recovery error.

### UI

Add `Tài khoản` as a separate admin navigation item at the same level as `Cài đặt`, not as a tab inside settings.

Account management UI:

- Staff list with display name, email, role, active state, created date.
- Create account modal.
- Role/status controls for admin users.
- Change own password modal.

## Authorization

Add or extend server guards:

- `requireStaff()` remains for booking operations.
- Add `requireAdmin()` for settings and account management.

Database RLS and server actions should match:

- Staff can read operational data needed for booking management.
- Only admin can modify settings, table configuration, weekly hours, and staff profiles.
- `Cài đặt` and `Tài khoản` navigation items are visible only to admin users.

## Data Flow

### Table Status Change

1. Admin changes table status.
2. Server action checks admin role.
3. If moving out of `active`, server queries future reservations using that table.
4. If future reservations exist, return blocking error.
5. Otherwise update table status.
6. Revalidate admin and booking paths.

### Public Slot Availability

1. Public booking requests slot availability.
2. Server/RPC checks weekly hours.
3. Server/RPC checks only active tables.
4. Held walk-in and inactive tables are excluded.
5. Return available slot counts.

### Account Creation

1. Admin submits account form.
2. Server action checks `requireAdmin()`.
3. Server creates Supabase auth user.
4. Server creates `staff_profiles` row.
5. UI refreshes staff list.

## Error Handling

- Duplicate table code: block save.
- Invalid table capacity: block save.
- Future booking conflict when holding/inactivating table: block save.
- Invalid weekly hours: block save.
- Weekly hours would invalidate future booking: block save.
- Staff account creation failure: show specific recoverable error when possible.
- Staff tries admin-only action: return unauthorized error.

## Testing

### Phase 1

- `held_for_walk_in` tables are excluded from public slot availability.
- `held_for_walk_in` tables are excluded from admin assignment.
- Inactive tables are excluded from new operations but old reservations still display historical table.
- Changing active table with future bookings to held/inactive is blocked.
- Reactivating held/inactive table works.

### Phase 2

- Closed weekday has no public slots.
- Public slots respect `open_time` and `last_booking_time`.
- DB rejects invalid reservation slots.
- Footer/booking label updates from weekly hours config.
- Saving hours that invalidate future reservations is blocked.

### Phase 3

- Admin can create staff account.
- Created staff can log in.
- Staff cannot access settings server actions.
- Admin can activate/deactivate staff.
- Last active admin cannot deactivate/demote themselves.
- Own password change works.

## Rollout Notes

- Implement phase by phase.
- Add DB migrations before UI for each phase.
- Keep existing booking flow stable.
- After schema changes, regenerate `lib/database.types.ts`.
- Run Supabase advisors after RLS/schema changes.
