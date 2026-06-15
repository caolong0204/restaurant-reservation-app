import Image from 'next/image'
import { Clock, MapPin, Phone, Star } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { BookingForm } from '@/components/booking-form'
import { MenuSection } from '@/components/menu-section'
import { RESTAURANT } from '@/lib/restaurant'

const HIGHLIGHTS = [
  {
    title: 'Seasonal tasting menus',
    body: 'A rotating selection built around what our growers harvest each week.',
  },
  {
    title: 'Thoughtful wine pairings',
    body: 'A cellar of small-production bottles, poured to complement every course.',
  },
  {
    title: 'An intimate dining room',
    body: 'Forty seats, warm candlelight, and a kitchen you can watch at work.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          <Image
            src="/restaurant-hero.png"
            alt="The candlelit dining room at Maison Laurent"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/45 to-foreground/30" />

          <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-4 sm:px-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-3 py-1 text-sm text-background backdrop-blur">
                <Star className="size-3.5 fill-accent text-accent" />
                {RESTAURANT.tagline}
              </span>
              <h1 className="mt-5 text-balance font-serif text-4xl font-semibold leading-tight text-background sm:text-6xl">
                A table set for an evening worth remembering
              </h1>
              <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-background/80 sm:text-lg">
                {RESTAURANT.name} is a seasonal restaurant in the heart of the
                city. Reserve your table in just a few moments.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#reserve"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                  Reserve a table
                </a>
                <a
                  href="#menu"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-background/40 bg-background/5 px-6 text-sm font-medium text-background backdrop-blur transition-colors hover:bg-background/15"
                >
                  View the menu
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            The experience
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Cooking guided by the seasons, served with quiet care
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <div key={item.title} className="flex flex-col gap-3">
              <span className="font-serif text-3xl text-primary/40">
                0{i + 1}
              </span>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <MenuSection />

      {/* Reserve */}
      <section id="reserve" className="scroll-mt-20 bg-secondary/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div id="visit" className="scroll-mt-20">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Reservations
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Book your table
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
              We accept reservations up to 60 days in advance. For parties
              larger than eight, please give us a call and we will arrange
              something special.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Find us</p>
                  <p className="text-sm text-muted-foreground">
                    {RESTAURANT.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Hours</p>
                  <p className="text-sm text-muted-foreground">
                    {RESTAURANT.hours}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Call</p>
                  <p className="text-sm text-muted-foreground">
                    {RESTAURANT.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <BookingForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p className="font-serif text-base font-semibold text-foreground">
            {RESTAURANT.name}
          </p>
          <p>{RESTAURANT.address}</p>
          <p>
            &copy; {new Date().getFullYear()} {RESTAURANT.name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
