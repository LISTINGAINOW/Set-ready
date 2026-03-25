import { Suspense } from 'react';
import BookingInsuranceClient from './BookingInsuranceClient';

export default function BookingInsurancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8fb]" />}>
      <BookingInsuranceClient />
    </Suspense>
  );
}
