'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarDays, Check, DollarSign, Home, ImagePlus, Info, Lock, Save } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import FeeComparison from '@/components/FeeComparison';
import { sanitizeInput } from '@/lib/client-security';

const DRAFT_KEY = 'setvenue-host-onboarding-draft';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 20;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const propertyTypes = ['House', 'Apartment', 'Studio', 'Loft', 'Penthouse', 'Outdoor', 'Villa', 'Warehouse'];
const amenitiesList = ['Parking', 'Wifi', 'Lighting', 'Changing room', 'Shower', 'Kitchen', 'Pool', 'Sound system'];
const privacyLevelOptions = ['Public', 'Production', 'NDA Required'] as const;
const bookingModeOptions = [
  { value: 'instant', label: 'Instant book', description: 'Faster conversion for hosts comfortable with immediate confirmations.' },
  { value: 'request', label: 'Request to book', description: 'More control for hosts who want to review each request first.' },
] as const;

const steps = [
  { id: 1, label: 'Basic Info', description: 'Title, type, and location basics' },
  { id: 2, label: 'Details', description: 'Size, rooms, and amenities' },
  { id: 3, label: 'Photos', description: 'Upload polished images of the space' },
  { id: 4, label: 'Pricing', description: 'Rates, fees, and payout details' },
  { id: 5, label: 'Availability', description: 'When the property can be booked' },
  { id: 6, label: 'Review & Submit', description: 'Final check before submission' },
] as const;

type FormState = {
  title: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  maxCapacity: string;
  privacyLevel: string;
  bookingMode: 'instant' | 'request';
  amenities: string[];
  baseRate: string;
  cleaningFee: string;
  securityDeposit: string;
  availabilityNotes: string;
  availableDays: string[];
  photos: { name: string; size: number; type: string }[];
};

const initialForm: FormState = {
  title: '',
  propertyType: '',
  address: '',
  city: '',
  state: '',
  description: '',
  bedrooms: '',
  bathrooms: '',
  maxCapacity: '',
  privacyLevel: 'Production',
  bookingMode: 'request',
  amenities: [],
  baseRate: '',
  cleaningFee: '',
  securityDeposit: '',
  availabilityNotes: '',
  availableDays: [],
  photos: [],
};

