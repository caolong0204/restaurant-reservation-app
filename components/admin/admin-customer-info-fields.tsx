import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminCustomerInfoFieldsProps {
  name: string
  onNameChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
  isPhoneValid: boolean
  email: string
  onEmailChange: (value: string) => void
  isEmailValid: boolean
}

export function AdminCustomerInfoFields({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  isPhoneValid,
  email,
  onEmailChange,
  isEmailValid,
}: AdminCustomerInfoFieldsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="cName" className="text-[11px] font-bold">
          Tên khách hàng
        </Label>
        <Input
          id="cName"
          name="customer-name"
          autoComplete="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Tên khách"
          required
          className="h-8 rounded-lg bg-background/70 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="cPhone" className="text-[11px] font-bold">
          Số điện thoại
        </Label>
        <Input
          id="cPhone"
          name="customer-phone"
          autoComplete="tel"
          inputMode="tel"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="ví dụ: 090 123 4567"
          required
          className="h-8 rounded-lg bg-background/70 text-sm"
          aria-invalid={!isPhoneValid || undefined}
        />
        {!isPhoneValid && (
          <span
            aria-live="polite"
            className="text-[10px] text-destructive font-medium"
          >
            SĐT không hợp lệ (VN format)
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 sm:col-span-2">
        <Label htmlFor="cEmail" className="text-[11px] font-bold">
          Email (Không bắt buộc)
        </Label>
        <Input
          id="cEmail"
          name="customer-email"
          autoComplete="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="ví dụ: khach@email.com"
          className="h-8 rounded-lg bg-background/70 text-sm"
          aria-invalid={!isEmailValid || undefined}
        />
        {!isEmailValid && (
          <span
            aria-live="polite"
            className="text-[10px] text-destructive font-medium"
          >
            Email không hợp lệ
          </span>
        )}
      </div>
    </div>
  )
}
