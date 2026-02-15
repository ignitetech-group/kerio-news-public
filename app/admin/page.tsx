import { Suspense } from 'react';
import AdminDashboard from './AdminDashboard';

export const metadata = { title: 'Admin Dashboard - Kerio News' };
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
