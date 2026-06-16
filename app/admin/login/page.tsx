import { signInAdmin } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/50">
      <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl text-center">Flambé Admin</h3>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to manage reservations
          </p>
        </div>
        <div className="p-6 pt-0">
          <form action={signInAdmin} className="space-y-4">
            {searchParams.error === 'invalid' && (
              <div className="text-sm font-medium text-destructive text-center">Invalid email or password.</div>
            )}
            {searchParams.error === 'unauthorized' && (
              <div className="text-sm font-medium text-destructive text-center">Your account is not active.</div>
            )}
            {searchParams.error === 'missing' && (
              <div className="text-sm font-medium text-destructive text-center">Please enter email and password.</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@flambe.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
