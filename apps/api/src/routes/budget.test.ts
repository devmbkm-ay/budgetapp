import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";

const createTransaction = mock(async (input: unknown) => ({
  amount: 42,
  category: "Alimentation",
  currency: "EUR",
  date: "2026-04-04T12:00:00Z",
  id: "tx_create",
  label: "Courses",
  type: "expense",
  userEmail: (input as { userEmail: string }).userEmail,
  userId: "user_1",
  userName: "Alice",
}));

const deleteTransaction = mock(async (transactionId: string, userEmail: string) => ({
  amount: 42,
  category: "Alimentation",
  currency: "EUR",
  date: "2026-04-04T12:00:00Z",
  id: transactionId,
  label: "Courses",
  type: "expense",
  userEmail,
  userId: "user_1",
  userName: "Alice",
}));

const getTransactionById = mock(async (transactionId: string, userEmail: string) => ({
  amount: 88,
  category: "Salaire",
  currency: "EUR",
  date: "2026-04-05T12:00:00Z",
  id: transactionId,
  label: "Prime",
  type: "income",
  userEmail,
  userId: "user_1",
  userName: "Alice",
}));

const listTransactions = mock(async (userEmail: string) => ([
  {
    amount: 42,
    category: "Alimentation",
    currency: "EUR",
    date: "2026-04-04T12:00:00Z",
    id: "tx_list",
    label: "Courses",
    type: "expense",
    userEmail,
    userId: "user_1",
    userName: "Alice",
  },
]));

const listTransactionsByDateRange = mock(async (userEmail: string, startDate: Date) => {
  if (startDate.getUTCMonth() === 3) {
    return [
      {
        amount: 1800,
        category: "Salaire",
        currency: "EUR",
        date: "2026-04-02T12:00:00Z",
        id: "tx_income",
        label: "Salaire avril",
        type: "income",
        userEmail,
        userId: "user_1",
        userName: "Alice",
      },
      {
        amount: 120,
        category: "Alimentation",
        currency: "EUR",
        date: "2026-04-03T12:00:00Z",
        id: "tx_food",
        label: "Courses semaine",
        type: "expense",
        userEmail,
        userId: "user_1",
        userName: "Alice",
      },
      {
        amount: 60,
        category: "Loisirs",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        id: "tx_fun",
        label: "Concert",
        type: "expense",
        userEmail,
        userId: "user_1",
        userName: "Alice",
      },
    ];
  }

  return [
    {
      amount: 1750,
      category: "Salaire",
      currency: "EUR",
      date: "2026-03-02T12:00:00Z",
      id: "tx_income_prev",
      label: "Salaire mars",
      type: "income",
      userEmail,
      userId: "user_1",
      userName: "Alice",
    },
    {
      amount: 80,
      category: "Alimentation",
      currency: "EUR",
      date: "2026-03-05T12:00:00Z",
      id: "tx_food_prev",
      label: "Courses mars",
      type: "expense",
      userEmail,
      userId: "user_1",
      userName: "Alice",
    },
    {
      amount: 95,
      category: "Transport",
      currency: "EUR",
      date: "2026-03-08T12:00:00Z",
      id: "tx_transport_prev",
      label: "Navigo",
      type: "expense",
      userEmail,
      userId: "user_1",
      userName: "Alice",
    },
  ];
});

const updateTransaction = mock(async (input: { transactionId: string; userEmail: string }) => ({
  amount: 99.5,
  category: "Freelance",
  currency: "EUR",
  date: "2026-04-04T12:00:00Z",
  id: input.transactionId,
  label: "Mission",
  type: "income",
  userEmail: input.userEmail,
  userId: "user_1",
  userName: "Alice",
}));

mock.module("../../../../packages/database/index.ts", () => ({
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  listTransactionsByDateRange,
  updateTransaction,
}));

const { budgetRoute } = await import("./budget");

function createApp() {
  return new Elysia().use(budgetRoute);
}

