import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'SetVenue';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const price = searchParams.get('price') || '';
  const beds = searchParams.get('beds') || '';
  const baths = searchParams.get('baths') || '';
  const sqft = searchParams.get('sqft') || '';
  const image = searchParams.get('image') || '';
  const type = searchParams.get('type') || 'property'; // property | city | default

  if (type === 'default') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#3b82f6',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              🎬 SETVENUE
            </div>
            {title && title !== 'SetVenue' && (
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  maxWidth: '900px',
                }}
              >
                {title}
              </div>
            )}
            {(!title || title === 'SetVenue') && (
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  textAlign: 'center',
                }}
              >
                Production Locations,
                <br />
                Crew Stays &amp; Event Venues
              </div>
            )}
            <div
              style={{
                fontSize: '22px',
                color: '#94a3b8',
                marginTop: '8px',
              }}
            >
              setvenue.com • 0% Host Fees
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  if (type === 'city') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#3b82f6',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Film Locations In
            </div>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#94a3b8',
                marginTop: '12px',
              }}
            >
              setvenue.com • 0% Host Fees
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Property OG image
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Left side - Image */}
        <div
          style={{
            width: '55%',
            height: '100%',
            display: 'flex',
            position: 'relative',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '120px',
              }}
            >
              🎬
            </div>
          )}
        </div>

        {/* Right side - Details */}
        <div
          style={{
            width: '45%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px',
            gap: '16px',
          }}
        >
          {/* SetVenue badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#3b82f6',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            SETVENUE
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.15,
              maxWidth: '400px',
            }}
          >
            {title}
          </div>

          {/* Location */}
          {(city || state) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '18px',
                color: '#64748b',
              }}
            >
              📍 {[city, state].filter(Boolean).join(', ')}
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '8px',
            }}
          >
            {beds && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{beds}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Beds</div>
              </div>
            )}
            {baths && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{baths}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Baths</div>
              </div>
            )}
            {sqft && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                  {Number(sqft).toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Sq Ft</div>
              </div>
            )}
          </div>

          {/* Price */}
          {price && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginTop: '12px',
                padding: '12px 20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                ${Number(price).toLocaleString()}
              </div>
              <div style={{ fontSize: '16px', color: '#64748b' }}>/hr</div>
            </div>
          )}

          {/* Zero fee badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '4px',
              fontSize: '14px',
              color: '#16a34a',
              fontWeight: 600,
            }}
          >
            ✓ 0% Host Fee
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
