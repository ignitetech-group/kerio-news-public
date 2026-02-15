import { Suspense } from 'react';
import CallerIdLookup from './CallerIdLookup';

export const metadata = {
  title: 'Caller ID for e-mail | Kerio Technologies',
};

export default function CallerIdPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallerIdLookup />
    </Suspense>
  );
}
