interface FeeComparisonProps {
  compact?: boolean;
}

const comparisonRows = [
  { platform: 'SetVenue', totalFee: '10% ✅', hostFee: '0%', guestFee: '10%' },
  { platform: 'Giggster', totalFee: '15-25%', hostFee: 'Varies', guestFee: 'Varies' },
  { platform: 'Peerspace', totalFee: '~20%', hostFee: 'Varies', guestFee: 'Varies' },
];

export default function FeeComparison({ compact = false }: FeeComparisonProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[#3B82F6] bg-white ${compact ? '' : 'shadow-2xl shadow-blue-500/10'}`}>
      <div className="border-b border-[#3B82F6] px-6 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[#3B82F6]">Fee comparison</p>
        <h3 className="mt-2 text-xl font-bold text-black">Transparent pricing beats mystery markups</h3>
        {!compact && (
          <p className="mt-2 text-sm text-black">
            We keep fees simple: hosts pay 0%, producers see a 10% service fee at checkout, and bookings start at $49.
          </p>
        )}
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-left text-sm text-black">
          <thead className="bg-white text-[#3B82F6]">
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
                className={row.platform === 'SetVenue' ? 'bg-white text-black' : 'border-t border-[#3B82F6] text-black'}
              >
                <td className={`px-6 py-4 font-semibold ${row.platform === 'SetVenue' ? 'text-[#3B82F6]' : 'text-black'}`}>{row.platform}</td>
                <td className="px-6 py-4">{row.totalFee}</td>
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
