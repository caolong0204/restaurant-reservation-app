import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, LockKeyhole, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RESTAURANT } from '@/lib/restaurant'
import { createClient } from '@/lib/supabase/server'
import { ClientLoginForm } from './client-login-form'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (staffProfile?.active) {
      redirect('/admin')
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label={RESTAURANT.name}>
            <Image
              src="/flambe-logo.png"
              alt={`${RESTAURANT.name} Logo`}
              width={764}
              height={326}
              priority
              className="h-auto w-24 sm:w-[120px]"
            />
          </Link>

          <Button
            render={
              <Link href="/">
                <ArrowLeft className="size-4" />
                Về trang đặt bàn
              </Link>
            }
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="gap-2"
          />
        </div>
      </header>

      <section className="relative">
        <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
          <Image
            src="/restaurant-hero.png"
            alt="Không gian nhà hàng Flambé"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/70 to-foreground/45" />

          <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center px-3 py-10 sm:px-4 lg:py-16">
            <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-center">
              <div className="max-w-xl text-background lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-3 py-1 text-sm backdrop-blur">
                  <Star className="size-3.5 fill-accent text-accent" />
                  Khu vực vận hành nội bộ
                </span>
                <h1 className="mt-5 text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Đăng nhập để quản lý lịch đặt bàn và phân bổ bàn phục vụ
                </h1>
                <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-background/80 sm:text-lg">
                  Cùng một hệ giao diện với trang booking, nhưng tối ưu cho đội ngũ vận hành theo dõi booking pending, booking confirmed và tình trạng bàn theo từng khung giờ.
                </p>


              </div>

              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xl">
                  <div className="flex items-center justify-between bg-primary px-6 py-5 text-primary-foreground">
                    <div>
                      <p className="font-serif text-xl font-bold tracking-tight">Quản trị {RESTAURANT.name}</p>
                      <p className="mt-1 text-sm text-primary-foreground/80">
                        Đăng nhập để vào khu vực staff
                      </p>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/14">
                      <LockKeyhole className="size-5" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-4">
                      {params.error === 'invalid' && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                          Email hoặc mật khẩu không hợp lệ.
                        </div>
                      )}
                      {params.error === 'unauthorized' && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                          Tài khoản của bạn chưa được kích hoạt.
                        </div>
                      )}
                      {params.error === 'missing' && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                          Vui lòng nhập email và mật khẩu.
                        </div>
                      )}
                    </div>
                    <ClientLoginForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
