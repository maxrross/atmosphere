import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { lat, lng, alt = 0 } = await request.json();
    const apiKey = process.env.OPENUV_API_KEY;

    // Fetch UV data from OpenUV API
    const uvResponse = await fetch(
      `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}&alt=${alt}`,
      {
        headers: {
          'x-access-token': apiKey!,
        },
      }
    );

    if (!uvResponse.ok) {
      throw new Error(`OpenUV API error: ${uvResponse.status}`);
    }

    const uvData = await uvResponse.json();

    return NextResponse.json(uvData);
  } catch (error) {
    console.error('Error fetching UV data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UV data' },
      { status: 500 }
    );
  }
} 