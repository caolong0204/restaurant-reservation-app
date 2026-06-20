'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable,
} from '@/lib/admin-settings-actions'
import type {
  RestaurantTable,
  RestaurantTableInput,
  TableAvailabilityStatus,
} from '@/lib/reservation-types'

import {
  emptyTableForm,
  toTableForm,
  type TableFormState,
} from './table-settings-shared'

export function TableFormModal({
  table,
  defaultSortOrder,
  onClose,
  onSaved,
}: {
  table: RestaurantTable | null
  defaultSortOrder: number
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState<TableFormState>(
    table ? toTableForm(table) : { ...emptyTableForm, sortOrder: defaultSortOrder },
  )
  const [isPending, startTransition] = useTransition()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const submit = () => {
    startTransition(async () => {
      const result = table
        ? await updateRestaurantTable(table.id, form)
        : await createRestaurantTable(form)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(table ? `Đã cập nhật ${result.data.code}` : `Đã tạo ${result.data.code}`)
      await onSaved()
      onClose()
    })
  }

  const handleDelete = () => {
    if (!table) return
    startTransition(async () => {
      const result = await deleteRestaurantTable(table.id)
      if (!result.ok) {
        toast.error(result.error)
        setIsDeleteModalOpen(false)
        return
      }
      toast.success(`Đã xóa bàn ${table.code}`)
      await onSaved()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-serif text-xl font-bold text-foreground">
            {table ? `Sửa ${table.code}` : 'Thêm bàn'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cập nhật thông tin bàn và trạng thái khả dụng.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold text-foreground">Tên bàn</span>
            <Input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="VD: Bàn số 1, T1..."
              className="h-9 text-sm"
              autoFocus
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">Tầng</span>
            <select
              value={form.floor}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  floor: event.target.value as RestaurantTableInput['floor'],
                  area: current.area || event.target.value,
                }))
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Tầng 1">Tầng 1</option>
              <option value="Tầng 2">Tầng 2</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">Khu vực</span>
            <Input
              value={form.area}
              onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
              placeholder="Sảnh chính"
              className="h-9 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">Sức chứa</span>
            <Input
              type="number"
              min={1}
              max={24}
              value={form.capacity}
              onChange={(event) =>
                setForm((current) => ({ ...current, capacity: Number(event.target.value) }))
              }
              className="h-9 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">Trạng thái</span>
            <select
              value={form.availabilityStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availabilityStatus: event.target.value as TableAvailabilityStatus,
                }))
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="active">Đang dùng</option>
              <option value="held_for_walk_in">Giữ walk-in</option>
              <option value="inactive">Tắt</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">Thứ tự</span>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
              }
              className="h-9 text-sm"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold text-foreground">Ghi chú</span>
            <Input
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Ví dụ: giữ cho khách lẻ"
              className="h-9 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div>
            {table && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Xóa bàn
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="bg-flambe-rust text-white hover:bg-flambe-rust-hover"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {table ? 'Lưu thay đổi' : 'Tạo bàn'}
            </Button>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && table && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[400px] rounded-lg border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="size-6" />
              <h2 className="text-lg font-bold">Xóa bàn?</h2>
            </div>
            <p className="mt-2 text-sm text-foreground">
              Bạn có chắc chắn muốn xóa bàn <strong>{table.code}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
