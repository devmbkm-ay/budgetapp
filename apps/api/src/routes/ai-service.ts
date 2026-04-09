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
 * Génère des insights IA via Gemini (Fallback via Fetch)
 */
async function generateAIInsightsWithGemini(transactions: any[], userEmail: string) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const prompt = {
        contents: [{
            parts: [{
                text: `En tant qu'assistant financier expert, analyse le profil de Ricardo :
- Dépenses : ${totalExpense}€
- Revenus : ${totalIncome}€
- Surplus : ${totalIncome - totalExpense}€

Fournis 3 conseils courts (en français) axés sur l'épargne et l'investissement BTC.
Format : un conseil par ligne, maximum 15 mots par conseil. Pas de numérotation.`
            }]
        }]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prompt),
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data: any = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        return {
            summary: "Analyse intelligente (via Gemini).",
            insights: text.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 3),
            metadata: { model: "gemini-pro", analysis_date: new Date().toISOString() }
        };
    } catch (error) {
        console.error("[GEMINI ERROR]", error);
        throw error;
    }
}

/**
 * Génère des insights IA via OpenAI basés sur l'analyse comportementale des transactions
 */
async function generateAIInsightsWithOpenAI(transactions: any[], userEmail: string) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Préparer le contexte pour Claude
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
        const cat = t.category || 'Divers';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const prompt = `Analysez ce profil de dépenses et fournissez 3 conseils financiers personnalisés pour Ricardo:

Dépenses totales: ${totalExpense}€
Revenus totaux: ${totalIncome}€
Ratio dépenses/revenus: ${totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%

Top catégories:
${topCategories.map(([cat, amount]) => `- ${cat}: ${amount}€ (${Math.round((amount / totalExpense) * 100)}%)`).join('\n')}

Nombre de transactions: ${transactions.length}

Fournissez des conseils:
1. Actionnable et spécifique
2. Positifs et motivants
3. En français et personnalisés pour Ricardo

Format: Un conseil par ligne, sans numérotation.`;

    try {
        const message = await getOpenAIClient().chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const insights = message.choices
            .filter(choice => choice.message?.content)
            .map(choice => choice.message!.content)
            .join('\n')
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .slice(0, 3);

        return {
            summary: `Analyse intelligente de vos ${transactions.length} opérations.`,
            insights: insights,
            metadata: {
                model: "gpt-4o-mini",
                analysis_date: new Date().toISOString(),
                transaction_count: transactions.length,
            }
        };
    } catch (error) {
        console.error("[OPENAI ERROR]", error);
        throw error;
    }
}

/**
 * Scanne un ticket de reçu et extrait les informations via OCR + Classification
 */
