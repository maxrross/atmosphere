import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const structuredSchema = {
  type: SchemaType.OBJECT,
  properties: {
    timeframes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          hours: { type: SchemaType.NUMBER },
          radius: { type: SchemaType.NUMBER },
          impact: { type: SchemaType.STRING },
        },
        required: ["hours", "radius", "impact"],
      },
    },
    explanation: { type: SchemaType.STRING },
  },
  required: ["timeframes", "explanation"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: structuredSchema,
  },
});

// Helper function to generate points in a rough polygon around a center point
function generatePolygonPoints(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  windDirection: number = 0, // 0-360 degrees, 0 is North
  numPoints: number = 12
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const earthRadiusKm = 6371;

  // Convert wind direction to radians and adjust for polygon generation
  const windRad = (windDirection * Math.PI) / 180;

  for (let i = 0; i < numPoints; i++) {
    // Base angle for this point
    const angle = (i * 2 * Math.PI) / numPoints;

    // Add wind influence to make the shape more elongated in wind direction
    const windInfluence = Math.cos(angle - windRad);
    const elongation = 1 + Math.max(0, windInfluence) * 0.5; // Up to 50% longer in wind direction

    // Add some randomness to make the shape irregular
    const randomFactor = 0.85 + Math.random() * 0.3; // 0.85-1.15 randomness
    const currentRadius = radiusKm * randomFactor * elongation;

    // Convert radius to lat/lng deltas
    const latOffset = (currentRadius / earthRadiusKm) * (180 / Math.PI);
    const lngOffset =
      ((currentRadius / earthRadiusKm) * (180 / Math.PI)) /
      Math.cos((centerLat * Math.PI) / 180);

    const lat = centerLat + latOffset * Math.sin(angle);
    const lng = centerLng + lngOffset * Math.cos(angle);

    points.push({ lat, lng });
  }

  // Close the polygon by repeating the first point
  points.push(points[0]);
  return points;
}

export async function POST(request: Request) {
  // Initialize with default values
  let lat = 0,
    lng = 0;

  try {
    const { lat: latitude, lng: longitude, address } = await request.json();
    lat = latitude;
    lng = longitude;

    const prompt = `Given the following location, analyze how a potential wildfire might spread over time:
Location: ${address} (${lat}, ${lng})

Consider factors like:
- Local terrain and elevation
- Vegetation density and type
- Weather conditions (wind patterns, humidity)
- Urban development
- Natural barriers (rivers, mountains)
- Wind direction and speed

For each timeframe (12 hours, 24 hours, 48 hours, and 96 hours), provide:
1. A realistic spread radius in kilometers from the origin point, considering terrain and conditions
2. A description of the fire's impact and behavior

Format the response with:
- hours: number (12, 24, 48, or 96)
- radius: number (realistic spread distance in kilometers)
- impact: string (detailed description of fire behavior and impact)`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Parse the response and generate polygon coordinates
    const baseResponse = JSON.parse(result.response.text());
    console.log("Gemini response:", baseResponse); // Debug log

    // Ensure we have the expected timeframes with radius
    if (!baseResponse.timeframes?.length) {
      throw new Error("Invalid response format from Gemini");
    }

    // Transform the response to include polygon coordinates
    const timeframes = baseResponse.timeframes.map((frame: any) => {
      // Ensure we have a valid radius, default to small value if missing
      const radius = typeof frame.radius === "number" ? frame.radius : 2;

      // Generate polygon points with wind influence (randomly generated for now)
      const windDirection = Math.random() * 360; // Random wind direction
      const coordinates = generatePolygonPoints(
        lat,
        lng,
        radius,
        windDirection,
        12
      );

      return {
        hours: frame.hours,
        coordinates,
        impact: frame.impact,
      };
    });

    const response = {
      timeframes,
      explanation:
        baseResponse.explanation ||
        "Fire spread simulation based on local conditions",
    };

    console.log("Sending response:", response); // Debug log
    //flatten response just to print it
    const flattenedResponse = response.timeframes.map((timeframe: any) => ({
      hours: timeframe.hours,
      coordinates: timeframe.coordinates,
      impact: timeframe.impact,
    }));
    console.log("Flattened response:", flattenedResponse);
    //flatten even the coordinates
    const flattenedCoordinates = response.timeframes.map((timeframe: any) =>
      timeframe.coordinates.map((coordinate: any) => ({
        lat: coordinate.lat,
        lng: coordinate.lng,
      }))
    );
    console.log("Flattened coordinates:", flattenedCoordinates);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in fire simulation:", error);
    // Return a minimal simulation if there's an error
    const fallbackTimeframes = [12, 24, 48, 96].map((hours) => ({
      hours,
      coordinates: generatePolygonPoints(lat, lng, hours / 6), // Simple radius based on hours
      impact: "Fire spreading based on local conditions",
    }));

    return NextResponse.json({
      timeframes: fallbackTimeframes,
      explanation: "Basic fire spread simulation",
    });
  }
}
