export type InsightTone = "positive" | "neutral" | "warning";
export type ForecastStatus = "stable" | "watch" | "risky";
export type CategoryPressure = "low" | "medium" | "high";
export type TransactionType = "expense" | "income";

export interface InsightTransaction {
  amount: number;
  category: string | null;
  currency: string;
  date: string;
  id: string;
  label: string;
  type: TransactionType;
  userEmail: string;
  userId: string;
  userName: string | null;
}

export interface PeriodSummary {
  daysElapsed: number;
  month: string;
  totalDays: number;
}

export interface TotalsSummary {
  balance: number;
  expenses: number;
  income: number;
}

export interface ForecastSummary {
  averageDailyExpense: number;
  projectedEndBalance: number;
  projectedMonthExpense: number;
  status: ForecastStatus;
}

export interface CategorySummary {
  amount: number;
  category: string;
  pressure: CategoryPressure;
  share: number;
}

export interface AssistantInsight {
  body: string;
  id: string;
  title: string;
  tone: InsightTone;
}

export interface InsightsSummary {
  categories: CategorySummary[];
  forecast: ForecastSummary;
  insights: AssistantInsight[];
  period: PeriodSummary;
  totals: TotalsSummary;
}

const DEFAULT_CATEGORY = "Categorie libre";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function getPeriod(now: Date): PeriodSummary {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return {
    daysElapsed: now.getUTCDate(),
    month: `${year}-${String(month + 1).padStart(2, "0")}`,
    totalDays: new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  };
}

function getForecastStatus(balance: number, income: number) {
  if (balance <= 0) {
    return "risky";
  }

  if (income > 0 && balance <= income * 0.25) {
    return "watch";
  }

  if (income === 0 && balance < 150) {
    return "watch";
  }

  return "stable";
}

function getCategoryPressure(share: number): CategoryPressure {
  if (share >= 0.4) {
    return "high";
  }

  if (share >= 0.2) {
    return "medium";
  }

  return "low";
}

function buildCategorySummaries(transactions: InsightTransaction[]) {
  const expenseTransactions = transactions.filter((transaction) => transaction.type === "expense");
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (totalExpenses <= 0) {
    return [];
  }

  const categoryMap = new Map<string, number>();

  for (const transaction of expenseTransactions) {
    const category = transaction.category ?? DEFAULT_CATEGORY;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + transaction.amount);
  }

  return [...categoryMap.entries()]
    .map(([category, amount]) => {
      const share = amount / totalExpenses;

      return {
        amount: roundCurrency(amount),
        category,
        pressure: getCategoryPressure(share),
        share: roundCurrency(share),
      };
    })
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 3);
}

function buildInsights({
  categories,
  forecast,
  totals,
}: Pick<InsightsSummary, "categories" | "forecast" | "totals">): AssistantInsight[] {
  const insights: AssistantInsight[] = [];

  if (totals.income === 0 && totals.expenses === 0) {
    return [{
      body: "Ajoutez vos premiers mouvements pour activer les previsions et les signaux de categorie.",
      id: "empty-month",
      title: "Money Pulse en attente",
      tone: "neutral",
    }];
  }

  if (forecast.status === "risky") {
    insights.push({
      body: `Au rythme actuel, votre fin de mois pourrait terminer autour de ${roundCurrency(forecast.projectedEndBalance)}.`,
      id: "forecast-risky",
      title: "Fin de mois sous tension",
      tone: "warning",
    });
  } else if (forecast.status === "watch") {
    insights.push({
      body: "Votre trajectoire reste positive, mais la marge se resserre si le rythme actuel continue.",
      id: "forecast-watch",
      title: "Fin de mois a surveiller",
      tone: "warning",
    });
  } else {
    insights.push({
      body: "Votre rythme de depense reste compatible avec une fin de mois encore confortable.",
      id: "forecast-stable",
      title: "Trajectoire stable",
      tone: "positive",
    });
  }

  const dominantCategory = categories[0];

  if (dominantCategory) {
    insights.push({
      body: `${dominantCategory.category} concentre ${Math.round(dominantCategory.share * 100)} % de vos depenses du mois.`,
      id: "category-pressure",
      title: "Categorie dominante",
      tone: dominantCategory.pressure === "high" ? "warning" : "neutral",
    });
  }

  if (forecast.averageDailyExpense > 0) {
    insights.push({
      body: `Vous depensez en moyenne ${roundCurrency(forecast.averageDailyExpense)} par jour sur la periode en cours.`,
      id: "burn-rate",
      title: "Rythme de depense",
      tone: "neutral",
    });
  }

  return insights.slice(0, 3);
}

export function buildMonthlyInsights(
  transactions: InsightTransaction[],
  now = new Date(),
): InsightsSummary {
  const period = getPeriod(now);
  const hasTransactions = transactions.length > 0;
  const totals = transactions.reduce<TotalsSummary>((accumulator, transaction) => {
    if (transaction.type === "income") {
      accumulator.income += transaction.amount;
      accumulator.balance += transaction.amount;
    } else {
      accumulator.expenses += transaction.amount;
      accumulator.balance -= transaction.amount;
    }

    return accumulator;
  }, {
    balance: 0,
    expenses: 0,
    income: 0,
  });

  totals.balance = roundCurrency(totals.balance);
  totals.expenses = roundCurrency(totals.expenses);
  totals.income = roundCurrency(totals.income);

  const averageDailyExpense = totals.expenses / Math.max(period.daysElapsed, 1);
  const projectedMonthExpense = averageDailyExpense * period.totalDays;
  const projectedEndBalance = totals.income - projectedMonthExpense;
  const forecast: ForecastSummary = {
    averageDailyExpense: roundCurrency(averageDailyExpense),
    projectedEndBalance: roundCurrency(projectedEndBalance),
    projectedMonthExpense: roundCurrency(projectedMonthExpense),
    status: hasTransactions ? getForecastStatus(projectedEndBalance, totals.income) : "stable",
  };

  const categories = buildCategorySummaries(transactions);

  return {
    categories,
    forecast,
    insights: buildInsights({ categories, forecast, totals }),
    period,
    totals,
  };
}
