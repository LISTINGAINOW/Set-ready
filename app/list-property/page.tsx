'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarDays, Check, DollarSign, Home, ImagePlus, Info, Lock, Save, Shield } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import FeeComparison from '@/components/FeeComparison';
import { sanitizeInput } from '@/lib/client-security';

const DRAFT_KEY = 'setvenue-host-onboarding-draft';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 20;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
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
  { id: 6, label: 'Verification & Legal', description: 'Documents and legal agreements' },
  { id: 7, label: 'Review & Submit', description: 'Final check before submission' },
] as const;

const businessLicenseTypes = ['STR', 'Event Venue', 'Commercial'] as const;

const complianceChecklistItems = [
  'STR permit on file',
  'TOT registration current',
  'Liability insurance verified',
  'Fire safety inspection passed',
  'Parking and signage compliant with local code',
  'No outstanding code violations',
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
  // Compliance fields
  totLicenseNumber: string;
  businessLicenseNumber: string;
  businessLicenseType: string;
  hasLiabilityInsurance: boolean;
  hasProductionInsurance: boolean;
  complianceChecklist: string[];
  // Legal agreements
  ownershipCertified: boolean;
  ownerAgreementAccepted: boolean;
  insuranceConfirmed: boolean;
  indemnificationAccepted: boolean;
  reviewAcknowledged: boolean;
  // New legal fields
  ageVerified: boolean;
  propertyConditionDisclosed: boolean;
  zoningCompliant: boolean;
  rightToList: boolean;
  contentUsageRights: boolean;
  neighborAcknowledged: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  cancellationPolicy: string;
  cancellationAccepted: boolean;
  parkingSpots: string;
  loadInAccess: string;
  accessInstructions: string;
  propertyManagerName: string;
  propertyManagerPhone: string;
  contentPermissions: string[];
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
  totLicenseNumber: '',
  businessLicenseNumber: '',
  businessLicenseType: '',
  hasLiabilityInsurance: false,
  hasProductionInsurance: false,
  complianceChecklist: [],
  ownershipCertified: false,
  ownerAgreementAccepted: false,
  insuranceConfirmed: false,
  indemnificationAccepted: false,
  reviewAcknowledged: false,
  ageVerified: false,
  propertyConditionDisclosed: false,
  zoningCompliant: false,
  rightToList: false,
  contentUsageRights: false,
  neighborAcknowledged: false,
  emergencyContactName: '',
  emergencyContactPhone: '',
  cancellationPolicy: '',
  cancellationAccepted: false,
  parkingSpots: '',
  loadInAccess: '',
  accessInstructions: '',
  propertyManagerName: '',
  propertyManagerPhone: '',
  contentPermissions: [
    'Mainstream Film & Television',
    'Commercial & Advertising',
    'Music Videos',
    'Photo Shoots',
    'Events & Private Parties',
    'Student & Independent Film',
    'Social Media & Influencer Content',
    'Corporate Events & Meetings',
    'Wedding & Special Occasions',
    // Adult Entertainment (18+) is off by default — owners must explicitly opt in
  ],
};

