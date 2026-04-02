'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Star,
  ImageIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Property {
  id: string;
  property_name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  status: string;
  approved: boolean;
  images: string[];
  price_per_hour: number | null;
  price_per_day: number | null;
  amenities: string[];
  best_uses: string[];
  owner_name: string;
  owner_phone: string;
}

const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'Kitchen', 'Pool', 'Hot Tub', 'Outdoor Space',
  'Natural Light', 'Air Conditioning', 'Heating', 'Generator', 'Security System',
  'Pet Friendly', 'ADA Accessible', 'EV Charging', 'High Ceilings',
];

const COMMON_USES = [
  'Film & TV', 'Photography', 'Music Video', 'Commercial', 'Events',
  'Corporate', 'Weddings', 'Birthday Parties', 'Product Shoots', 'Fashion',
];

export default function HostEditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [status, setStatus] = useState('active');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [bestUses, setBestUses] = useState<string[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/host/properties/${params.id}`, { credentials: 'include' });
        if (res.status === 401) { router.push('/host/login'); return; }
        if (res.status === 404) { router.push('/host/properties'); return; }
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
        const p: Property = json.property;
        setProperty(p);
        setName(p.property_name ?? '');
        setDescription(p.description ?? '');
        setPricePerHour(p.price_per_hour?.toString() ?? '');
        setPricePerDay(p.price_per_day?.toString() ?? '');
        setStatus(p.status ?? 'active');
        setAmenities(p.amenities ?? []);
        setBestUses(p.best_uses ?? []);
        setOwnerName(p.owner_name ?? '');
        setOwnerPhone(p.owner_phone ?? '');
        setImages(p.images ?? []);
        setHeroImage(p.images?.[0] ?? '');
      } catch {
        setError('Failed to load property.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  async function handleSave() {
    setSaving(true);
    setSaveResult(null);
    try {
      // Move hero image to front
      const orderedImages = heroImage
        ? [heroImage, ...images.filter((img) => img !== heroImage)]
        : images;

      const res = await fetch(`/api/host/properties/${params.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_name: name,
          description,
          price_per_hour: pricePerHour ? parseFloat(pricePerHour) : null,
          price_per_day: pricePerDay ? parseFloat(pricePerDay) : null,
          status,
          amenities,
          best_uses: bestUses,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          images: orderedImages,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setSaveResult('error');
        setError(json.error);
      } else {
        setSaveResult('success');
        setTimeout(() => setSaveResult(null), 3000);
      }
    } catch {
      setSaveResult('error');
      setError('Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`/api/host/properties/${params.id}/photos`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const json = await res.json();
        if (json.images) {
          setImages(json.images);
          if (!heroImage && json.images[0]) setHeroImage(json.images[0]);
        }
      } catch {
        console.error('Upload failed for', file.name);
      }
    }
    setUploading(false);
  }

  async function handleDelete(imageUrl: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    const res = await fetch(`/api/host/properties/${params.id}/photos`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const json = await res.json();
    if (json.images) {
      setImages(json.images);
      if (heroImage === imageUrl) setHeroImage(json.images[0] ?? '');
    }
  }

  function toggleAmenity(item: string) {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  function toggleBestUse(item: string) {
    setBestUses((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        <Link href="/host/properties" className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to properties
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link href="/host/properties" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {property?.property_name || 'Edit Property'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {[property?.city, property?.state].filter(Boolean).join(', ')}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition flex-shrink-0"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Save feedback */}
      {saveResult === 'success' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Changes saved successfully!
        </div>
      )}
      {saveResult === 'error' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error || 'Failed to save changes.'}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5">Basic Information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition resize-none"
                placeholder="Describe your property, its features, and what makes it unique…"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5">Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per hour ($)</label>
              <input
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per day ($)</label>
              <input
                type="number"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {/* Visibility */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2">Listing Visibility</h2>
          <p className="text-sm text-slate-500 mb-4">
            {property?.approved ? 'Your property is approved. Toggle visibility below.' : 'Your property is pending admin review and is not yet live.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStatus('active')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition border ${
                status === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              Active (visible)
            </button>
            <button
              onClick={() => setStatus('hidden')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition border ${
                status === 'hidden'
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Hidden
            </button>
          </div>
        </section>

        {/* Amenities */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2">Amenities</h2>
          <p className="text-sm text-slate-500 mb-4">Select all that apply.</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${
                  amenities.includes(item)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Best uses */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2">Best Uses</h2>
          <p className="text-sm text-slate-500 mb-4">What's your property best suited for?</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_USES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleBestUse(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${
                  bestUses.includes(item)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Photos</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {images.length} photo{images.length !== 1 ? 's' : ''}. Click ★ to set hero (cover) photo.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {uploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading…' : 'Add photos'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
          </div>

          {images.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center gap-3 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition"
            >
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm font-medium">Click to upload photos</span>
              <span className="text-xs">JPG, PNG, or WebP · Max 10 MB each</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img}
                  className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 ${
                    img === heroImage ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}
                >
                  <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                  {/* Hero badge */}
                  {img === heroImage && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                      <Star className="h-3 w-3 fill-current" /> Cover
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => setHeroImage(img)}
                      title="Set as cover photo"
                      className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/90 text-slate-700 hover:bg-white transition"
                    >
                      <Star className={`h-4 w-4 ${img === heroImage ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(img)}
                      title="Delete photo"
                      className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/90 text-red-600 hover:bg-white transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add more placeholder */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          )}
        </section>

        {/* Contact info */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2">Your Contact Details</h2>
          <p className="text-sm text-slate-500 mb-4">Used internally — not shown publicly.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>
        </section>

        {/* Save button (bottom) */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving…' : 'Save all changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
