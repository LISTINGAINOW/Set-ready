'use client';

interface HoldHarmlessAgreementProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export default function HoldHarmlessAgreement({ accepted, onAcceptedChange }: HoldHarmlessAgreementProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 max-h-72 overflow-y-auto text-sm text-slate-700 leading-relaxed space-y-4">
        <h3 className="font-semibold text-slate-900 text-base">Hold Harmless &amp; Indemnification Agreement</h3>

        <p>
          This Hold Harmless and Indemnification Agreement (&ldquo;Agreement&rdquo;) is entered into between the
          Renter (the party booking the property), the Property Owner (&ldquo;Owner&rdquo;), and SetVenue, Inc.
          (&ldquo;SetVenue&rdquo;), a marketplace platform facilitating connections between property owners and renters.
          By proceeding with a booking, the Renter agrees to all terms set forth herein.
        </p>

        <p className="font-semibold text-slate-900">1. SetVenue is a Marketplace Platform Only</p>
        <p>
          SetVenue operates solely as a marketplace and technology platform that connects property owners with
          renters. SetVenue is not a party to the rental transaction, does not own, manage, control, or inspect any
          listed property, and assumes no responsibility for the condition, safety, legality, or suitability of any
          property listed on the platform. All rental agreements are solely between the Renter and the Owner.
        </p>

        <p className="font-semibold text-slate-900">2. Renter Indemnification of SetVenue</p>
        <p>
          The Renter agrees to indemnify, defend, and hold harmless SetVenue, its officers, directors, employees,
          agents, affiliates, successors, and assigns (collectively &ldquo;SetVenue Parties&rdquo;) from and against
          any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney&rsquo;s
          fees) arising out of or related to: (a) the Renter&rsquo;s use or occupancy of any property booked through
          SetVenue; (b) any property damage caused by the Renter, its employees, agents, contractors, cast, crew, or
          guests; (c) any personal injury or bodily harm sustained by the Renter or any third party on the property;
          (d) the Renter&rsquo;s production activities, including but not limited to filming, photography, events,
          and related activities; (e) the Renter&rsquo;s violation of any applicable law, regulation, permit
          requirement, or ordinance; and (f) any third-party claims arising from content produced on the property.
        </p>

        <p className="font-semibold text-slate-900">3. Owner Indemnification of SetVenue</p>
        <p>
          The Property Owner agrees to indemnify, defend, and hold harmless the SetVenue Parties from and against
          any and all claims, liabilities, damages, losses, costs, and expenses arising out of or related to:
          (a) the Owner&rsquo;s listing of the property, including any misrepresentation of the property&rsquo;s
          condition, features, or availability; (b) any defect, hazard, or dangerous condition on or in the
          property; (c) the Owner&rsquo;s failure to maintain the property in a safe and habitable condition;
          and (d) the Owner&rsquo;s violation of any applicable law, regulation, or permit requirement.
        </p>

        <p className="font-semibold text-slate-900">4. Assumption of Risk</p>
        <p>
          The Renter expressly acknowledges and assumes all risks associated with the use and occupancy of the
          property. This includes, but is not limited to, risks associated with production activities, equipment
          use, structural conditions of the property, weather, and the presence of third parties. The Renter
          represents that it has conducted or will conduct an independent inspection of the property prior to
          commencing any activity.
        </p>

        <p className="font-semibold text-slate-900">5. Property Damage</p>
        <p>
          The Renter shall be solely responsible for any and all damage to the property, its contents, fixtures,
          and surrounding areas caused by the Renter, its employees, agents, contractors, cast, crew, vendors, or
          guests. The Renter agrees to promptly notify the Owner of any damage and to cooperate fully in any
          damage assessment. The Renter&rsquo;s liability for damage is not limited to the damage deposit amount.
        </p>

        <p className="font-semibold text-slate-900">6. Insurance Requirements</p>
        <p>
          The Renter represents and warrants that it maintains, and shall maintain throughout the rental period,
          commercial general liability insurance with a minimum combined single limit of $1,000,000 per occurrence
          and $2,000,000 in the aggregate, naming the Owner and SetVenue as additional insureds. The Renter shall
          provide a valid Certificate of Insurance (COI) prior to commencement of the booking. Failure to maintain
          required insurance shall constitute a material breach of this Agreement.
        </p>

        <p className="font-semibold text-slate-900">7. Third-Party Claims</p>
        <p>
          The Renter shall defend, indemnify, and hold harmless the Owner and SetVenue Parties against any
          third-party claims arising from the Renter&rsquo;s production, including claims by talent, crew members,
          visitors, bystanders, or any person who enters the property at the Renter&rsquo;s invitation or direction.
          This includes claims related to intellectual property, right of publicity, defamation, and any content
          created or distributed in connection with the rental.
        </p>

        <p className="font-semibold text-slate-900">8. Governing Law</p>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of the state in which the
          property is located, without regard to conflict of law principles. Any dispute arising under this
          Agreement shall be resolved by binding arbitration under the rules of the American Arbitration
          Association, except that either party may seek injunctive or equitable relief in a court of competent
          jurisdiction.
        </p>

        <p className="font-semibold text-slate-900">9. Severability</p>
        <p>
          If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions
          shall continue in full force and effect. The parties agree that any invalid provision shall be modified
          to the minimum extent necessary to make it valid and enforceable.
        </p>
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
          <span className="font-semibold text-slate-900">Hold Harmless &amp; Indemnification Agreement</span>.
          I understand that I am assuming responsibility for property damage, personal injury, and third-party
          claims arising from my rental and production activities.
        </span>
      </label>
    </div>
  );
}