const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ListPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoFilesRef = useRef<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docFiles, setDocFiles] = useState<{
    governmentId: File | null;
    ownershipProof: File | null;
    insuranceCert: File | null;
    hoaApproval: File | null;
    w9: File | null;
  }>({
    governmentId: null,
    ownershipProof: null,
    insuranceCert: null,
    hoaApproval: null,
    w9: null,
  });

  const inputClassName =
    'min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/15';
  const cardClassName = 'rounded-[24px] border border-slate-200 bg-white p-5 sm:p-8';

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

  const toggleBooleanField = (field: 'hasLiabilityInsurance' | 'hasProductionInsurance' | 'ageVerified' | 'propertyConditionDisclosed' | 'zoningCompliant' | 'rightToList' | 'contentUsageRights' | 'neighborAcknowledged' | 'cancellationAccepted') => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleArrayItem = (field: 'amenities' | 'availableDays' | 'complianceChecklist' | 'contentPermissions', item: string) => {
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

    if (stepNumber === 6) {
      if (!docFiles.governmentId) nextErrors.governmentId = 'Government-issued photo ID is required.';
      if (!docFiles.ownershipProof) nextErrors.ownershipProof = 'Proof of ownership or authorization is required.';
      if (!form.ownershipCertified) nextErrors.ownershipCertified = 'You must certify ownership or authorization.';
      if (!form.ownerAgreementAccepted) nextErrors.ownerAgreementAccepted = 'You must accept the Owner Agreement.';
      if (!form.insuranceConfirmed) nextErrors.insuranceConfirmed = 'You must confirm adequate insurance coverage.';
      if (!form.indemnificationAccepted) nextErrors.indemnificationAccepted = 'You must accept the indemnification terms.';
      if (!form.reviewAcknowledged) nextErrors.reviewAcknowledged = 'You must acknowledge the review process.';
      if (!form.ageVerified) nextErrors.ageVerified = 'You must confirm you are at least 18 years of age.';
      if (!form.propertyConditionDisclosed) nextErrors.propertyConditionDisclosed = 'You must confirm the property condition disclosure.';
      if (!form.zoningCompliant) nextErrors.zoningCompliant = 'You must confirm zoning and STR compliance.';
      if (!form.rightToList) nextErrors.rightToList = 'You must confirm your right to list this property.';
      if (!form.contentUsageRights) nextErrors.contentUsageRights = 'You must grant content usage rights.';
      if (!form.neighborAcknowledged) nextErrors.neighborAcknowledged = 'You must acknowledge the neighbor notification policy.';
      if (!form.emergencyContactName.trim()) nextErrors.emergencyContactName = 'Emergency contact name is required.';
      if (!form.emergencyContactPhone.trim()) nextErrors.emergencyContactPhone = 'Emergency contact phone is required.';
      if (!form.cancellationPolicy) nextErrors.cancellationPolicy = 'Please select a cancellation policy.';
      if (!form.cancellationAccepted) nextErrors.cancellationAccepted = 'You must accept the cancellation policy terms.';
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

    const acceptedFiles = Array.from(files)
      .slice(0, MAX_FILES)
      .filter((file) => ACCEPTED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES);

    photoFilesRef.current = acceptedFiles;
    const accepted = acceptedFiles.map((file) => ({ name: sanitizeInput(file.name), size: file.size, type: file.type }));

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
    if (!validateStep(6)) {
      setCurrentStep(6);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const formData = new FormData();
      // Property fields
      formData.append('title', form.title);
      formData.append('propertyType', form.propertyType);
      formData.append('address', form.address);
      formData.append('city', form.city);
      formData.append('state', form.state);
      formData.append('description', form.description);
      formData.append('bedrooms', form.bedrooms);
      formData.append('bathrooms', form.bathrooms);
      formData.append('maxCapacity', form.maxCapacity);
      formData.append('privacyLevel', form.privacyLevel);
      formData.append('bookingMode', form.bookingMode);
      formData.append('amenities', JSON.stringify(form.amenities));
      formData.append('baseRate', form.baseRate);
      formData.append('cleaningFee', form.cleaningFee);
      formData.append('securityDeposit', form.securityDeposit);
      formData.append('availableDays', JSON.stringify(form.availableDays));
      formData.append('availabilityNotes', form.availabilityNotes);
      // Compliance
      formData.append('totLicenseNumber', form.totLicenseNumber);
      formData.append('businessLicenseNumber', form.businessLicenseNumber);
      formData.append('hasLiabilityInsurance', String(form.hasLiabilityInsurance));
      formData.append('hasProductionInsurance', String(form.hasProductionInsurance));
      // Legal agreements
      formData.append('ownershipCertified', String(form.ownershipCertified));
      formData.append('ownerAgreementAccepted', String(form.ownerAgreementAccepted));
      formData.append('insuranceConfirmed', String(form.insuranceConfirmed));
      formData.append('indemnificationAccepted', String(form.indemnificationAccepted));
      formData.append('reviewAcknowledged', String(form.reviewAcknowledged));
      formData.append('ageVerified', String(form.ageVerified));
      formData.append('propertyConditionDisclosed', String(form.propertyConditionDisclosed));
      formData.append('zoningCompliant', String(form.zoningCompliant));
      formData.append('rightToList', String(form.rightToList));
      formData.append('contentUsageRights', String(form.contentUsageRights));
      formData.append('neighborAcknowledged', String(form.neighborAcknowledged));
      formData.append('emergencyContactName', form.emergencyContactName);
      formData.append('emergencyContactPhone', form.emergencyContactPhone);
      formData.append('cancellationPolicy', form.cancellationPolicy);
      formData.append('cancellationAccepted', String(form.cancellationAccepted));
      formData.append('contentPermissions', JSON.stringify(form.contentPermissions));
      formData.append('parkingSpots', form.parkingSpots);
      formData.append('loadInAccess', form.loadInAccess);
      formData.append('accessInstructions', form.accessInstructions);
      formData.append('propertyManagerName', form.propertyManagerName);
      formData.append('propertyManagerPhone', form.propertyManagerPhone);
      // Photo files
      for (const file of photoFilesRef.current) {
        formData.append('photos', file);
      }
      // Document files
      if (docFiles.governmentId) formData.append('governmentId', docFiles.governmentId);
      if (docFiles.ownershipProof) formData.append('ownershipProof', docFiles.ownershipProof);
      if (docFiles.insuranceCert) formData.append('insuranceCert', docFiles.insuranceCert);
      if (docFiles.hoaApproval) formData.append('hoaApproval', docFiles.hoaApproval);
      if (docFiles.w9) formData.append('w9', docFiles.w9);

      const response = await fetch('/api/list-property', { method: 'POST', body: formData });

      if (response.ok) {
        window.localStorage.removeItem(DRAFT_KEY);
        router.push('/list-property/submitted');
      } else {
        const err = await response.json().catch(() => ({}));
        setStatusMessage(err.error || 'Submission failed. Please try again.');
      }
    } catch {
      setStatusMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-[320px]">
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
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-blue-600 hover:text-white"
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

          <div className="mb-8 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-7">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id <= currentStep || validateStep(currentStep)) setCurrentStep(step.id);
                }}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  step.id === currentStep ? 'border-[#3B82F6] bg-blue-50' : 'border-slate-200 bg-white'
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
                      <label key={amenity} className="flex min-h-[48px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input type="checkbox" checked={form.amenities.includes(amenity)} onChange={() => toggleArrayItem('amenities', amenity)} className="mr-3 accent-blue-500" />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Compliance & Licensing */}
                <div className="mt-10 border-t border-black/10 pt-8">
                  <h3 className="mb-1 text-lg font-bold">Compliance &amp; Licensing</h3>
                  <p className="mb-6 text-sm text-black/60">Optional for MVP — fill in what you have. This info is shown on your listing to build guest trust.</p>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">TOT License Number</label>
                      <input className={inputClassName} value={form.totLicenseNumber} onChange={(e) => updateField('totLicenseNumber', sanitizeInput(e.target.value))} placeholder="e.g. TOT-2024-001" />
                      <p className="mt-2 text-sm text-black/60">
                        Transient Occupancy Tax certificate — required in most CA cities for short-term rentals.{' '}
                        <a href="/permits" className="font-medium text-blue-600 underline hover:text-blue-800">What is TOT &amp; how do I get one? →</a>
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Business License Number</label>
                      <input className={inputClassName} value={form.businessLicenseNumber} onChange={(e) => updateField('businessLicenseNumber', sanitizeInput(e.target.value))} placeholder="e.g. BL-2024-12345" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Business License Type</label>
                      <select className={inputClassName} value={form.businessLicenseType} onChange={(e) => updateField('businessLicenseType', e.target.value)}>
                        <option value="">Select type (optional)</option>
                        {businessLicenseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-4 justify-center">
                      <label className="flex min-h-[48px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input type="checkbox" checked={form.hasLiabilityInsurance} onChange={() => toggleBooleanField('hasLiabilityInsurance')} className="mr-3 accent-blue-500" />
                        <span className="font-medium">General Liability Insurance</span>
                      </label>
                      <label className="flex min-h-[48px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input type="checkbox" checked={form.hasProductionInsurance} onChange={() => toggleBooleanField('hasProductionInsurance')} className="mr-3 accent-blue-500" />
                        <span className="font-medium">Production Insurance</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="mb-3 block text-sm font-medium">Compliance Checklist (optional)</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {complianceChecklistItems.map((item) => (
                        <label key={item} className="flex min-h-[48px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                          <input type="checkbox" checked={form.complianceChecklist.includes(item)} onChange={() => toggleArrayItem('complianceChecklist', item)} className="mr-3 accent-blue-500" />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
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
                  className={`rounded-xl border border-dashed p-6 text-center transition-colors sm:p-12 ${isDragging ? 'border-blue-500 bg-white' : 'border-slate-200 bg-white'}`}
                >
                  <ImagePlus className="mx-auto mb-6 h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />
                  <p className="mb-2 text-lg font-semibold text-black sm:text-xl">Drag photos here or click to browse</p>
                  <p className="text-sm text-black/60">JPG, PNG, GIF, or WEBP only. Up to {MAX_FILES} files, 5MB max per file.</p>
                </div>

                {renderError('photos')}

                {form.photos.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                        <label key={option.value} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${form.bookingMode === option.value ? 'border-[#3B82F6] bg-blue-50' : 'border-slate-200 bg-white'}`}>
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
                        <label key={day} className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-black transition hover:border-blue-500">
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
                  <Shield className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Verification & Legal</h2>
                    <p className="text-sm text-black/65">Upload required documents and agree to our terms before submitting.</p>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="mb-8">
                  <h3 className="mb-1 text-lg font-bold">Required Documents</h3>
                  <p className="mb-5 text-sm text-black/60">Images or PDFs only. Max 10MB each.</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Government ID */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">Government-issued photo ID <span className="text-red-500">*</span></label>
                      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors hover:border-blue-500 ${docFiles.governmentId ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && (!ACCEPTED_DOC_TYPES.includes(file.type) || file.size > MAX_DOC_SIZE_BYTES)) {
                              setErrors((prev) => ({ ...prev, governmentId: 'File must be an image or PDF under 10MB.' }));
                              return;
                            }
                            setDocFiles((prev) => ({ ...prev, governmentId: file }));
                            setErrors((prev) => { const n = { ...prev }; delete n.governmentId; return n; });
                          }}
                        />
                        {docFiles.governmentId ? (
                          <span className="text-sm font-medium text-blue-700">{docFiles.governmentId.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-black/70">Driver&apos;s license or passport</span>
                            <span className="mt-1 text-xs text-black/50">Click to upload</span>
                          </>
                        )}
                      </label>
                      {errors.governmentId && <p className="mt-2 text-sm text-red-600">{errors.governmentId}</p>}
                    </div>

                    {/* Ownership Proof */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">Proof of ownership or authorization <span className="text-red-500">*</span></label>
                      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors hover:border-blue-500 ${docFiles.ownershipProof ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && (!ACCEPTED_DOC_TYPES.includes(file.type) || file.size > MAX_DOC_SIZE_BYTES)) {
                              setErrors((prev) => ({ ...prev, ownershipProof: 'File must be an image or PDF under 10MB.' }));
                              return;
                            }
                            setDocFiles((prev) => ({ ...prev, ownershipProof: file }));
                            setErrors((prev) => { const n = { ...prev }; delete n.ownershipProof; return n; });
                          }}
                        />
                        {docFiles.ownershipProof ? (
                          <span className="text-sm font-medium text-blue-700">{docFiles.ownershipProof.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-black/70">Deed, lease, or management agreement</span>
                            <span className="mt-1 text-xs text-black/50">Click to upload</span>
                          </>
                        )}
                      </label>
                      {errors.ownershipProof && <p className="mt-2 text-sm text-red-600">{errors.ownershipProof}</p>}
                    </div>
                  </div>
                </div>

                {/* Optional Documents */}
                <div className="mb-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Optional Documents</h3>
                  <p className="mb-5 text-sm text-black/60">These help speed up your approval but are not required.</p>
                  <div className="grid gap-5 md:grid-cols-3">
                    {/* COI */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">Certificate of Insurance (COI)</label>
                      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors hover:border-blue-500 ${docFiles.insuranceCert ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && (!ACCEPTED_DOC_TYPES.includes(file.type) || file.size > MAX_DOC_SIZE_BYTES)) return;
                            setDocFiles((prev) => ({ ...prev, insuranceCert: file }));
                          }}
                        />
                        {docFiles.insuranceCert ? (
                          <span className="text-xs font-medium text-blue-700 truncate max-w-full">{docFiles.insuranceCert.name}</span>
                        ) : (
                          <span className="text-xs text-black/50">Click to upload</span>
                        )}
                      </label>
                    </div>

                    {/* HOA */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">HOA approval letter</label>
                      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors hover:border-blue-500 ${docFiles.hoaApproval ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && (!ACCEPTED_DOC_TYPES.includes(file.type) || file.size > MAX_DOC_SIZE_BYTES)) return;
                            setDocFiles((prev) => ({ ...prev, hoaApproval: file }));
                          }}
                        />
                        {docFiles.hoaApproval ? (
                          <span className="text-xs font-medium text-blue-700 truncate max-w-full">{docFiles.hoaApproval.name}</span>
                        ) : (
                          <span className="text-xs text-black/50">Click to upload</span>
                        )}
                      </label>
                    </div>

                    {/* W-9 */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">W-9 tax form</label>
                      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors hover:border-blue-500 ${docFiles.w9 ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file && (!ACCEPTED_DOC_TYPES.includes(file.type) || file.size > MAX_DOC_SIZE_BYTES)) return;
                            setDocFiles((prev) => ({ ...prev, w9: file }));
                          }}
                        />
                        {docFiles.w9 ? (
                          <span className="text-xs font-medium text-blue-700 truncate max-w-full">{docFiles.w9.name}</span>
                        ) : (
                          <span className="text-xs text-black/50">Click to upload</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Content & Usage Permissions */}
                <div className="mb-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Content &amp; Usage Permissions</h3>
                  <p className="mb-5 text-sm text-black/60">Select which types of productions you are comfortable hosting. You can change these at any time.</p>
                  <div className="space-y-2">
                    {([
                      { id: 'Mainstream Film & Television', label: 'Mainstream Film & Television', note: null },
                      { id: 'Commercial & Advertising', label: 'Commercial & Advertising', note: null },
                      { id: 'Music Videos', label: 'Music Videos', note: null },
                      { id: 'Photo Shoots', label: 'Photo Shoots', note: null },
                      { id: 'Events & Private Parties', label: 'Events & Private Parties', note: null },
                      { id: 'Student & Independent Film', label: 'Student & Independent Film', note: null },
                      { id: 'Social Media & Influencer Content', label: 'Social Media & Influencer Content', note: null },
                      { id: 'Adult Entertainment (18+)', label: 'Adult Entertainment (18+)', note: 'By enabling this, you confirm you are comfortable with adult content being produced at your property. All productions must carry insurance and comply with applicable laws. See our Adult Production Policy for details.' },
                      { id: 'Corporate Events & Meetings', label: 'Corporate Events & Meetings', note: null },
                      { id: 'Wedding & Special Occasions', label: 'Wedding & Special Occasions', note: null },
                    ] as { id: string; label: string; note: string | null }[]).map(({ id, label, note }) => {
                      const isOn = form.contentPermissions.includes(id);
                      return (
                        <div key={id} className={`rounded-xl border bg-white px-4 py-3 transition-colors hover:border-blue-200 ${note ? 'border-slate-300' : 'border-slate-200'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-black">{label}</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isOn}
                              onClick={() => toggleArrayItem('contentPermissions', id)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isOn ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          {note && isOn && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
                          )}
                          {note && !isOn && (
                            <p className="mt-1 text-xs text-slate-400">Off by default. Enable only if you are comfortable with adult productions at your property.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legal Agreements */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Legal Agreements</h3>
                  <p className="mb-5 text-sm text-black/60">All boxes must be checked to continue.</p>
                  <div className="space-y-3">
                    {[
                      {
                        field: 'ownershipCertified' as const,
                        label: 'I certify that I am the legal owner or authorized representative of this property.',
                      },
                      {
                        field: 'ownerAgreementAccepted' as const,
                        label: (
                          <>
                            I have read and agree to the{' '}
                            <a href="/legal/owner-agreement" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline hover:text-blue-800">
                              Owner Agreement
                            </a>
                            .
                          </>
                        ),
                      },
                      {
                        field: 'insuranceConfirmed' as const,
                        label: 'I confirm this property has adequate homeowners/renters insurance covering short-term rental use.',
                      },
                      {
                        field: 'indemnificationAccepted' as const,
                        label: 'I agree to indemnify and hold SetVenue harmless from any claims, damages, or liabilities arising from the use of my property.',
                      },
                      {
                        field: 'reviewAcknowledged' as const,
                        label: 'I understand my listing will be reviewed before going live and I may be asked for additional documentation.',
                      },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input
                          type="checkbox"
                          checked={form[field]}
                          onChange={() => setForm((prev) => ({ ...prev, [field]: !prev[field] }))}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="text-sm leading-relaxed">{label}</span>
                      </label>
                    ))}
                  </div>
                  {(errors.ownershipCertified || errors.ownerAgreementAccepted || errors.insuranceConfirmed || errors.indemnificationAccepted || errors.reviewAcknowledged) && (
                    <p className="mt-3 text-sm text-red-600">Please check all required boxes above to continue.</p>
                  )}

                  {/* Additional required legal checkboxes */}
                  <div className="mt-4 space-y-3">
                    {[
                      { field: 'ageVerified' as const, label: 'I am at least 18 years of age.' },
                      { field: 'propertyConditionDisclosed' as const, label: 'This property is free of known hazards including but not limited to mold, asbestos, lead paint, and structural deficiencies.' },
                      { field: 'zoningCompliant' as const, label: 'I confirm this property is legally permitted for short-term rental or production use under applicable local zoning laws.' },
                      { field: 'rightToList' as const, label: 'I confirm there are no liens, legal disputes, or HOA restrictions that would prevent me from listing this property.' },
                      { field: 'contentUsageRights' as const, label: 'I grant productions the right to photograph and film the interior and exterior of the property for commercial use.' },
                      { field: 'neighborAcknowledged' as const, label: 'I acknowledge that production activity may be visible to neighbors and I accept responsibility for any neighbor complaints.' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input
                          type="checkbox"
                          checked={form[field]}
                          onChange={() => toggleBooleanField(field)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="text-sm leading-relaxed">{label}</span>
                      </label>
                    ))}
                  </div>
                  {(errors.ageVerified || errors.propertyConditionDisclosed || errors.zoningCompliant || errors.rightToList || errors.contentUsageRights || errors.neighborAcknowledged) && (
                    <p className="mt-3 text-sm text-red-600">Please check all required legal agreement boxes above to continue.</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Emergency Contact</h3>
                  <p className="mb-5 text-sm text-black/60">Required for all listings. This contact will be reached in case of an emergency during a booking.</p>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Emergency contact name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className={inputClassName}
                        value={form.emergencyContactName}
                        onChange={(e) => updateField('emergencyContactName', sanitizeInput(e.target.value))}
                        placeholder="Jane Smith"
                      />
                      {renderError('emergencyContactName')}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Emergency contact phone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        className={inputClassName}
                        value={form.emergencyContactPhone}
                        onChange={(e) => updateField('emergencyContactPhone', sanitizeInput(e.target.value))}
                        placeholder="+1 (555) 000-0000"
                      />
                      {renderError('emergencyContactPhone')}
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Cancellation Policy</h3>
                  <p className="mb-5 text-sm text-black/60">Select the policy that best fits your situation. This will be shown to productions before they book.</p>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Policy <span className="text-red-500">*</span></label>
                      <select
                        className={inputClassName}
                        value={form.cancellationPolicy}
                        onChange={(e) => updateField('cancellationPolicy', e.target.value)}
                      >
                        <option value="">Select policy</option>
                        <option value="flexible">Flexible</option>
                        <option value="moderate">Moderate</option>
                        <option value="strict">Strict</option>
                      </select>
                      {renderError('cancellationPolicy')}
                    </div>
                    <div className="flex items-end">
                      <label className="flex min-h-[48px] w-full cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-black transition-colors hover:border-blue-500">
                        <input
                          type="checkbox"
                          checked={form.cancellationAccepted}
                          onChange={() => toggleBooleanField('cancellationAccepted')}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="text-sm leading-relaxed">
                          I have read and accept the{' '}
                          <a href="/legal/cancellation" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline hover:text-blue-800">
                            cancellation policy terms
                          </a>
                          .
                        </span>
                      </label>
                    </div>
                  </div>
                  {renderError('cancellationAccepted')}
                </div>

                {/* Property Access & Logistics */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Property Access &amp; Logistics</h3>
                  <p className="mb-5 text-sm text-black/60">Optional but helps productions plan load-in and access. You can update this any time.</p>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="md:w-1/3">
                      <label className="mb-2 block text-sm font-medium">Number of parking spots available</label>
                      <input
                        type="number"
                        min="0"
                        className={inputClassName}
                        value={form.parkingSpots}
                        onChange={(e) => updateField('parkingSpots', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Load-in access description</label>
                      <textarea
                        rows={3}
                        className={`${inputClassName} min-h-[96px]`}
                        value={form.loadInAccess}
                        onChange={(e) => updateField('loadInAccess', sanitizeInput(e.target.value))}
                        placeholder="Describe vehicle access, loading dock, elevator, stairs, etc."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Gate codes or special access instructions</label>
                      <textarea
                        rows={3}
                        className={`${inputClassName} min-h-[96px]`}
                        value={form.accessInstructions}
                        onChange={(e) => updateField('accessInstructions', sanitizeInput(e.target.value))}
                        placeholder="Any codes, keys, or special instructions for accessing the property"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Manager (Optional) */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-1 text-lg font-bold">Property Manager <span className="text-sm font-normal text-black/50">(Optional)</span></h3>
                  <p className="mb-5 text-sm text-black/60">If someone else manages day-to-day access, add their details here.</p>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Property manager name</label>
                      <input
                        type="text"
                        className={inputClassName}
                        value={form.propertyManagerName}
                        onChange={(e) => updateField('propertyManagerName', sanitizeInput(e.target.value))}
                        placeholder="Alex Johnson"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Property manager phone</label>
                      <input
                        type="tel"
                        className={inputClassName}
                        value={form.propertyManagerPhone}
                        onChange={(e) => updateField('propertyManagerPhone', sanitizeInput(e.target.value))}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {currentStep === 7 && (
              <section className={cardClassName}>
                <div className="mb-6 flex items-center">
                  <Check className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Review & Submit</h2>
                    <p className="text-sm text-black/65">Review your listing details before submitting.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold">Basic Info</h3>
                    <p className="mt-2 text-sm text-black/70">{form.title || '—'} · {form.propertyType || '—'}</p>
                    <p className="text-sm text-black/70">{form.address || '—'}, {form.city || '—'}, {form.state || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold">Details</h3>
                    <p className="mt-2 text-sm text-black/70">{form.bedrooms || '0'} bed · {form.bathrooms || '0'} bath · {form.maxCapacity || '0'} guests</p>
                    <p className="text-sm text-black/70">Privacy: {form.privacyLevel} · Booking: {form.bookingMode === 'instant' ? 'Instant book' : 'Request to book'}</p>
                    <p className="text-sm text-black/70">Amenities: {form.amenities.join(', ') || 'None selected'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold">Photos</h3>
                    <p className="mt-2 text-sm text-black/70">{form.photos.length} validated image file(s) selected.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold">Pricing & availability</h3>
                    <p className="mt-2 text-sm text-black/70">Base rate: ${form.baseRate || '0'} · Cleaning: ${form.cleaningFee || '0'} · Deposit: ${form.securityDeposit || '0'}</p>
                    <p className="text-sm text-black/70">Days: {form.availableDays.join(', ') || 'None selected'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                    <h3 className="font-semibold">Legal &amp; Operational</h3>
                    <p className="mt-2 text-sm text-black/70">
                      Legal agreements accepted: {[form.ownershipCertified, form.ownerAgreementAccepted, form.insuranceConfirmed, form.indemnificationAccepted, form.reviewAcknowledged, form.ageVerified, form.propertyConditionDisclosed, form.zoningCompliant, form.rightToList, form.contentUsageRights, form.neighborAcknowledged, form.cancellationAccepted].filter(Boolean).length} / 12
                    </p>
                    <p className="text-sm text-black/70">
                      Emergency contact: {form.emergencyContactName || '—'}{form.emergencyContactPhone ? ` · ${form.emergencyContactPhone}` : ''}
                    </p>
                    <p className="text-sm text-black/70">
                      Cancellation policy: {form.cancellationPolicy ? form.cancellationPolicy.charAt(0).toUpperCase() + form.cancellationPolicy.slice(1) : '—'}
                    </p>
                    {form.parkingSpots && (
                      <p className="text-sm text-black/70">Parking spots: {form.parkingSpots}</p>
                    )}
                    {form.propertyManagerName && (
                      <p className="text-sm text-black/70">Property manager: {form.propertyManagerName}{form.propertyManagerPhone ? ` · ${form.propertyManagerPhone}` : ''}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-end gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-[#3B82F6] px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit for Review'}
                  </button>
                  <p className="text-sm text-black/50">Your listing will be reviewed by our team before going live. This usually takes 1–2 business days.</p>
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
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-slate-200 px-6 py-3 font-semibold transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-slate-200 px-6 py-3 font-semibold transition hover:bg-blue-600 hover:text-white"
                >
                  Save draft
                </button>
                {currentStep < 6 && (
                  <button type="button" onClick={goNext} className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 font-semibold text-white transition hover:bg-blue-600">
                    Continue
                  </button>
                )}
                {currentStep === 6 && (
                  <button type="button" onClick={goNext} className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 font-semibold text-white transition hover:bg-blue-600">
                    Continue to Review
                  </button>
                )}
              </div>
            </div>
          </form>

          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
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
