interface FeeComparisonProps {
  compact?: boolean;
}

const comparisonRows = [
  { platform: 'SetVenue', totalFee: '10%', hostFee: '0%', guestFee: '10%' },
  { platform: 'Giggster', totalFee: '15-25%', hostFee: 'Varies', guestFee: 'Varies' },
  { platform: 'Peerspace', totalFee: '~20%', hostFee: 'Varies', guestFee: 'Varies' },
];

export default function FeeComparison({ compact = false }: FeeComparisonProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${compact ? '' : 'shadow-2xl shadow-slate-900/5'}`}>
      <div className="border-b border-slate-200 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fee comparison</p>
        <h3 className="mt-2 text-xl font-bold text-black">Transparent pricing beats mystery markups</h3>
        {!compact && (
          <p className="mt-2 text-sm text-slate-700">
            We keep fees simple: hosts pay 0%, producers see a 10% service fee at checkout, and bookings start at $49.
          </p>
        )}
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-left text-sm text-slate-800">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Platform</th>
              <th className="px-6 py-4 font-medium">Total Fee</th>
              <th className="px-6 py-4 font-medium">Host Fee</th>
              <th className="px-6 py-4 font-medium">Guest Fee</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr
                key={row.platform}
                className={row.platform === 'SetVenue' ? 'bg-slate-50 text-slate-900' : 'border-t border-slate-200 text-slate-800'}
              >
                <td className={`px-6 py-4 ${row.platform === 'SetVenue' ? 'font-semibold text-slate-900' : 'font-normal text-slate-900'}`}>{row.platform}</td>
                <td className={`px-6 py-4 ${row.platform === 'SetVenue' ? 'font-semibold text-slate-900' : 'font-normal text-slate-800'}`}>{row.totalFee}</td>
                <td className="px-6 py-4">{row.hostFee}</td>
                <td className="px-6 py-4">{row.guestFee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
