import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/auth";
import { DELETE, GET, PATCH } from "./route";

const sessionUser = {
  email: "alice@example.com",
  id: "user_123",
  name: "Alice",
};

async function createAuthenticatedRequest(url: string, init?: RequestInit) {
  const token = await createSessionToken(sessionUser);
  const headers = new Headers(init?.headers);
  headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);

  return new NextRequest(url, {
    method: init?.method,
    body: init?.body,
    cache: init?.cache,
    credentials: init?.credentials,
    integrity: init?.integrity,
    keepalive: init?.keepalive,
    mode: init?.mode,
    redirect: init?.redirect,
    referrer: init?.referrer,
    referrerPolicy: init?.referrerPolicy,
    headers,
  });
}

describe("transactions/[id] route", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.API_URL = "https://api-budgetapp.ricardomboukou.online";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  test("GET forwards the user email and returns the backend payload", async () => {
    globalThis.fetch = mock(async (input) => {
      expect(input).toBeInstanceOf(URL);
      expect((input as URL).toString()).toBe(
        "https://api-budgetapp.ricardomboukou.online/transactions/tx_1?userEmail=alice%40example.com",
      );

      return new Response(
        JSON.stringify({
          amount: 42,
          category: "Alimentation",
          currency: "EUR",
          date: "2026-04-04T12:00:00Z",
          id: "tx_1",
          label: "Courses",
          type: "expense",
          userEmail: sessionUser.email,
          userId: sessionUser.id,
          userName: sessionUser.name,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as unknown as typeof fetch;

    const request = await createAuthenticatedRequest("http://localhost:3000/api/transactions/tx_1");
    const response = await GET(request, { params: Promise.resolve({ id: "tx_1" }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      amount: 42,
      category: "Alimentation",
      currency: "EUR",
      date: "2026-04-04T12:00:00Z",
      id: "tx_1",
      label: "Courses",
      type: "expense",
      userEmail: sessionUser.email,
      userId: sessionUser.id,
      userName: sessionUser.name,
    });
  });

  test("PATCH injects the session email into the backend request body", async () => {
    globalThis.fetch = mock(async (input, init) => {
      expect(input).toBe("https://api-budgetapp.ricardomboukou.online/transactions/tx_2");
      expect(init?.method).toBe("PATCH");
      expect(init?.headers).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(String(init?.body))).toEqual({
        amount: 99.5,
        category: "Salaire",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        label: "Prime",
        type: "income",
        userEmail: sessionUser.email,
      });

      return new Response(
        JSON.stringify({
          message: "Transaction modifiée",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as unknown as typeof fetch;

    const request = await createAuthenticatedRequest("http://localhost:3000/api/transactions/tx_2", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 99.5,
        category: "Salaire",
        currency: "EUR",
        date: "2026-04-04T12:00:00Z",
        label: "Prime",
        type: "income",
      }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "tx_2" }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Transaction modifiée",
    });
  });

  test("DELETE forwards the user email as a query param", async () => {
    globalThis.fetch = mock(async (input, init) => {
      expect(input).toBeInstanceOf(URL);
      expect((input as URL).toString()).toBe(
        "https://api-budgetapp.ricardomboukou.online/transactions/tx_3?userEmail=alice%40example.com",
      );
      expect(init?.method).toBe("DELETE");

      return new Response(
        JSON.stringify({
          message: "Transaction supprimée",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as unknown as typeof fetch;

    const request = await createAuthenticatedRequest("http://localhost:3000/api/transactions/tx_3", {
      method: "DELETE",
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: "tx_3" }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Transaction supprimée",
    });
  });

  test("returns 401 when the session cookie is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/transactions/tx_4");
    const response = await GET(request, { params: Promise.resolve({ id: "tx_4" }) });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Session invalide. Connectez-vous à nouveau.",
    });
  });
});
