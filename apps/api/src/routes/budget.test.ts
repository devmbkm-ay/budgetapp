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
});
