import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

export const maxDuration = 60; // Vercel Hobby max

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

    const prompt = `Tu es un scanner de ticket de caisse. Extrais les informations de cette image et retourne UNIQUEMENT un objet JSON valide avec ces champs:
- "label": nom du marchand ou courte description de l'achat (string, en français)
- "amount": montant total payé en nombre (sans symbole monétaire, point comme séparateur décimal)
- "category": une valeur parmi exactement: ${CATEGORIES.join(", ")}
- "date": date d'achat au format YYYY-MM-DD (ex: 2026-04-02 pour le 2 avril 2026), convertis depuis n'importe quel format (DD-MM-YYYY, DD/MM/YYYY, etc.), ou null si non visible
- "confidence": nombre entre 0 et 1 indiquant ta confiance

Retourne UNIQUEMENT le JSON, sans explication ni markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
