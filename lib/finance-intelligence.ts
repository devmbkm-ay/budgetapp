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

export interface ComparisonDelta {
  direction: "down" | "flat" | "up";
  value: number;
}

export interface ComparisonSummary {
  expenseDelta: ComparisonDelta;
  incomeDelta: ComparisonDelta;
  previousMonth: string;
  topImprovementCategory: string | null;
  topRisingCategory: string | null;
}

export interface InsightsSummary {
  categories: CategorySummary[];
  comparison: ComparisonSummary;
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

function buildCategoryMap(transactions: InsightTransaction[]) {
  const categoryMap = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const category = transaction.category ?? DEFAULT_CATEGORY;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + transaction.amount);
  }

  return categoryMap;
}

function buildDelta(current: number, previous: number): ComparisonDelta {
  const value = roundCurrency(current - previous);

  if (value > 0) {
    return { direction: "up", value };
  }

  if (value < 0) {
    return { direction: "down", value: Math.abs(value) };
  }

  return { direction: "flat", value: 0 };
}

function getPreviousMonthLabel(now: Date) {
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  return `${previousMonth.getUTCFullYear()}-${String(previousMonth.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildComparison(
  currentTransactions: InsightTransaction[],
  previousTransactions: InsightTransaction[],
  now: Date,
): ComparisonSummary {
  const currentTotals = currentTransactions.reduce<TotalsSummary>((accumulator, transaction) => {
    if (transaction.type === "income") {
      accumulator.income += transaction.amount;
    } else {
      accumulator.expenses += transaction.amount;
    }

    return accumulator;
  }, {
    balance: 0,
    expenses: 0,
    income: 0,
  });
  const previousTotals = previousTransactions.reduce<TotalsSummary>((accumulator, transaction) => {
    if (transaction.type === "income") {
      accumulator.income += transaction.amount;
    } else {
      accumulator.expenses += transaction.amount;
    }

    return accumulator;
  }, {
    balance: 0,
    expenses: 0,
    income: 0,
  });

  const currentCategoryMap = buildCategoryMap(currentTransactions);
  const previousCategoryMap = buildCategoryMap(previousTransactions);
  const categories = new Set([
    ...currentCategoryMap.keys(),
    ...previousCategoryMap.keys(),
  ]);

  let topRisingCategory: string | null = null;
  let topImprovementCategory: string | null = null;
  let highestRise = 0;
  let highestDrop = 0;

  for (const category of categories) {
    const delta = (currentCategoryMap.get(category) ?? 0) - (previousCategoryMap.get(category) ?? 0);

    if (delta > highestRise) {
      highestRise = delta;
      topRisingCategory = category;
    }

    if (delta < highestDrop) {
      highestDrop = delta;
      topImprovementCategory = category;
    }
  }

  return {
    expenseDelta: buildDelta(currentTotals.expenses, previousTotals.expenses),
    incomeDelta: buildDelta(currentTotals.income, previousTotals.income),
    previousMonth: getPreviousMonthLabel(now),
    topImprovementCategory,
    topRisingCategory,
  };
}

function buildInsights({
  comparison,
  categories,
  forecast,
  totals,
}: Pick<InsightsSummary, "categories" | "comparison" | "forecast" | "totals">): AssistantInsight[] {
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

  if (comparison.expenseDelta.direction === "up") {
    insights.push({
      body: `Vos depenses progressent de ${comparison.expenseDelta.value} par rapport a ${comparison.previousMonth}.`,
      id: "expense-delta-up",
      title: "Depenses en hausse",
      tone: comparison.expenseDelta.value >= 100 ? "warning" : "neutral",
    });
  } else if (comparison.expenseDelta.direction === "down") {
    insights.push({
      body: `Vos depenses reculent de ${comparison.expenseDelta.value} par rapport a ${comparison.previousMonth}.`,
      id: "expense-delta-down",
      title: "Depenses en recul",
      tone: "positive",
    });
  }

  if (comparison.topRisingCategory) {
    insights.push({
      body: `${comparison.topRisingCategory} est la categorie qui accelere le plus par rapport au mois precedent.`,
      id: "top-rising-category",
      title: "Categorie a surveiller",
      tone: "warning",
    });
  } else if (comparison.topImprovementCategory) {
    insights.push({
      body: `${comparison.topImprovementCategory} est la categorie qui se calme le plus par rapport au mois precedent.`,
      id: "top-improvement-category",
      title: "Amelioration visible",
      tone: "positive",
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
  currentTransactions: InsightTransaction[],
  previousTransactions: InsightTransaction[] = [],
  now = new Date(),
): InsightsSummary {
  const period = getPeriod(now);
  const hasTransactions = currentTransactions.length > 0;
  const totals = currentTransactions.reduce<TotalsSummary>((accumulator, transaction) => {
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

  const categories = buildCategorySummaries(currentTransactions);
  const comparison = buildComparison(currentTransactions, previousTransactions, now);

  return {
    categories,
    comparison,
    forecast,
    insights: buildInsights({ categories, comparison, forecast, totals }),
    period,
    totals,
  };
}
