import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin-dashboard'

export const metadata: Metadata = {
  title: 'Staff Dashboard | Flambé',
  description: 'Manage reservations for Flambé.',
}

export default function AdminPage() {
  return <AdminDashboard />
}