const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ListPropertyPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const inputClassName =
    'min-h-[48px] w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-black outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/15';
  const cardClassName = 'rounded-[24px] border-2 border-black bg-white p-5 sm:p-8';

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const parsed = JSON.parse(rawDraft) as FormState;
      setForm({ ...initialForm, ...parsed });
      setStatusMessage('Draft restored from this browser.');
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setStatusMessage('Draft saved locally.');
  };

  const progressPercent = useMemo(() => Math.round((currentStep / steps.length) * 100), [currentStep]);

  const updateField = (field: keyof FormState, value: string | string[] | FormState['photos']) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleArrayItem = (field: 'amenities' | 'availableDays', item: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((entry) => entry !== item) : [...prev[field], item],
    }));
  };

  const validateStep = (stepNumber: number) => {
    const nextErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!form.title.trim()) nextErrors.title = 'Title is required.';
      if (!form.propertyType) nextErrors.propertyType = 'Property type is required.';
      if (!form.address.trim()) nextErrors.address = 'Address is required.';
      if (!form.city.trim()) nextErrors.city = 'City is required.';
      if (!form.state.trim()) nextErrors.state = 'State is required.';
    }

    if (stepNumber === 2) {
      if (!form.bedrooms || Number(form.bedrooms) < 0) nextErrors.bedrooms = 'Enter bedrooms.';
      if (!form.bathrooms || Number(form.bathrooms) < 0) nextErrors.bathrooms = 'Enter bathrooms.';
      if (!form.maxCapacity || Number(form.maxCapacity) < 1) nextErrors.maxCapacity = 'Capacity must be at least 1.';
      if (!form.description.trim()) nextErrors.description = 'Add a short description.';
    }

    if (stepNumber === 3 && form.photos.length === 0) {
      nextErrors.photos = 'Upload at least one valid image.';
    }

    if (stepNumber === 4) {
      if (!form.baseRate || Number(form.baseRate) < 0) nextErrors.baseRate = 'Base rate is required.';
      if (form.cleaningFee && Number(form.cleaningFee) < 0) nextErrors.cleaningFee = 'Cleaning fee cannot be negative.';
      if (form.securityDeposit && Number(form.securityDeposit) < 0) nextErrors.securityDeposit = 'Deposit cannot be negative.';
    }

    if (stepNumber === 5) {
      if (form.availableDays.length === 0) nextErrors.availableDays = 'Pick at least one available day.';
      if (!form.availabilityNotes.trim()) nextErrors.availabilityNotes = 'Add basic availability notes.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    setStatusMessage('');
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setStatusMessage('');
  };

  const sanitizePhotoFiles = (files: FileList | null) => {
    if (!files) return;

    const accepted = Array.from(files)
      .slice(0, MAX_FILES)
      .filter((file) => ACCEPTED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES)
      .map((file) => ({ name: sanitizeInput(file.name), size: file.size, type: file.type }));

    updateField('photos', accepted);

    if (accepted.length === 0) {
      setErrors((prev) => ({
        ...prev,
        photos: 'Only JPG, PNG, GIF, or WEBP files up to 5MB are allowed. Executables and oversized files are blocked.',
      }));
      return;
    }

    setStatusMessage(`${accepted.length} photo${accepted.length === 1 ? '' : 's'} ready for review.`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep(5)) {
      setCurrentStep(5);
      return;
    }

    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setCurrentStep(6);
    setStatusMessage('Review complete. Final submission is still demo-only.');
  };

  const renderError = (field: string) =>
    errors[field] ? <p className="mt-2 text-sm text-red-600">{errors[field]}</p> : null;

  return (
    <AuthGuard
      unverifiedTitle="Verify your email to list properties"
      unverifiedMessage="You need a verified account before you can submit a property listing. Check your inbox for the verification link, then come back here."
    >
      <div className="overflow-x-hidden bg-[#F9FAFB]">
        <div className="mx-auto max-w-6xl px-4 py-8 text-black sm:py-10">
          <div className="mb-10 rounded-[24px] border-2 border-[#3B82F6] bg-white p-5 shadow-[0_20px_60px_rgba(59,130,246,0.08)] sm:mb-12 sm:rounded-[28px] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6] bg-white px-4 py-2 text-sm font-semibold text-[#3B82F6]">
                  <Home className="h-4 w-4" />
                  Host onboarding
                </div>
                <h1 className="mb-4 mt-5 text-4xl font-bold text-[#111111] sm:text-5xl">List Your Property</h1>
                <p className="max-w-3xl text-base text-[#222222] sm:text-lg">
                  List for free, keep 100%, and get live in about 8–10 minutes if you have your photos and pricing ready.
                </p>
              </div>
              <div className="rounded-2xl border border-black bg-[#F9FAFB] p-5 lg:w-[320px]">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-[#3B82F6] transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-3 text-sm text-black/70">Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}</p>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-black px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save draft
                </button>
              </div>
            </div>
          </div>

          <div className="mb-10 overflow-hidden rounded-2xl">
            <FeeComparison />
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id <= currentStep || validateStep(currentStep)) setCurrentStep(step.id);
                }}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  step.id === currentStep ? 'border-[#3B82F6] bg-blue-50' : 'border-black bg-white'
                }`}
              >
                <div className="text-sm font-semibold">Step {step.id}</div>
                <div className="mt-1 text-lg font-bold">{step.label}</div>
                <div className="mt-1 text-sm text-black/65">{step.description}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <Home className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Basic Info</h2>
                    <p className="text-sm text-black/65">Start with the headline details guests see first.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Property title</label>
                    <input className={inputClassName} value={form.title} onChange={(e) => updateField('title', sanitizeInput(e.target.value))} placeholder="Modern hillside villa with sunset views" />
                    <p className="mt-2 text-sm text-black/60">Make it specific and searchable.</p>
                    {renderError('title')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Property type</label>
                    <select className={inputClassName} value={form.propertyType} onChange={(e) => updateField('propertyType', e.target.value)}>
                      <option value="">Select type</option>
                      {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <p className="mt-2 text-sm text-black/60">Choose the closest match.</p>
                    {renderError('propertyType')}
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Address</label>
                    <input className={inputClassName} value={form.address} onChange={(e) => updateField('address', sanitizeInput(e.target.value))} placeholder="1234 Laurel Canyon Blvd" />
                    <p className="mt-2 text-sm text-black/60">Use the real address so bookings and insurance checks line up later.</p>
                    {renderError('address')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">City</label>
                    <input className={inputClassName} value={form.city} onChange={(e) => updateField('city', sanitizeInput(e.target.value))} placeholder="Los Angeles" />
                    {renderError('city')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">State</label>
                    <input className={inputClassName} value={form.state} onChange={(e) => updateField('state', sanitizeInput(e.target.value))} placeholder="CA" />
                    {renderError('state')}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <Lock className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Details</h2>
                    <p className="text-sm text-black/65">Add operational details that help bookings close faster.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Bedrooms</label>
                    <input type="number" min="0" className={inputClassName} value={form.bedrooms} onChange={(e) => updateField('bedrooms', e.target.value)} />
                    <p className="mt-2 text-sm text-black/60">Use 0 for open-plan spaces.</p>
                    {renderError('bedrooms')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Bathrooms</label>
                    <input type="number" min="0" step="0.5" className={inputClassName} value={form.bathrooms} onChange={(e) => updateField('bathrooms', e.target.value)} />
                    {renderError('bathrooms')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Max capacity</label>
                    <input type="number" min="1" className={inputClassName} value={form.maxCapacity} onChange={(e) => updateField('maxCapacity', e.target.value)} />
                    <p className="mt-2 text-sm text-black/60">Think realistic working capacity, not squeeze-the-room capacity.</p>
                    {renderError('maxCapacity')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Privacy level</label>
                    <select className={inputClassName} value={form.privacyLevel} onChange={(e) => updateField('privacyLevel', e.target.value)}>
                      {privacyLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <p className="mt-2 text-sm text-black/60">Public shows normal listing info. Production hides the address. NDA Required adds a legal gate before reveal.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Description</label>
                    <textarea rows={5} className={`${inputClassName} min-h-[140px]`} value={form.description} onChange={(e) => updateField('description', sanitizeInput(e.target.value))} placeholder="Natural light, clean sightlines, easy load-in, quiet street..." />
                    <p className="mt-2 text-sm text-black/60">Describe what makes the property useful for productions or stays.</p>
                    {renderError('description')}
                  </div>
                </div>
                <div className="mt-8">
                  <label className="mb-3 block text-sm font-medium">Amenities</label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {amenitiesList.map((amenity) => (
                      <label key={amenity} className="flex min-h-[48px] cursor-pointer items-center rounded-lg border-2 border-black bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input type="checkbox" checked={form.amenities.includes(amenity)} onChange={() => toggleArrayItem('amenities', amenity)} className="mr-3 accent-blue-500" />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <ImagePlus className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Photos</h2>
                    <p className="text-sm text-black/65">Executable files are blocked. Images only, max 5MB each.</p>
                  </div>
                </div>

                <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES.join(',')} multiple className="hidden" onChange={(e) => sanitizePhotoFiles(e.target.files)} />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    sanitizePhotoFiles(e.dataTransfer.files);
                  }}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-12 ${isDragging ? 'border-blue-500 bg-white' : 'border-black bg-white'}`}
                >
                  <ImagePlus className="mx-auto mb-6 h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />
                  <p className="mb-2 text-lg font-semibold text-black sm:text-xl">Drag photos here or click to browse</p>
                  <p className="text-sm text-black/60">JPG, PNG, GIF, or WEBP only. Up to {MAX_FILES} files, 5MB max per file.</p>
                </div>

                {renderError('photos')}

                {form.photos.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-black bg-[#F9FAFB] p-4">
                    <h3 className="font-semibold">Ready for upload</h3>
                    <ul className="mt-3 space-y-2 text-sm text-black/70">
                      {form.photos.map((photo) => (
                        <li key={`${photo.name}-${photo.size}`} className="flex items-center justify-between gap-3">
                          <span className="truncate">{photo.name}</span>
                          <span>{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {currentStep === 4 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <DollarSign className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Pricing</h2>
                    <p className="text-sm text-black/65">Set simple numbers now. You can refine them later.</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-3">
                    <label className="mb-3 block text-sm font-medium">Booking flow</label>
                    <div className="grid gap-4 md:grid-cols-2">
                      {bookingModeOptions.map((option) => (
                        <label key={option.value} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${form.bookingMode === option.value ? 'border-[#3B82F6] bg-blue-50' : 'border-black bg-white'}`}>
                          <input type="radio" name="bookingMode" value={option.value} checked={form.bookingMode === option.value} onChange={() => updateField('bookingMode', option.value)} className="sr-only" />
                          <p className="font-semibold text-black">{option.label}</p>
                          <p className="mt-2 text-sm text-black/65">{option.description}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Base rate</label>
                    <input type="number" min="0" step="0.01" className={inputClassName} value={form.baseRate} onChange={(e) => updateField('baseRate', e.target.value)} placeholder="250" />
                    <p className="mt-2 text-sm text-black/60">Your starting nightly or booking rate. Listing is free — you keep 100% of your base rate.</p>
                    {renderError('baseRate')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Cleaning fee</label>
                    <input type="number" min="0" step="0.01" className={inputClassName} value={form.cleaningFee} onChange={(e) => updateField('cleaningFee', e.target.value)} placeholder="75" />
                    {renderError('cleaningFee')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Security deposit</label>
                    <input type="number" min="0" step="0.01" className={inputClassName} value={form.securityDeposit} onChange={(e) => updateField('securityDeposit', e.target.value)} placeholder="500" />
                    {renderError('securityDeposit')}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 5 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <CalendarDays className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Availability</h2>
                    <p className="text-sm text-black/65">Give a simple weekly pattern and any restrictions.</p>
                  </div>
                </div>
                <div className="grid gap-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium">Available days</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                      {dayOptions.map((day) => (
                        <label key={day} className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border-2 border-black bg-white p-3 text-black transition hover:border-blue-500">
                          <input type="checkbox" checked={form.availableDays.includes(day)} onChange={() => toggleArrayItem('availableDays', day)} className="mr-2 accent-blue-500" />
                          {day}
                        </label>
                      ))}
                    </div>
                    {renderError('availableDays')}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Availability notes</label>
                    <textarea rows={5} className={`${inputClassName} min-h-[140px]`} value={form.availabilityNotes} onChange={(e) => updateField('availabilityNotes', sanitizeInput(e.target.value))} placeholder="Example: Weekdays after 10am, no same-day bookings, 2-hour notice minimum." />
                    <p className="mt-2 text-sm text-black/60">This acts like a lightweight calendar until full syncing exists.</p>
                    {renderError('availabilityNotes')}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 6 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <Check className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Review & Submit</h2>
                    <p className="text-sm text-black/65">Quick final pass before this turns into a real submission flow.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black bg-[#F9FAFB] p-4">
                    <h3 className="font-semibold">Basic Info</h3>
                    <p className="mt-2 text-sm text-black/70">{form.title || '—'} · {form.propertyType || '—'}</p>
                    <p className="text-sm text-black/70">{form.address || '—'}, {form.city || '—'}, {form.state || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-black bg-[#F9FAFB] p-4">
                    <h3 className="font-semibold">Details</h3>
                    <p className="mt-2 text-sm text-black/70">{form.bedrooms || '0'} bed · {form.bathrooms || '0'} bath · {form.maxCapacity || '0'} guests</p>
                    <p className="text-sm text-black/70">Privacy: {form.privacyLevel} · Booking: {form.bookingMode === 'instant' ? 'Instant book' : 'Request to book'}</p>
                    <p className="text-sm text-black/70">Amenities: {form.amenities.join(', ') || 'None selected'}</p>
                  </div>
                  <div className="rounded-2xl border border-black bg-[#F9FAFB] p-4">
                    <h3 className="font-semibold">Photos</h3>
                    <p className="mt-2 text-sm text-black/70">{form.photos.length} validated image file(s) selected.</p>
                  </div>
                  <div className="rounded-2xl border border-black bg-[#F9FAFB] p-4">
                    <h3 className="font-semibold">Pricing & availability</h3>
                    <p className="mt-2 text-sm text-black/70">Base rate: ${form.baseRate || '0'} · Cleaning: ${form.cleaningFee || '0'} · Deposit: ${form.securityDeposit || '0'}</p>
                    <p className="text-sm text-black/70">Days: {form.availableDays.join(', ') || 'None selected'}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5" />
                    <p>This screen is production-ready for onboarding UX, draft saves, and upload validation. Final server-side listing submission is still a demo stub.</p>
                  </div>
                </div>
              </section>
            )}

            {statusMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {statusMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-black px-6 py-3 font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-black px-6 py-3 font-semibold transition hover:bg-black hover:text-white"
                >
                  Save draft
                </button>
                {currentStep < 5 && (
                  <button type="button" onClick={goNext} className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 font-semibold text-white transition hover:bg-blue-600">
                    Continue
                  </button>
                )}
                {currentStep === 5 && (
                  <button type="submit" className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 font-semibold text-white transition hover:bg-blue-600">
                    Review submission
                  </button>
                )}
              </div>
            </div>
          </form>

          <section className="mt-10 rounded-3xl border-2 border-black bg-white p-5 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">Security guardrails built in</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-black/75">
                  <li>• Inputs are sanitized before draft storage.</li>
                  <li>• Photo picker only accepts image MIME types.</li>
                  <li>• Files over 5MB are rejected before they enter the flow.</li>
                  <li>• Executable uploads are blocked because they never match the allowlist.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
