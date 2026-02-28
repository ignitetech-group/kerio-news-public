import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export const metadata = { title: 'Admin Dashboard - Kerio News' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <AdminDashboard userEmail={session.user.email || ''} userName={session.user.name || ''} />
    </Suspense>
  );
}
