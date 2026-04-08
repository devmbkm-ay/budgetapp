import { Elysia, t } from "elysia";
import { listTransactions } from "../../../../packages/database/index.ts";

/**
 * Analyse les transactions de l'utilisateur pour générer des conseils financiers.
 * Intégré directement avec Ricardo (via OpenClaw) pour une analyse personnalisée.
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
        insights.push(`Ricardo, ton poste de dépense principal est '${topCategory[0]}' (${percent}% du total). C'est là que se trouve ton plus gros levier d'économie.`);
    }

    // Conseil 2: Ratio Revenu/Dépense
    if (totalIncome > 0) {
        const ratio = (totalExpense / totalIncome) * 100;
        if (ratio > 90) {
            insights.push("Attention : tu consommes plus de 90% de tes revenus. Pense à automatiser une épargne dès le virement du salaire.");
        } else if (ratio < 50) {
            insights.push(`Excellent ratio ! Tu ne dépenses que ${Math.round(ratio)}% de tes revenus. C'est le moment idéal pour investir l'excédent.`);
        } else {
            insights.push(`Équilibre maintenu : tu dépenses ${Math.round(ratio)}% de tes revenus ce mois-ci.`);
        }
    }

    // Conseil 3: Détection d'abonnements et frais fixes
    const subscriptions = expenses.filter(t => 
        /netflix|spotify|icloud|amazon|canal|disney|adobe|internet|mobile|assurance|loyer/i.test(t.label)
    );
    if (subscriptions.length > 0) {
        insights.push(`J'ai repéré ${subscriptions.length} prélèvements qui ressemblent à des abonnements. Un tri régulier est la clé d'un budget sain.`);
    } else {
        insights.push("Ta structure de coûts semble légère en abonnements. C'est un bon point pour ta flexibilité financière.");
    }

    // Conseil 4: Astuce personnalisée
    if (expenses.some(t => t.category === 'Shopping' || t.category === 'Loisirs')) {
        insights.push("Petit rappel Ricardo : pour tes achats plaisir, la règle des 48h (attendre avant de valider) permet d'éviter les dépenses impulsives.");
    }

    return {
        summary: `Analyse de vos ${transactions.length} dernières opérations terminée.`,
        insights: insights.slice(0, 3) // On garde les 3 meilleurs conseils
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
                    summary: "Analyse indisponible.",
                    insights: ["Ajoute au moins 3 transactions pour activer le cerveau de l'IA."]
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
