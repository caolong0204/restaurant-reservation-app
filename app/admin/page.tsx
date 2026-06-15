import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin-dashboard'

export const metadata: Metadata = {
  title: 'Staff Dashboard | Maison Laurent',
  description: 'Manage reservations for Maison Laurent.',
}

export default function AdminPage() {
  return <AdminDashboard />
}
