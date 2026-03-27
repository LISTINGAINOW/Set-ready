import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      propertyId,
      productionType,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      proposedPrice,
      priceType,
      estimatedHours,
      preferredDates,
      crewSize,
      description,
      specialRequirements,
    } = body;

    // Validate required fields
    if (!propertyId || !productionType || !companyName || !contactName || !contactEmail || !contactPhone || !proposedPrice || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert bid into database
    const { data, error } = await supabase
      .from('property_bids')
      .insert({
        property_id: propertyId,
        production_type: productionType,
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        proposed_price: proposedPrice,
        price_type: priceType || 'hourly',
        estimated_hours: estimatedHours || 0,
        preferred_dates: preferredDates || '',
        crew_size: crewSize || 0,
        description,
        special_requirements: specialRequirements || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert bid:', error);
      return NextResponse.json(
        { error: 'Failed to submit bid' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to property owner
    // TODO: Send confirmation email to bidder

    return NextResponse.json({
      success: true,
      bidId: data.id,
      message: 'Bid submitted successfully',
    });
  } catch (error: any) {
    console.error('Bid submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
