'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import locations from '@/data/locations.json';

const PRODUCTION_TYPES = [
  { id: 'adult', label: 'Adult Content', icon: '🔞', description: 'Adult film, photography, content creation' },
  { id: 'events', label: 'Events & Gatherings', icon: '🎉', description: 'Parties, corporate events, celebrations' },
  { id: 'mainstream', label: 'Film & TV Production', icon: '🎬', description: 'Commercials, music videos, film, television' },
  { id: 'photo', label: 'Photography', icon: '📸', description: 'Fashion, editorial, product, lifestyle shoots' },
  { id: 'other', label: 'Other', icon: '✨', description: 'Something unique? Tell us about it' },
];

export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const location = locations.find((l: any) => l.id === propertyId || l.slug === propertyId);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productionType: '',
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    proposedPrice: '',
    priceType: 'hourly', // hourly or flat
    estimatedHours: '4',
    preferredDates: '',
    crewSize: '',
    description: '',
    specialRequirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!location) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Link href="/" className="mt-4 text-blue-600 underline">Back to listings</Link>
      </div>
    );
  }

  const pricing = (location as any).pricing;
  const suggestedRate = formData.productionType && pricing?.[formData.productionType]?.hourlyRate
    ? pricing[formData.productionType].hourlyRate
    : (location as any).pricePerHour || 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          ...formData,
          proposedPrice: parseFloat(formData.proposedPrice),
          estimatedHours: parseInt(formData.estimatedHours),
          crewSize: parseInt(formData.crewSize) || 0,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit bid. Please try again.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 text-6xl">🎉</div>
          <h1 className="mb-4 text-3xl font-bold">Bid Submitted!</h1>
          <p className="mb-2 text-gray-600">
            Your offer of <strong>${formData.proposedPrice}/{formData.priceType === 'hourly' ? 'hr' : 'flat'}</strong> has been sent to the property owner.
          </p>
          <p className="mb-8 text-gray-500">
            They&apos;ll review your proposal and respond within 24-48 hours. You&apos;ll receive an email at <strong>{formData.contactEmail}</strong> with their response.
          </p>
          <div className="space-y-3">
            <Link
              href={`/locations/${propertyId}`}
              className="block rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-blue-600"
            >
              Back to Property
            </Link>
            <Link href="/" className="block text-gray-500 underline">
              Browse More Locations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/locations/${propertyId}`} className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
          ← Back to {(location as any).name}
        </Link>
        <h1 className="text-3xl font-bold">Name Your Price</h1>
        <p className="mt-2 text-gray-600">
          Tell us about your project and make an offer. The property owner will review and respond.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Step 1: Production Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What type of production?</h2>
          <div className="space-y-3">
            {PRODUCTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setFormData({ ...formData, productionType: type.id });
                  setStep(2);
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:border-blue-600 hover:bg-blue-50 ${
                  formData.productionType === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Your Offer */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Make Your Offer</h2>

          {suggestedRate > 0 && (
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                💡 Suggested rate for {PRODUCTION_TYPES.find(t => t.id === formData.productionType)?.label}: <strong>${suggestedRate}/hr</strong>
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Your Proposed Price ($) *</label>
              <input
                type="number"
                value={formData.proposedPrice}
                onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Price Type</label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              >
                <option value="hourly">Per Hour</option>
                <option value="flat">Flat Rate (Full Day)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Estimated Hours *</label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Crew Size</label>
              <input
                type="number"
                value={formData.crewSize}
                onChange={(e) => setFormData({ ...formData, crewSize: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="Number of people"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Preferred Date(s)</label>
            <input
              type="text"
              value={formData.preferredDates}
              onChange={(e) => setFormData({ ...formData, preferredDates: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., April 15-16, or 'flexible'"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Describe Your Project *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="What are you shooting? What spaces do you need? Any special requirements?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Special Requirements</label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              rows={2}
              placeholder="Parking needs, noise levels, equipment, etc."
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="rounded-full border border-gray-200 px-6 py-3 hover:bg-gray-50">Back</button>
            <button
              onClick={() => {
                if (!formData.proposedPrice || !formData.description) {
                  alert('Please fill in your price and project description');
                  return;
                }
                setStep(3);
              }}
              className="flex-1 rounded-full bg-slate-950 px-6 py-3 text-white hover:bg-blue-600"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Info + Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Contact Info</h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Company / Production Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="Your production company"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Your Name *</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number *</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-gray-50 p-6">
            <h3 className="mb-3 font-semibold">Bid Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Property</span>
                <span className="font-medium">{(location as any).name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Production Type</span>
                <span className="font-medium">{PRODUCTION_TYPES.find(t => t.id === formData.productionType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Your Offer</span>
                <span className="font-medium text-green-600">
                  ${formData.proposedPrice}{formData.priceType === 'hourly' ? '/hr' : ' flat'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Hours</span>
                <span className="font-medium">{formData.estimatedHours}h</span>
              </div>
              {formData.priceType === 'hourly' && (
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Estimated Total</span>
                  <span className="font-bold text-lg">
                    ${(parseFloat(formData.proposedPrice) * parseInt(formData.estimatedHours)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="rounded-full border border-gray-200 px-6 py-3 hover:bg-gray-50">Back</button>
            <button
              onClick={() => {
                if (!formData.companyName || !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
                  alert('Please fill in all contact fields');
                  return;
                }
                handleSubmit();
              }}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid 🎯'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
