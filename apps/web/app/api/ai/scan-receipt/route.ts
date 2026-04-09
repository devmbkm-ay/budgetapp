import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

export const maxDuration = 30; // seconds — Vercel Hobby allows up to 60s

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

const CATEGORIES = [
  "Alimentaire", "Restaurants", "Cafés & Bars", "Transport", "Vêtements",
  "Électronique", "Divertissement", "Loisirs & Sports", "Santé", "Éducation",
  "Logement", "Utilitaires",
];

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  try {
    const body = await request.json() as { image: string; mimeType?: string };
    if (!body.image) {
      return NextResponse.json({ error: "Image requise." }, { status: 400 });
    }

    const mimeType = body.mimeType ?? "image/jpeg";

    const prompt = `You are a receipt scanner. Extract information from this receipt image and return ONLY a valid JSON object with these fields:
- "label": the merchant name or a short description of the purchase (string, in French if possible)
- "amount": the total amount paid as a number (no currency symbol, use . as decimal separator)
- "category": one of exactly these values: ${CATEGORIES.join(", ")}
- "date": the purchase date in YYYY-MM-DD format, or null if not visible
- "confidence": a number between 0 and 1 indicating how confident you are in the extraction

Return ONLY the JSON, no explanation, no markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${body.image}`, detail: "low" },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json({ error: "Service IA indisponible." }, { status: 502 });
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const raw = data.choices[0]?.message?.content ?? "";

    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let parsed: { label: string; amount: number; category: string; date: string | null; confidence: number };
    try {
      parsed = JSON.parse(cleaned) as typeof parsed;
    } catch {
      console.error("Failed to parse AI response:", raw);
      return NextResponse.json({ error: "Impossible d'analyser le ticket." }, { status: 422 });
    }

    // Validate category
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = "Alimentaire";
    }

    return NextResponse.json({
      label: parsed.label ?? "",
      amount: typeof parsed.amount === "number" ? parsed.amount : parseFloat(String(parsed.amount)) || 0,
      category: parsed.category,
      date: parsed.date ?? null,
      confidence: parsed.confidence ?? 0.5,
    });
  } catch (error) {
    console.error("Scan receipt failed:", error);
    return NextResponse.json({ error: "Erreur lors du scan." }, { status: 500 });
  }
}
