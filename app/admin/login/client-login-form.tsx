'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SubmitButton } from './submit-button'
import { signInAdmin } from '@/lib/auth-actions'

export function ClientLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_login_email')
    const savedPassword = localStorage.getItem('admin_login_password')
    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRemember(true)
    } else if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSubmit = (formData: FormData) => {
    if (remember) {
      localStorage.setItem('admin_login_email', formData.get('email') as string)
      localStorage.setItem('admin_login_password', formData.get('password') as string)
    } else {
      localStorage.removeItem('admin_login_email')
      localStorage.removeItem('admin_login_password')
    }
    signInAdmin(formData)
  }

  // To prevent hydration mismatch, we still render the form, but let useEffect populate the email
  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@flambe.com"
          className="h-11 rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-lg"
        />
      </div>

      <div className="flex items-center space-x-2 pb-2">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 cursor-pointer rounded border-gray-300 bg-background text-primary accent-primary outline-none focus:ring-2 focus:ring-primary/50"
        />
        <label
          htmlFor="remember"
          className="cursor-pointer text-sm font-medium leading-none text-muted-foreground transition-colors hover:text-foreground"
        >
          Ghi nhớ đăng nhập
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}
