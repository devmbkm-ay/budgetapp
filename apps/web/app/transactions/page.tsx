"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface TransactionRecord {
  amount: number;
  category: string | null;
  currency: string;
  date: string;
  id: string;
  label: string;
  type: "expense" | "income";
  userEmail: string;
  userId: string;
  userName: string | null;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));

const categoryEmoji = (category: string | null) => {
  const normalized = (category ?? "").toLowerCase();

  if (normalized.includes("alim")) return "🍽️";
  if (normalized.includes("transport")) return "🚇";
  if (normalized.includes("shop")) return "🛍️";
  if (normalized.includes("loisir")) return "🎞️";
  if (normalized.includes("salaire")) return "💼";
  if (normalized.includes("freelance")) return "✨";

  return "•";
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/transactions", {
          cache: "no-store",
        });
        const payload = (await response.json()) as
          | TransactionRecord[]
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Impossible de charger les transactions.",
          );
        }

        if (mounted) {
          setTransactions(Array.isArray(payload) ? payload : []);
        }
      } catch (caughtError) {
        if (mounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger les transactions.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTransactions();

    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    return transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === "income") {
          accumulator.income += transaction.amount;
        } else {
          accumulator.expense += transaction.amount;
        }

        return accumulator;
      },
      { expense: 0, income: 0 },
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;

  return (
    <main style={styles.page}>
      <div style={styles.ambientBlue} />
      <div style={styles.ambientCoral} />

      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Historique vivant</p>
            <h1 style={styles.title}>Transactions</h1>
            <p style={styles.subtitle}>
              Chaque operation enregistree depuis votre nouveau flux d’ajout.
            </p>
          </div>
          <Link href="/transactions/add" style={styles.primaryAction}>
            Ajouter une transaction
          </Link>
        </header>

        <section style={styles.heroGrid}>
          <article style={styles.balanceCard}>
            <p style={styles.cardLabel}>Solde visible</p>
            <h2
              style={{
                ...styles.balanceValue,
                color: balance >= 0 ? "#7ff0b6" : "#ff8e87",
              }}
            >
              {formatCurrency(Math.abs(balance), "EUR")}
            </h2>
            <p style={styles.balanceHint}>
              {balance >= 0 ? "Vous restez au-dessus de votre base." : "Les depenses depassent les revenus."}
            </p>
          </article>
          <article style={styles.metricCard}>
            <p style={styles.cardLabel}>Revenus</p>
            <strong style={{ ...styles.metricValue, color: "#7ff0b6" }}>
              {formatCurrency(totals.income, "EUR")}
            </strong>
          </article>
          <article style={styles.metricCard}>
            <p style={styles.cardLabel}>Depenses</p>
            <strong style={{ ...styles.metricValue, color: "#ff8e87" }}>
              {formatCurrency(totals.expense, "EUR")}
            </strong>
          </article>
        </section>

        <section style={styles.listShell}>
          <div style={styles.listHeader}>
            <div>
              <p style={styles.cardLabel}>Timeline</p>
              <h2 style={styles.listTitle}>Mouvements recents</h2>
            </div>
            <span style={styles.countPill}>{transactions.length} lignes</span>
          </div>

          {isLoading ? (
            <div style={styles.statePanel}>Chargement des transactions...</div>
          ) : null}

          {!isLoading && error ? (
            <div style={styles.errorPanel}>
              <strong>Chargement indisponible</strong>
              <span>{error}</span>
            </div>
          ) : null}

          {!isLoading && !error && transactions.length === 0 ? (
            <div style={styles.statePanel}>
              <p style={styles.emptyTitle}>Aucune transaction pour le moment.</p>
              <p style={styles.emptyBody}>
                Ajoutez votre premiere operation depuis l’ecran d’ajout pour voir la timeline se remplir.
              </p>
              <Link href="/transactions/add" style={styles.secondaryAction}>
                Ouvrir le formulaire
              </Link>
            </div>
          ) : null}

          {!isLoading && !error && transactions.length > 0 ? (
            <div style={styles.timeline}>
              {transactions.map((transaction) => {
                const accent = transaction.type === "income" ? "#7ff0b6" : "#ff8e87";
                const amountPrefix = transaction.type === "income" ? "+" : "-";

                return (
                  <article key={transaction.id} style={styles.transactionCard}>
                    <div style={styles.transactionLeft}>
                      <div style={{ ...styles.iconBubble, color: accent }}>
                        {categoryEmoji(transaction.category)}
                      </div>
                      <div>
                        <h3 style={styles.transactionLabel}>{transaction.label}</h3>
                        <p style={styles.transactionMeta}>
                          {transaction.category ?? "Categorie libre"} · {formatDate(transaction.date)}
                        </p>
                        <p style={styles.transactionMetaMuted}>
                          {transaction.userName ?? transaction.userEmail}
                        </p>
                      </div>
                    </div>
                    <div style={styles.transactionRight}>
                      <strong style={{ ...styles.transactionAmount, color: accent }}>
                        {amountPrefix}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </strong>
                      <span style={styles.transactionDay}>{formatShortDate(transaction.date)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #081120 0%, #0e1831 42%, #1d1023 100%)",
    color: "#f6fbff",
  },
  ambientBlue: {
    position: "fixed",
    top: "-4rem",
    left: "-4rem",
    width: "18rem",
    height: "18rem",
    borderRadius: "999px",
    background: "rgba(10, 132, 255, 0.28)",
    filter: "blur(50px)",
  },
  ambientCoral: {
    position: "fixed",
    right: "-3rem",
    top: "12rem",
    width: "18rem",
    height: "18rem",
    borderRadius: "999px",
    background: "rgba(255, 69, 58, 0.22)",
    filter: "blur(56px)",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "36px 20px 72px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.72)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontSize: "0.78rem",
  },
  title: {
    margin: "8px 0 10px",
    fontSize: "clamp(2.4rem, 6vw, 4.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: 0,
    maxWidth: "34rem",
    color: "rgba(227, 236, 255, 0.74)",
    lineHeight: 1.6,
  },
  primaryAction: {
    padding: "14px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(255,69,58,0.95), rgba(10,132,255,0.78))",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 18px 42px rgba(10, 132, 255, 0.16)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr",
    gap: "16px",
    marginTop: "28px",
  },
  balanceCard: {
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 22px 48px rgba(4, 10, 22, 0.24)",
  },
  metricCard: {
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  cardLabel: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.68)",
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  balanceValue: {
    margin: "14px 0 10px",
    fontSize: "clamp(2rem, 5vw, 3.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  balanceHint: {
    margin: 0,
    color: "rgba(227, 236, 255, 0.76)",
  },
  metricValue: {
    display: "block",
    marginTop: "16px",
    fontSize: "1.5rem",
    letterSpacing: "-0.04em",
  },
  listShell: {
    marginTop: "22px",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  listTitle: {
    margin: "8px 0 0",
    fontSize: "1.6rem",
    letterSpacing: "-0.04em",
  },
  countPill: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(227, 236, 255, 0.82)",
    fontSize: "0.9rem",
  },
  statePanel: {
    borderRadius: "22px",
    padding: "28px",
    background: "rgba(8, 14, 29, 0.36)",
    color: "rgba(227, 236, 255, 0.82)",
  },
  errorPanel: {
    display: "grid",
    gap: "6px",
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(119, 24, 31, 0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffe8ea",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
  },
  emptyBody: {
    margin: "8px 0 18px",
    lineHeight: 1.6,
  },
  secondaryAction: {
    display: "inline-flex",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f6fbff",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 700,
  },
  timeline: {
    display: "grid",
    gap: "12px",
  },
  transactionCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    padding: "16px 18px",
    borderRadius: "22px",
    background: "rgba(8, 14, 29, 0.36)",
    border: "1px solid rgba(255,255,255,0.1)",
    flexWrap: "wrap",
  },
  transactionLeft: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    minWidth: 0,
  },
  iconBubble: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  transactionLabel: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
  },
  transactionMeta: {
    margin: "4px 0 0",
    color: "rgba(227, 236, 255, 0.7)",
    lineHeight: 1.5,
  },
  transactionMetaMuted: {
    margin: "4px 0 0",
    color: "rgba(208, 224, 255, 0.46)",
    fontSize: "0.9rem",
  },
  transactionRight: {
    display: "grid",
    gap: "6px",
    justifyItems: "end",
  },
  transactionAmount: {
    fontSize: "1.05rem",
    letterSpacing: "-0.03em",
  },
  transactionDay: {
    color: "rgba(208, 224, 255, 0.56)",
    fontSize: "0.88rem",
  },
};
