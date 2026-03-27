import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '@/utils/supabase/admin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const MAX_DOC_SIZE = 10 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function uploadFile(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  folder: string,
  file: File,
  maxSize: number,
  acceptedTypes: string[]
): Promise<string | null> {
  if (!ACCEPTED_DOC_TYPES.includes(file.type) && bucket === 'listing-documents') return null;
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type) && bucket === 'property-images') return null;
  if (!acceptedTypes.includes(file.type)) return null;
  if (file.size > maxSize) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const path = `${folder}/${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error(`Storage upload error (${bucket}/${path}):`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Required field validation
    const title = String(formData.get('title') || '').trim();
    const propertyType = String(formData.get('propertyType') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim();
    const baseRate = String(formData.get('baseRate') || '').trim();
    const availableDays = String(formData.get('availableDays') || '[]');

    const ownershipCertified = formData.get('ownershipCertified') === 'true';
    const ownerAgreementAccepted = formData.get('ownerAgreementAccepted') === 'true';
    const insuranceConfirmed = formData.get('insuranceConfirmed') === 'true';
    const indemnificationAccepted = formData.get('indemnificationAccepted') === 'true';
    const reviewAcknowledged = formData.get('reviewAcknowledged') === 'true';

    if (!title || !propertyType || !address || !city || !state || !baseRate) {
      return NextResponse.json({ error: 'Missing required property fields.' }, { status: 400 });
    }

    if (!ownershipCertified || !ownerAgreementAccepted || !insuranceConfirmed || !indemnificationAccepted || !reviewAcknowledged) {
      return NextResponse.json({ error: 'All legal agreements must be accepted.' }, { status: 400 });
    }

    const governmentIdFile = formData.get('governmentId') as File | null;
    const ownershipProofFile = formData.get('ownershipProof') as File | null;

    if (!governmentIdFile || governmentIdFile.size === 0) {
      return NextResponse.json({ error: 'Government-issued photo ID is required.' }, { status: 400 });
    }
    if (!ownershipProofFile || ownershipProofFile.size === 0) {
      return NextResponse.json({ error: 'Proof of ownership or authorization is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const submissionId = uuidv4();
    const folder = submissionId;

    // Upload required documents
    const governmentIdUrl = await uploadFile(supabase, 'listing-documents', `${folder}/id`, governmentIdFile, MAX_DOC_SIZE, ACCEPTED_DOC_TYPES);
    const ownershipProofUrl = await uploadFile(supabase, 'listing-documents', `${folder}/ownership`, ownershipProofFile, MAX_DOC_SIZE, ACCEPTED_DOC_TYPES);

    if (!governmentIdUrl || !ownershipProofUrl) {
      return NextResponse.json({ error: 'Failed to upload required documents. Check file type and size.' }, { status: 400 });
    }

    // Upload optional documents
    const insuranceCertFile = formData.get('insuranceCert') as File | null;
    const hoaApprovalFile = formData.get('hoaApproval') as File | null;
    const w9File = formData.get('w9') as File | null;

    const insuranceCertUrl = insuranceCertFile && insuranceCertFile.size > 0
      ? await uploadFile(supabase, 'listing-documents', `${folder}/insurance`, insuranceCertFile, MAX_DOC_SIZE, ACCEPTED_DOC_TYPES)
      : null;

    const hoaApprovalUrl = hoaApprovalFile && hoaApprovalFile.size > 0
      ? await uploadFile(supabase, 'listing-documents', `${folder}/hoa`, hoaApprovalFile, MAX_DOC_SIZE, ACCEPTED_DOC_TYPES)
      : null;

    const w9Url = w9File && w9File.size > 0
      ? await uploadFile(supabase, 'listing-documents', `${folder}/w9`, w9File, MAX_DOC_SIZE, ACCEPTED_DOC_TYPES)
      : null;

    // Upload property photos
    const photoFiles = formData.getAll('photos') as File[];
    const photoUrls: string[] = [];
    for (const photo of photoFiles.slice(0, 20)) {
      if (photo.size > 0) {
        const url = await uploadFile(supabase, 'property-images', folder, photo, MAX_PHOTO_SIZE, ACCEPTED_PHOTO_TYPES);
        if (url) photoUrls.push(url);
      }
    }

    // Parse JSON fields
    let amenities: string[] = [];
    let parsedAvailableDays: string[] = [];
    try { amenities = JSON.parse(String(formData.get('amenities') || '[]')); } catch { /* ignore */ }
    try { parsedAvailableDays = JSON.parse(availableDays); } catch { /* ignore */ }

    // Save to database
    const { error: dbError } = await supabase.from('listing_submissions').insert({
      id: submissionId,
      user_id: String(formData.get('userId') || null) || null,
      status: 'pending_review',
      title,
      property_type: propertyType,
      address,
      city,
      state: String(formData.get('state') || '').trim(),
      description: String(formData.get('description') || '').trim() || null,
      bedrooms: Number(formData.get('bedrooms')) || null,
      bathrooms: Number(formData.get('bathrooms')) || null,
      max_capacity: Number(formData.get('maxCapacity')) || null,
      amenities,
      privacy_level: String(formData.get('privacyLevel') || '').trim() || null,
      booking_mode: String(formData.get('bookingMode') || '').trim() || null,
      base_rate: parseFloat(baseRate) || null,
      cleaning_fee: parseFloat(String(formData.get('cleaningFee') || '0')) || null,
      security_deposit: parseFloat(String(formData.get('securityDeposit') || '0')) || null,
      available_days: parsedAvailableDays,
      tot_license_number: String(formData.get('totLicenseNumber') || '').trim() || null,
      business_license_number: String(formData.get('businessLicenseNumber') || '').trim() || null,
      has_liability_insurance: formData.get('hasLiabilityInsurance') === 'true',
      has_production_insurance: formData.get('hasProductionInsurance') === 'true',
      ownership_certified: ownershipCertified,
      owner_agreement_accepted: ownerAgreementAccepted,
      insurance_confirmed: insuranceConfirmed,
      indemnification_accepted: indemnificationAccepted,
      review_acknowledged: reviewAcknowledged,
      government_id_url: governmentIdUrl,
      ownership_proof_url: ownershipProofUrl,
      insurance_cert_url: insuranceCertUrl,
      hoa_approval_url: hoaApprovalUrl,
      w9_url: w9Url,
      photo_urls: photoUrls,
    });

    if (dbError) {
      console.error('DB insert error:', dbError.message);
      return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 });
    }

    // Send notification email
    if (resend) {
      const year = new Date().getFullYear();
      await resend.emails.send({
        from: 'SetVenue <noreply@setvenue.com>',
        to: 'noreply@setvenue.com',
        subject: `New listing submission: ${title} (${city}, ${state})`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Listing Submission</title></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #e2e8f0;">
              <span style="background-color:#2563eb;display:inline-block;width:36px;height:36px;border-radius:8px;text-align:center;line-height:36px;color:#fff;font-size:18px;font-weight:700;">S</span>
              <span style="margin-left:10px;font-size:18px;font-weight:700;color:#111;">SetVenue</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111;">New Listing Submission</h1>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;"><strong>Property:</strong> ${title}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;"><strong>Location:</strong> ${city}, ${state}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;"><strong>Type:</strong> ${propertyType}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#374151;"><strong>Submission ID:</strong> ${submissionId}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;"><strong>Photos uploaded:</strong> ${photoUrls.length}</p>
              <p style="font-size:14px;color:#6b7280;">Log in to the admin panel to review this submission.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${year} SetVenue. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        text: `New listing submission\n\nProperty: ${title}\nLocation: ${city}, ${state}\nType: ${propertyType}\nSubmission ID: ${submissionId}\nPhotos: ${photoUrls.length}\n\nLog in to the admin panel to review.\n\n© ${year} SetVenue`,
      }).catch((err: unknown) => {
        console.warn('Notification email failed:', err);
      });
    }

    return NextResponse.json({ success: true, submissionId }, { status: 201 });
  } catch (err) {
    console.error('list-property POST error:', err);
    return NextResponse.json({ error: 'Unexpected server error. Please try again.' }, { status: 500 });
  }
}
