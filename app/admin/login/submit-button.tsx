'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="h-11 w-full rounded-lg text-sm font-semibold">
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        'Đăng nhập'
      )}
    </Button>
  )
}
