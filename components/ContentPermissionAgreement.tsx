'use client';

interface ContentPermissionAgreementProps {
  authorizedContentTypes: string[];
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  productionType: string;
}

const CONTENT_DESCRIPTIONS: Record<string, string> = {
  adult: 'Adult or sexually explicit content (as specifically authorized by the property owner)',
  violence: 'Depictions of violence, weapons, or combat scenarios',
  substances: 'Depictions of controlled substances, alcohol, or drug use',
  religious: 'Religious, political, or potentially controversial subject matter',
  minors: 'Content involving minors (requires additional consent and compliance with applicable laws)',
};

export default function ContentPermissionAgreement({
  authorizedContentTypes,
  accepted,
  onAcceptedChange,
  productionType,
}: ContentPermissionAgreementProps) {
  const hasSensitiveContent = authorizedContentTypes.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-sm text-slate-700 leading-relaxed">
        <h3 className="font-semibold text-slate-900 text-base">Content Permission Agreement</h3>

        <p>
          This Content Permission Agreement governs the types of content that may be produced at this property.
          The Property Owner has reviewed and pre-authorized the content types listed below. Producing any content
          not explicitly authorized constitutes a material breach of your rental agreement and may result in
          immediate termination of your booking without refund.
        </p>

        {hasSensitiveContent ? (
          <div className="space-y-3">
            <p className="font-semibold text-slate-900">Owner-Authorized Content Types</p>
            <p>The property owner has explicitly authorized the following content types for this location:</p>
            <ul className="space-y-2">
              {authorizedContentTypes.map((type) => (
                <li key={type} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-medium capitalize">{type}:</span>{' '}
                    {CONTENT_DESCRIPTIONS[type] ?? type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-amber-800 font-medium">Standard Content Only</p>
            <p className="text-amber-700 mt-1">
              This property is authorized for standard production content only. No adult, violent, or other
              sensitive content types have been pre-authorized by the owner for this location.
            </p>
          </div>
        )}

        <p className="font-semibold text-slate-900">Renter Acknowledgments</p>
        <p>By checking the box below, the Renter acknowledges and agrees that:</p>
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>
            The production type listed (&ldquo;{productionType || 'Not specified'}&rdquo;) accurately describes the
            content to be produced.
          </li>
          <li>
            No content will be produced at the property that has not been explicitly authorized by the owner and
            disclosed in this booking request.
          </li>
          <li>
            The Renter is solely responsible for obtaining all necessary permits, model releases, location
            releases, music licenses, and any other rights or permissions required for the production.
          </li>
          <li>
            Any content involving minors will comply with all applicable child labor laws, require written
            parental or guardian consent, and maintain appropriate adult supervision at all times.
          </li>
          <li>
            SetVenue is not responsible for reviewing, approving, or taking any liability for the content
            produced on the property.
          </li>
          <li>
            The Renter will indemnify and hold harmless SetVenue and the Owner from any claims arising out of
            the content produced, including but not limited to claims related to defamation, invasion of privacy,
            right of publicity, copyright infringement, or obscenity.
          </li>
        </ol>

        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-red-800 font-semibold text-xs uppercase tracking-wide mb-1">Strictly Prohibited at All Properties</p>
          <p className="text-red-700 text-xs">
            Regardless of any other authorization, the following are prohibited at all SetVenue properties:
            non-consensual filming of individuals, illegal content of any kind, content that violates federal
            or state obscenity laws, and any production activity not disclosed in this booking request.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
            ${accepted
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-slate-300 group-hover:border-blue-400'
            }`}
          >
            {accepted && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-slate-700 leading-snug">
          I have read and agree to the{' '}
          <span className="font-semibold text-slate-900">Content Permission Agreement</span>.
          I confirm that the production described accurately reflects the content I will produce and that I will
          comply with all content restrictions for this property.
        </span>
      </label>
    </div>
  );
}
