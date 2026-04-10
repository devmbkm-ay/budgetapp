import { Elysia, t } from "elysia";
import { listTransactions } from "../../../../packages/database/index.ts";
import OpenAI from "openai";
import sharp from "sharp";
import Tesseract from "tesseract.js";

// Lazy initialization of AI clients
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

/**
 * Analyse une image de reçu via Gemini Vision (v1beta)
 */
async function generateVisionInsightsWithGemini(imageBase64: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const prompt = {
        contents: [{
            parts: [
                { text: "Analyse ce ticket de caisse. Extrais : le nom du marchand (label), le montant total (amount) sous forme de nombre, la date (date) au format YYYY-MM-DD, et la catégorie (category) parmi [Alimentaire, Restaurants, Transport, Vêtements, Électronique, Divers]. Réponds uniquement en JSON pur." },
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: imageBase64
                    }
                }
            ]
        }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini Vision API error (${response.status}): ${errorBody}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    
    // Nettoyer le JSON potentiel (enlever les markdown blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse Gemini Vision JSON:", text);
        throw new Error("Invalid JSON returned from AI");
    }
}

/**
 * Fallback OCR classique (Tesseract) si l'IA échoue
 */
async function scanReceiptWithOCR(imageBase64: string) {
    try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();

        const result = await Tesseract.recognize(optimizedBuffer, 'fra');
        const text = result?.data?.text || '';

        const amountMatches = text.match(/(\d+[.,]\d{2})\s*€?/g) || [];
        const lastAmount = amountMatches.at(-1);
        const amount = lastAmount ? parseFloat(lastAmount.replace(',', '.')) : 0;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        return {
            label: lines[0] || 'Marchand inconnu',
            amount: amount,
            category: 'Divers',
            date: new Date().toISOString().split('T')[0],
            method: "OCR-Legacy"
        };
    } catch (error) {
        console.error("[OCR ERROR]", error);
        throw error;
    }
}

export const aiServiceRoute = new Elysia({ prefix: "/ai" })
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    /**
     * POST /ai/analyze-trends
     * Analyse les transactions pour des insights personnalisés
     */
    .post("/analyze-trends", async ({ body, set }) => {
        try {
            const transactions = await listTransactions(body.userEmail);

            if (transactions.length < 3) {
                return {
                    summary: "Analyse indisponible.",
                    insights: ["Ajoute au moins 3 transactions pour activer le cerveau de l'IA."]
                };
            }

            // Simple logic for now as trends use Gemini fallback which is currently 404
            return {
                summary: `Analyse de vos ${transactions.length} opérations.`,
                insights: ["Analyse IA en cours de maintenance..."],
                metadata: { analysis_date: new Date().toISOString() }
            };

        } catch (error) {
            console.error("[AI SERVICE ERROR]", error);
            set.status = 500;
            return { error: "Erreur lors de l'analyse IA", details: String(error) };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            period: t.Optional(t.String())
        })
    })
    /**
     * POST /ai/scan-receipt
     * Scanne une image de ticket via Gemini Vision ou OCR
     */
    .post("/scan-receipt", async ({ body, set }) => {
        try {
            if (!body.image) {
                set.status = 400;
                return { error: "Image requise" };
            }

            try {
                // Tentative avec Gemini Vision
                console.log("[SCAN] Attempting Gemini Vision analysis...");
                const aiResult = await generateVisionInsightsWithGemini(body.image);
                return { ...aiResult, method: "Gemini-Vision" };
            } catch (err: any) {
                console.warn("[AI SCAN FALLBACK] Gemini Vision failed, using OCR...", err.message);
                const ocrResult = await scanReceiptWithOCR(body.image);
                return { ...ocrResult, error: err.message };
            }

        } catch (error) {
            console.error("[SCAN ERROR]", error);
            set.status = 500;
            return {
                error: "Erreur lors du scan",
                details: String(error)
            };
        }
    }, {
        body: t.Object({
            image: t.String({ description: "Image du reçu en base64" }),
            userEmail: t.Optional(t.String())
        })
    });
