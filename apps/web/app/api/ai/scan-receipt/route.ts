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

/**
 * Tentative de scan via Gemini Vision
 */
async function scanWithGemini(imageBase64: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const promptText = `Tu es un scanner de ticket de caisse financier. Extrais les informations de cette image et retourne UNIQUEMENT un objet JSON valide avec ces champs:
- "label": nom du marchand ou courte description (string, français)
- "amount": montant total payé en nombre (point décimal)
- "category": une valeur parmi exactement: ${CATEGORIES.join(", ")}
- "date": date au format YYYY-MM-DD
- "confidence": nombre entre 0 et 1

Retourne UNIQUEMENT le JSON, sans markdown.`;

  const payload = {
    contents: [{
      parts: [
        { text: promptText },
        { inline_data: { mime_type: mimeType, data: imageBase64 } }
      ]
    }]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Vision error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  // Initialisation d'une réponse par défaut (Fallback manuel)
  // Cela permet au formulaire de se remplir même si toutes les IA échouent
  const defaultData = {
    label: "Scan effectué (Saisie manuelle requise)",
    amount: 0,
    category: "Alimentaire",
    date: new Date().toISOString().split('T')[0],
    confidence: 0,
    method: "none"
  };

  try {
    const body = await request.json() as { image: string; mimeType?: string };
    if (!body.image) {
      return NextResponse.json({ error: "Image requise." }, { status: 400 });
    }

    const mimeType = body.mimeType ?? "image/jpeg";

    // 1. Tentative OpenAI (gpt-4o-mini)
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Tu es un scanner de ticket de caisse. Extrais les informations de cette image et retourne UNIQUEMENT un objet JSON valide avec ces champs:
- "label": nom du marchand ou courte description de l'achat (string, en français)
- "amount": montant total payé en nombre (sans symbole monétaire, point comme séparateur décimal)
- "category": une valeur parmi exactement: ${CATEGORIES.join(", ")}
- "date": date d'achat au format YYYY-MM-DD, ou null si non visible
- "confidence": nombre entre 0 et 1

Retourne UNIQUEMENT le JSON.`;

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

        if (response.ok) {
          const data = await response.json() as { choices: Array<{ message: { content: string } }> };
          const raw = data.choices[0]?.message?.content ?? "";
          const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({ ...parsed, method: "openai" });
        }
      } catch {
        console.warn("[SCAN] OpenAI failed, trying Gemini...");
      }
    }

    // 2. Tentative Gemini Vision
    try {
      const parsed = await scanWithGemini(body.image, mimeType);
      return NextResponse.json({ ...parsed, method: "gemini" });
    } catch (err) {
      console.error("[SCAN] Gemini failed as well:", err);
      
      // 3. ULTIME FALLBACK : Au lieu de renvoyer une erreur 502/500,
      // on renvoie un objet "vide" mais valide pour que le formulaire s'ouvre.
      return NextResponse.json({ 
        ...defaultData, 
        error: "L'IA n'a pas pu analyser l'image, veuillez remplir les champs manuellement." 
      });
    }

  } catch (error) {
    console.error("Scan receipt critical failure:", error);
    // Même en cas d'erreur de parsing JSON ou autre, on renvoie du data par défaut
    return NextResponse.json(defaultData);
  }
}