async function scanReceiptImage(imageBase64: string) {
    try {
        // Convertir l'image base64 en buffer pour traitement
        const imageBuffer = Buffer.from(imageBase64, 'base64');

        // Redimensionner l'image pour améliorer l'OCR (optionnel mais recommandé)
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();

        // Exécuter Tesseract.js pour l'OCR
        const result = await Tesseract.recognize(optimizedBuffer, 'fra');
        const text = result?.data?.text || '';

        if (!text || text.length === 0) {
            throw new Error("Unable to extract text from image");
        }

        // Parser le texte OCR
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Détection de montants (regex pour prix)
        const amountMatches = text.match(/(\d+[.,]\d{2})\s*€?/g) || [];
        const lastAmount = amountMatches.at(-1);
        const amount = lastAmount ? parseFloat(lastAmount.replace(',', '.')) : 0;

        // Détection du marchand (généralement en début de ticket)
        const merchant = lines[0] || 'Marchand inconnu';

        // Classification automatique basée sur mots-clés
        const categoryKeywords: Record<string, string[]> = {
            'Alimentaire': ['carrefour', 'leclerc', 'monoprix', 'intermarché', 'auchan', 'super', 'marché', 'boulangerie', 'boucherie', 'fruits', 'légumes', 'épicerie', 'magasin bio'],
            'Restaurants': ['restaurant', 'pizzeria', 'burger', 'brasserie', 'bistrot', 'snack', 'kebab', 'sushi', 'couscous'],
            'Cafés & Bars': ['cafe', 'bar', 'café', 'bar à vin', 'pub', 'cocktail'],
            'Transport': ['essence', 'carburant', 'parking', 'peage', 'stib', 'sncf', 'ratp', 'fuel', 'taxi', 'uber', 'train', 'autolib', 'vélib'],
            'Vêtements': ['vêtement', 'chaussure', 'habit', 'zara', 'h&m', 'uniqlo', 'nike', 'adidas', 'fashion', 'boutique vêtement'],
            'Électronique': ['electro', 'darty', 'fnac', 'amazon', 'apple', 'samsung', 'informatique', 'téléphone', 'informatique'],
            'Divertissement': ['cinema', 'concert', 'musee', 'théâtre', 'cinema', 'spotify', 'netflix', 'jeux', 'vidéo'],
            'Loisirs & Sports': ['sport', 'gym', 'fitness', 'parc', 'jeux', 'tennis', 'piscine', 'loisir'],
            'Santé': ['pharmacie', 'docteur', 'hopital', 'medical', 'dent', 'dentiste', 'médecin', 'santé'],
            'Éducation': ['ecole', 'université', 'cours', 'formatio', 'école', 'lycée', 'collège', 'tuteur'],
            'Logement': ['loyer', 'hypotheque', 'agence immobiliere', 'propriétaire'],
            'Utilitaires': ['eau', 'électricité', 'gaz', 'internet', 'téléphone', 'assurance'],
        };

        let category = 'Divers';
        const textLower = text.toLowerCase();

        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => textLower.includes(kw))) {
                category = cat;
                break;
            }
        }

        return {
            merchant: merchant,
            amount: amount,
            category: category,
            confidence: amount > 0 ? 0.85 : 0.60,
            raw_text: text.substring(0, 500), // Limiter pour pas surcharger la réponse
            extracted_at: new Date().toISOString()
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
     * Analyse les transactions avec Claude pour des insights personnalisés
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

            let analysis;
            try {
                analysis = await generateAIInsightsWithOpenAI(transactions, body.userEmail);
            } catch (err) {
                console.warn("OpenAI failed or quota reached, falling back to Gemini...");
                analysis = await generateAIInsightsWithGemini(transactions, body.userEmail);
            }
            return analysis;

        } catch (error) {
            console.error("[AI SERVICE ERROR]", error);
            set.status = 500;
            return {
                error: "Erreur lors de l'analyse IA",
                details: String(error),
                hint: "Vérifie tes clés API (OPENAI_API_KEY ou GEMINI_API_KEY) dans .env"
            };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            period: t.Optional(t.String())
        })
    })
    /**
     * POST /ai/scan-receipt
     * Scanne une image de ticket et extrait merchant/montant/catégorie via OCR
     */
    .post("/scan-receipt", async ({ body, set }) => {
        try {
            if (!body.image) {
                set.status = 400;
                return { error: "Image requise en base64" };
            }

            // Valider que c'est du base64
            if (!body.image.match(/^[A-Za-z0-9+/=]+$/)) {
                set.status = 400;
                return { error: "Format d'image invalide (base64 attendu)" };
            }

            const scanResult = await scanReceiptImage(body.image);
            return scanResult;

        } catch (error) {
            console.error("[OCR ERROR]", error);
            set.status = 500;
            return {
                error: "Erreur lors du scan OCR",
                details: String(error)
            };
        }
    }, {
        body: t.Object({
            image: t.String({ description: "Image du reçu en base64" }),
            userEmail: t.Optional(t.String())
        })
    })
    /**
     * POST /ai/batch-scan-receipts
     * Scanne plusieurs tickets en une seule requête
     */
    .post("/batch-scan-receipts", async ({ body, set }) => {
        try {
            if (!Array.isArray(body.images) || body.images.length === 0) {
                set.status = 400;
                return { error: "Au moins une image requise" };
            }

            const results = await Promise.all(
                body.images.map(img => scanReceiptImage(img))
            );

            return {
                scanned_count: results.length,
                results: results,
                total_amount: results.reduce((sum, r) => sum + r.amount, 0),
                processed_at: new Date().toISOString()
            };

        } catch (error) {
            console.error("[BATCH OCR ERROR]", error);
            set.status = 500;
            return { error: "Erreur lors du scan en batch" };
        }
    }, {
        body: t.Object({
            images: t.Array(t.String()),
            userEmail: t.Optional(t.String())
        })
    });
