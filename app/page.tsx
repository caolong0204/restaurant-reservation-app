import { Footer } from '@/components/home/footer'
import { Hero } from '@/components/home/hero'
import { Reserve } from '@/components/home/reserve'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      {/* Hero Header Section */}
      <Hero />

      {/* Table Reservation Section */}
      <Reserve />

      {/* Site Footer */}
      <Footer />
    </main>
  )
}
