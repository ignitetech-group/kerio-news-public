import { Suspense } from 'react';
import KickboxForm from './KickboxForm';

export const metadata = {
  title: 'Kickbox Verifier UI Demo',
};

export default function KickboxPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KickboxForm />
    </Suspense>
  );
}
