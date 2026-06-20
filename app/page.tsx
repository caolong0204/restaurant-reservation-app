import { Footer } from '@/components/home/footer'
import { Reserve } from '@/components/home/reserve'
import { SiteHeader } from '@/components/site-header'
import { getOperatingHoursSnapshot } from '@/lib/reservation-actions'
import { DEFAULT_WEEKLY_HOURS, formatOperatingHoursLabels } from '@/lib/restaurant'

export default async function HomePage() {
  const operatingHours = await getOperatingHoursSnapshot()
  const snapshot = operatingHours.ok
    ? operatingHours.data
    : {
        weeklyHours: DEFAULT_WEEKLY_HOURS,
        displaySettings: { showClosedDaysInFooter: false },
        footerLabels: formatOperatingHoursLabels(DEFAULT_WEEKLY_HOURS, false),
      }

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      <Reserve operatingHours={snapshot} />

      <Footer hourLabels={snapshot.footerLabels} />
    </main>
  )
}
