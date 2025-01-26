import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

//
// Configure the SDK with your Gemini API key:
//
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

//
// Define a response schema so the model always returns valid JSON.
// Here, we want an object with two fields: riskScore (1–100) and explanation.
//
const structuredSchema = {
  description:
    "Fire risk data including an integer risk score and an explanation.",
  type: SchemaType.OBJECT,
  properties: {
    riskScore: {
      type: SchemaType.NUMBER,
      description: "Fire risk score from 10–100",
      nullable: false,
    },
    explanation: {
      type: SchemaType.STRING,
      description:
        "Brief explanation of the risk assessment in 2-3 concise sentences",
      nullable: false,
    },
  },
  required: ["riskScore", "explanation"],
};

//
// Create a model instance that always responds with valid JSON
// conforming to the schema above.
//
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: structuredSchema,
  },
});

//
// Our API endpoint: POST /api/fire-risk
//
export async function POST(request: Request) {
  try {
    const { lat, lng, address, date } = await request.json();

    //
    // Build a user-friendly prompt that asks Gemini for the fire risk assessment.
    //
    const prompt = `Given the following location and date, assess the wildfire risk:
Location: ${address} (${lat}, ${lng})
Date: ${date}

Consider factors like:
- Historical fire patterns
- Climate conditions
- Vegetation
- Urban proximity

- For example, areas with the highest risk such as California during the summer would be 100, areas with low risk such as the Northeast during the winter would be close to 10, and areas in between such as the Midwest during the fall would be somewhere in between. Scale this risk depending on the time of year.

Provide a risk score from 1–100 (where 100 is highest risk) and a brief explanation in 2-3 concise sentences. This is on a scale for the United States so there should be some places that would be 0, some that would be 100, and some that would be anywhere in between. Be accurate and realistic. Do not ever give a 10 score. It need to be 10-100`;

    //
    // Send the prompt to Gemini, which will respond with valid JSON
    // conforming to the schema we defined (riskScore, explanation).
    //
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    //
    // The model's JSON response is located in result.response.text().
    // Parse it to extract the fields we need.
    //
    const { riskScore, explanation } = JSON.parse(result.response.text());

    //
    // Return the data as JSON to the caller.
    //
    return NextResponse.json({ riskScore, explanation });
  } catch (error) {
    console.error("Error in fire risk assessment:", error);
    return NextResponse.json(
      { error: "Failed to assess fire risk" },
      { status: 500 }
    );
  }
}
