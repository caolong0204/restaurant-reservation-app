'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { RESTAURANT } from '@/lib/restaurant'

import { RestaurantInfo } from './restaurant-info'

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[45vh] min-h-[360px] md:h-[62vh] md:min-h-[460px] w-full overflow-hidden">
        <Image
          src="/restaurant-hero.png"
          alt="Phòng ăn ấm áp dưới ánh nến tại Flambé"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/45 to-foreground/30" />

        {/* Two-column layout overlay */}
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center px-3 sm:px-4">
          <div className="grid w-full gap-12 md:grid-cols-12 items-center">
            {/* Left Column: Hero Copy */}
            <div className="max-w-xl md:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-3 py-1 text-sm text-background backdrop-blur">
                <Star className="size-3.5 fill-accent text-accent" />
                {RESTAURANT.tagline}
              </span>
              <h1 className="mt-5 text-balance font-serif text-4xl font-semibold leading-tight text-background sm:text-6xl">
                Bàn tiệc đã sẵn sàng cho một buổi tối đáng nhớ
              </h1>
              <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-background/80 sm:text-lg">
                {RESTAURANT.name} là nhà hàng ẩm thực theo mùa tọa lạc tại trung tâm thành phố. Đặt bàn chỉ trong vài phút.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#reserve"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                  Đặt bàn ngay
                </a>
              </div>
            </div>

            {/* Right Column: Restaurant info overlay on desktop */}
            <div className="hidden md:block md:col-span-5">
              <RestaurantInfo glassTheme />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
