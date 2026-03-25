'use client';

import { Shield } from 'lucide-react';
import InsuranceManager from '@/components/InsuranceManager';

export default function ProducerInsurancePage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-blue-200 bg-black/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] md:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-600/15 p-3 text-blue-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Insurance</h1>
            <p className="mt-2 max-w-2xl text-blue-100/75">
              Upload and manage certificates, track expiration dates, and avoid last-minute booking friction.
            </p>
          </div>
        </div>
      </div>

      <InsuranceManager mode="dashboard" />
    </div>
  );
}
