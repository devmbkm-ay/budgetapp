import { NextRequest, NextResponse } from "next/server";
import { listTransactions, type TransactionRecord } from "../../../../../../packages/database/index";

export const maxDuration = 30;
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

async function generateInsightsWithGemini(transactions: TransactionRecord[]) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const prompt = {
    contents: [{
      parts: [{
        text: `En tant qu'assistant financier expert pour Ricardo :
- Dépenses : ${totalExpense}€
- Revenus : ${totalIncome}€
- Surplus : ${totalIncome - totalExpense}€

Fournis 3 conseils financiers courts en français, incluant le potentiel d'investissement en BTC. 
Format : un conseil par ligne, sans numérotation.`
      }]
    }]
  };

  const apiKey = process.env.GEMINI_API_KEY;
  // Use gemini-1.5-flash-latest and v1 endpoint for better compatibility
  const modelId = "gemini-1.5-flash-latest";

  if (!apiKey) {
    console.error("[DEBUG] GEMINI_API_KEY is missing in environment variables");
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    console.log(`[DEBUG] Attempting Gemini API call with model: ${modelId}`);
    // Changed v1beta to v1
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DEBUG] Gemini API Error ${response.status}:`, errorBody);
      throw new Error(`Gemini error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const insights = text.split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 3);

    return {
      summary: `Analyse intelligente (${modelId}) de vos ${transactions.length} opérations.`,
      insights,
      metadata: {
        model: modelId,
        analysis_date: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.error(`[DEBUG] generateInsightsWithGemini (${modelId}) failed:`, err.message);
    throw err;
  }
}

async function generateInsights(transactions: TransactionRecord[]) {
  try {
    const expenses = transactions.filter((t) => t.type === "expense");
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((t) => {
      const cat = t.category ?? "Divers";
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + t.amount;
    });
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const prompt = `Analysez ce profil de dépenses et fournissez 3 conseils financiers personnalisés:

Dépenses totales: ${totalExpense}€
Revenus totaux: ${totalIncome}€
Ratio dépenses/revenus: ${totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%

Top catégories:
${topCategories.map(([cat, amount]) => `- ${cat}: ${amount}€ (${Math.round((amount / totalExpense) * 100)}%)`).join("\n")}

Nombre de transactions: ${transactions.length}

Fournissez des conseils: actionnables, positifs, en français. Un conseil par ligne, sans numérotation.`;

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        console.warn("[DEBUG] OPENAI_API_KEY missing, falling back to Gemini immediately");
        return generateInsightsWithGemini(transactions);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[DEBUG] OpenAI API failed (${response.status}): ${errorText}. Falling back to Gemini...`);
      return generateInsightsWithGemini(transactions);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const insights = (data.choices[0]?.message?.content ?? "")
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 3);

    return {
      summary: `Analyse intelligente de vos ${transactions.length} opérations.`,
      insights,
      metadata: {
        model: "gpt-4o-mini",
        analysis_date: new Date().toISOString(),
        transaction_count: transactions.length,
      },
    };
  } catch (error: any) {
    console.warn(`[DEBUG] generateInsights failed: ${error.message}. Falling back to Gemini...`);
    return generateInsightsWithGemini(transactions);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      console.warn("[DEBUG] Unauthorized access attempt: No valid session");
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const transactions = await listTransactions(session.email);

    if (transactions.length < 3) {
      return NextResponse.json({
        summary: "Analyse indisponible.",
        insights: ["Ajoute au moins 3 transactions pour activer le cerveau de l'IA."],
      });
    }

    const analysis = await generateInsights(transactions);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("[CRITICAL] API Route /api/ai/analyze failed:", error);
    return NextResponse.json(
      { 
        error: "Le service IA est momentanément indisponible.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}
