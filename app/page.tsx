import { Footer } from '@/components/home/footer'
import { Reserve } from '@/components/home/reserve'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      <Reserve />

      <Footer />
    </main>
  )
}
