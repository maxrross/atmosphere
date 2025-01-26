/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

async function getUVData(lat: number, lng: number) {
  const uvResponse = await fetch(
    `https://currentuvindex.com/api/v1/uvi?latitude=${lat}&longitude=${lng}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!uvResponse.ok) {
    const errorText = await uvResponse.text();
    console.error("UV API error:", {
      status: uvResponse.status,
      error: errorText,
      url: `https://currentuvindex.com/api/v1/uvi?latitude=${lat}&longitude=${lng}`,
    });
    throw new Error(`UV API error: ${uvResponse.status}`);
  }

  const data = await uvResponse.json();
  return data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    const uvData = await getUVData(lat, lng);
    return NextResponse.json(uvData);
  } catch (error: any) {
    console.error("Error fetching UV data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch UV data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      );
    }

    const uvData = await getUVData(lat, lng);
    return NextResponse.json(uvData);
  } catch (error: any) {
    console.error("Error fetching UV data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch UV data" },
      { status: 500 }
    );
  }
}
