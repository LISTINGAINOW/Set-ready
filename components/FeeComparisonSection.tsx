import { CheckCircle, XCircle } from 'lucide-react';

type Platform = {
  name: string;
  hostFee: string;
  renterFee: string;
  hostFeeOk: boolean;
  renterFeeOk: boolean;
  highlight?: boolean;
};

const platforms: Platform[] = [
  {
    name: 'SetVenue',
    hostFee: '0%',
    renterFee: '10%',
    hostFeeOk: true,
    renterFeeOk: true,
    highlight: true,
  },
  {
    name: 'Giggster',
    hostFee: '15–25%',
    renterFee: '15–25%',
    hostFeeOk: false,
    renterFeeOk: false,
  },
  {
    name: 'Peerspace',
    hostFee: '~20%',
    renterFee: '~20%',
    hostFeeOk: false,
    renterFeeOk: false,
  },
];

export default function FeeComparisonSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Transparent Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Keep more of what you earn.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            SetVenue charges zero fees to hosts. Renters pay just 10% — roughly half what other platforms charge.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-8 py-5 text-sm font-semibold tracking-[-0.02em] text-slate-500">Platform</th>
                <th className="px-8 py-5 text-sm font-semibold tracking-[-0.02em] text-slate-500">Host Fee</th>
                <th className="px-8 py-5 text-sm font-semibold tracking-[-0.02em] text-slate-500">Renter Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {platforms.map((p) => (
                <tr
                  key={p.name}
                  className={p.highlight ? 'bg-blue-50/40' : ''}
                >
                  <td className="px-8 py-5">
                    <span
                      className={`text-base font-semibold tracking-[-0.04em] ${
                        p.highlight ? 'text-blue-600' : 'text-slate-950'
                      }`}
                    >
                      {p.name}
                      {p.highlight && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          Best Value
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 text-base font-semibold tracking-[-0.04em] text-slate-950">
                      {p.hostFeeOk ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-blue-500" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-slate-300" />
                      )}
                      {p.hostFee}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 text-base font-semibold tracking-[-0.04em] text-slate-950">
                      {p.renterFeeOk ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-blue-500" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-slate-300" />
                      )}
                      {p.renterFee}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-4 md:hidden">
          {platforms.map((p) => (
            <div
              key={p.name}
              className={`rounded-[28px] border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] ${
                p.highlight
                  ? 'border-blue-200 bg-blue-50/40'
                  : 'border-black/8 bg-white'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`text-lg font-semibold tracking-[-0.04em] ${
                    p.highlight ? 'text-blue-600' : 'text-slate-950'
                  }`}
                >
                  {p.name}
                </span>
                {p.highlight && (
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Best Value
                  </span>
                )}
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Host Fee</p>
                  <span className="inline-flex items-center gap-1.5 text-base font-semibold tracking-[-0.04em] text-slate-950">
                    {p.hostFeeOk ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    {p.hostFee}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Renter Fee</p>
                  <span className="inline-flex items-center gap-1.5 text-base font-semibold tracking-[-0.04em] text-slate-950">
                    {p.renterFeeOk ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    {p.renterFee}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
