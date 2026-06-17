'use client'

import { RESTAURANT } from '@/lib/restaurant'
import { MapPin, Clock, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/15">
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-12">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-left">
          {/* Logo & Name */}
          <div className="flex flex-col gap-2">
            <h4 className="font-serif text-lg font-bold tracking-tight text-foreground">
              {RESTAURANT.name}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {RESTAURANT.tagline}. Đặt bàn dễ dàng và nhanh chóng trong vài bước.
            </p>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <MapPin className="size-3.5" /> Địa chỉ
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {RESTAURANT.address}
            </p>
          </div>

          {/* Hours */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Clock className="size-3.5" /> Giờ hoạt động
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {RESTAURANT.hours}
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Phone className="size-3.5" /> Liên hệ
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {RESTAURANT.phone}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {RESTAURANT.name}. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-4">
            <a href="#reserve" className="hover:text-primary transition-colors">Đặt bàn</a>
            <a href="/admin" className="hover:text-primary transition-colors">Nhân viên</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
