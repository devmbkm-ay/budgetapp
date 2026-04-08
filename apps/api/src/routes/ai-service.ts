import { Elysia, t } from "elysia";
import { listTransactions } from "../../../../packages/database/index.ts";

/**
 * Analyse les transactions de l'utilisateur pour générer des conseils financiers.
 */
async function generateAIInsights(transactions: any[], userEmail: string) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Analyse par catégorie
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
        const cat = t.category || 'Divers';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const topCategory = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)[0];

    const insights: string[] = [];

    // Conseil 1: Analyse de la plus grosse dépense
    if (topCategory) {
        const percent = Math.round((topCategory[1] / totalExpense) * 100);
        insights.push(`Ricardo, ta catégorie principale est '${topCategory[0]}' (${percent}% de tes dépenses). Est-ce un poste que tu peux optimiser ?`);
    }

    // Conseil 2: Ratio Revenu/Dépense
    if (totalIncome > 0) {
        const ratio = (totalExpense / totalIncome) * 100;
        if (ratio > 90) {
            insights.push("Attention, tu dépenses plus de 90% de tes revenus. Pense à mettre de côté en début de mois !");
        } else {
            insights.push(`Super job ! Tu ne dépenses que ${Math.round(ratio)}% de tes revenus ce mois-ci.`);
        }
    }

    // Conseil 3: Détection d'abonnements (basé sur libellés communs)
    const subscriptions = expenses.filter(t => 
        /netflix|spotify|icloud|amazon|canal|disney|adobe|internet|mobile/i.test(t.label)
    );
    if (subscriptions.length > 0) {
        insights.push(`J'ai détecté ${subscriptions.length} abonnements potentiels. Un petit tri annuel fait souvent gagner 100€/an.`);
    } else {
        insights.push("Pas d'abonnements récurrents lourds détectés. Ta structure de coûts fixes semble saine.");
    }

    return {
        summary: `Analyse de vos ${transactions.length} dernières transactions effectuée.`,
        insights: insights
    };
}

export const aiServiceRoute = new Elysia({ prefix: "/ai" })
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    .post("/analyze-trends", async ({ body, set }) => {
        try {
            const transactions = await listTransactions(body.userEmail);
            
            if (transactions.length < 3) {
                return {
                    summary: "Pas assez de données pour une analyse pertinente.",
                    insights: ["Ajoute au moins 3 transactions pour que je puisse commencer à t'aider !"]
                };
            }

            const analysis = await generateAIInsights(transactions, body.userEmail);
            return analysis;

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
    .post("/scan-receipt", async ({ body }) => {
        return {
            merchant: "En attente d'implémentation Vision",
            amount: 0,
            category: "Divers",
            confidence: 0
        };
    }, {
        body: t.Object({
            image: t.String()
        })
    });
