import { signInAdmin } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/50">
      <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl text-center">Quản trị Flambé</h3>
          <p className="text-sm text-muted-foreground text-center">
            Đăng nhập để quản lý đặt bàn
          </p>
        </div>
        <div className="p-6 pt-0">
          <form action={signInAdmin} className="space-y-4">
            {params.error === 'invalid' && (
              <div className="text-sm font-medium text-destructive text-center">Email hoặc mật khẩu không hợp lệ.</div>
            )}
            {params.error === 'unauthorized' && (
              <div className="text-sm font-medium text-destructive text-center">Tài khoản của bạn chưa được kích hoạt.</div>
            )}
            {params.error === 'missing' && (
              <div className="text-sm font-medium text-destructive text-center">Vui lòng nhập email và mật khẩu.</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@flambe.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