describe("budgetRoute", () => {
  beforeEach(() => {
    createTransaction.mockClear();
    deleteTransaction.mockClear();
    getTransactionById.mockClear();
    listTransactions.mockClear();
    listTransactionsByDateRange.mockClear();
    updateTransaction.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  test("GET /transactions/:id returns a single transaction for the user", async () => {
    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/transactions/tx_1?userEmail=alice%40example.com"),
    );

    expect(response.status).toBe(200);
    expect(getTransactionById).toHaveBeenCalledWith("tx_1", "alice@example.com");
    expect(await response.json()).toEqual({
      amount: 88,
      category: "Salaire",
      currency: "EUR",
      date: "2026-04-05T12:00:00Z",
      id: "tx_1",
      label: "Prime",
      type: "income",
      userEmail: "alice@example.com",
      userId: "user_1",
      userName: "Alice",
    });
  });

  test("GET /insights/summary returns monthly assistant data", async () => {
    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/insights/summary?userEmail=alice%40example.com"),
    );
    const payload = await response.json() as {
      categories: Array<{ category: string }>;
      comparison: {
        expenseDelta: { direction: string; value: number };
        incomeDelta: { direction: string; value: number };
        previousMonth: string;
        topImprovementCategory: string | null;
        topRisingCategory: string | null;
      };
      forecast: { status: string };
      insights: Array<{ id: string }>;
      totals: { balance: number; expenses: number; income: number };
    };

    expect(response.status).toBe(200);
    expect(listTransactionsByDateRange).toHaveBeenCalledTimes(2);
    expect(payload.totals).toEqual({
      balance: 1620,
      expenses: 180,
      income: 1800,
    });
    expect(payload.comparison).toEqual({
      expenseDelta: {
        direction: "up",
        value: 5,
      },
      incomeDelta: {
        direction: "up",
        value: 50,
      },
      previousMonth: "2026-03",
      topImprovementCategory: "Transport",
      topRisingCategory: "Loisirs",
    });
    expect(["stable", "watch"]).toContain(payload.forecast.status);
    expect(payload.categories[0]?.category).toBe("Alimentation");
    expect(payload.insights.length).toBeGreaterThan(0);
  });

  test("PATCH /transactions/:id forwards the body and route id to updateTransaction", async () => {
    const app = createApp();
    const response = await app.handle(new Request("http://localhost/transactions/tx_2", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 99.5,
        category: "Freelance",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        label: "Mission",
        type: "income",
        userEmail: "alice@example.com",
      }),
    }));

    expect(response.status).toBe(200);
    expect(updateTransaction).toHaveBeenCalledWith({
      amount: 99.5,
      category: "Freelance",
      currency: "EUR",
      date: "2026-04-04T12:00:00Z",
      label: "Mission",
      transactionId: "tx_2",
      type: "income",
      userEmail: "alice@example.com",
    });
    expect(await response.json()).toEqual({
      message: "Transaction modifiée",
      data: {
        amount: 99.5,
        category: "Freelance",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        id: "tx_2",
        label: "Mission",
        type: "income",
        userEmail: "alice@example.com",
        userId: "user_1",
        userName: "Alice",
      },
    });
  });

  test("DELETE /transactions/:id forwards the id and userEmail", async () => {
    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/transactions/tx_3?userEmail=alice%40example.com", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    expect(deleteTransaction).toHaveBeenCalledWith("tx_3", "alice@example.com");
    expect(await response.json()).toEqual({
      message: "Transaction supprimée",
      data: {
        amount: 42,
        category: "Alimentation",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        id: "tx_3",
        label: "Courses",
        type: "expense",
        userEmail: "alice@example.com",
        userId: "user_1",
        userName: "Alice",
      },
    });
  });

  test("GET /transactions rejects requests without userEmail before reaching the handler", async () => {
    const app = createApp();
    const response = await app.handle(new Request("http://localhost/transactions"));

    expect(response.status).toBe(422);
    expect(listTransactions).not.toHaveBeenCalled();
  });

  test("GET /insights/summary handles an empty month gracefully", async () => {
    listTransactionsByDateRange.mockImplementationOnce(async () => []);

    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/insights/summary?userEmail=alice%40example.com"),
    );
    const payload = await response.json() as {
      categories: unknown[];
      comparison: {
        expenseDelta: { direction: string; value: number };
        incomeDelta: { direction: string; value: number };
        previousMonth: string;
        topImprovementCategory: string | null;
        topRisingCategory: string | null;
      };
      forecast: { status: string };
      insights: Array<{ id: string }>;
      totals: { balance: number; expenses: number; income: number };
    };

    expect(response.status).toBe(200);
    expect(payload.totals).toEqual({
      balance: 0,
      expenses: 0,
      income: 0,
    });
    expect(payload.categories).toEqual([]);
    expect(payload.comparison.previousMonth).toBe("2026-03");
    expect(payload.forecast.status).toBe("stable");
    expect(payload.insights[0]?.id).toBe("empty-month");
  });
});
