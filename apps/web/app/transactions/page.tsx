"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AssistantFeed } from "../_components/assistant-feed";
import { CategoryPressureCard } from "../_components/category-pressure-card";
import { ConfirmDialog } from "../_components/confirm-dialog";
import { ForecastCard } from "../_components/forecast-card";
import { MoneyPulseCard } from "../_components/money-pulse-card";
import { forecastStatusCopy, forecastStatusLabel, forecastStatusTheme, type InsightsSummary } from "../../lib/insights";
import {
  categoryEmoji,
  DEFAULT_TRANSACTION_CATEGORY_LABEL,
  formatCurrency,
  formatDate,
  formatShortDate,
  type TransactionRecord,
} from "../../lib/transactions";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;

    const loadInsights = async () => {
      try {
        setIsInsightsLoading(true);
        setInsightsError(null);

        const response = await fetch("/api/insights/summary", {
          cache: "no-store",
        });
        const payload = (await response.json()) as InsightsSummary | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Impossible de charger le Money Pulse.",
          );
        }

        if (mounted) {
          setInsights("forecast" in payload ? payload : null);
        }
      } catch (caughtError) {
        if (mounted) {
          setInsightsError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger le Money Pulse.",
          );
        }
      } finally {
        if (mounted) {
          setIsInsightsLoading(false);
        }
      }
    };

    void loadInsights();

    return () => {
      mounted = false;
    };
  }, []);

  const timelineTotals = useMemo(() => {
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

  const balance = insights?.totals.balance ?? (timelineTotals.income - timelineTotals.expense);
  const incomeTotal = insights?.totals.income ?? timelineTotals.income;
  const expenseTotal = insights?.totals.expenses ?? timelineTotals.expense;
  const insightsCopy = insights ? forecastStatusCopy(insights.forecast.status) : null;
  const insightsTheme = insights ? forecastStatusTheme(insights.forecast.status) : null;

  const handleDelete = async (transactionId: string) => {
    if (deletingId) {
      return;
    }

    try {
      setDeletingId(transactionId);
      setError(null);

      const response = await fetch(`/api/transactions/${encodeURIComponent(transactionId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as
        | { error?: string }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Impossible de supprimer la transaction.",
        );
      }

      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== transactionId),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer la transaction.",
      );
    } finally {
      setDeletingId(null);
      setPendingDeleteId((currentId) => (currentId === transactionId ? null : currentId));
    }
  };

  return (
    <main style={styles.page}>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Supprimer cette transaction ?"
        description="Cette action retirera la transaction de votre historique visible. Vous pourrez continuer a gerer le reste de votre timeline normalement."
        confirmLabel="Supprimer"
        isBusy={pendingDeleteId !== null && deletingId === pendingDeleteId}
        onCancel={() => {
          if (!deletingId) {
            setPendingDeleteId(null);
          }
        }}
        onConfirm={() => {
          if (pendingDeleteId) {
            void handleDelete(pendingDeleteId);
          }
        }}
      />
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
              {balance >= 0 ? "Votre mois reste en territoire positif." : "Votre rythme actuel demande une correction."}
            </p>
          </article>
          <article style={styles.metricCard}>
            <p style={styles.cardLabel}>Revenus</p>
            <strong style={{ ...styles.metricValue, color: "#7ff0b6" }}>
              {formatCurrency(incomeTotal, "EUR")}
            </strong>
          </article>
          <article style={styles.metricCard}>
            <p style={styles.cardLabel}>Depenses</p>
            <strong style={{ ...styles.metricValue, color: "#ff8e87" }}>
              {formatCurrency(expenseTotal, "EUR")}
            </strong>
          </article>
        </section>

        <section style={styles.insightsShell}>
          <div style={styles.listHeader}>
            <div>
              <p style={styles.cardLabel}>Assistant</p>
              <h2 style={styles.listTitle}>Money Pulse</h2>
              {insightsCopy ? (
                <p style={styles.insightsSubtitle}>{insightsCopy.sectionSubtitle}</p>
              ) : null}
            </div>
            <div style={styles.insightsBadges}>
              {insights?.period ? (
                <span style={styles.countPill}>{insights.period.month}</span>
              ) : null}
              {insights ? (
                <span
                  style={{
                    ...styles.statusPill,
                    color: insightsTheme?.accent,
                    borderColor: insightsTheme?.borderColor,
                    background: insightsTheme?.accentSoft,
                  }}
                >
                  {forecastStatusLabel(insights.forecast.status)}
                </span>
              ) : null}
            </div>
          </div>

          {isInsightsLoading ? (
            <div style={styles.statePanel}>Chargement du Money Pulse...</div>
          ) : null}

          {!isInsightsLoading && insightsError ? (
            <div style={styles.errorPanel}>
              <strong>Assistant indisponible</strong>
              <span>{insightsError}</span>
            </div>
          ) : null}

          {!isInsightsLoading && !insightsError && insights ? (
            <>
              <div style={styles.insightsGrid}>
                <MoneyPulseCard totals={insights.totals} status={insights.forecast.status} />
                <ForecastCard forecast={insights.forecast} period={insights.period} />
                <CategoryPressureCard categories={insights.categories} status={insights.forecast.status} />
              </div>
              <AssistantFeed insights={insights.insights} status={insights.forecast.status} />
            </>
          ) : null}
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
                  <article
                    key={transaction.id}
                    style={{
                      ...styles.transactionCard,
                      ...(activeCardId === transaction.id ? styles.transactionCardActive : null),
                    }}
                    onClick={() => router.push(`/transactions/${transaction.id}`)}
                    onMouseEnter={() => setActiveCardId(transaction.id)}
                    onMouseLeave={() => setActiveCardId((currentId) => (
                      currentId === transaction.id ? null : currentId
                    ))}
                    onFocus={() => setActiveCardId(transaction.id)}
                    onBlur={() => setActiveCardId((currentId) => (
                      currentId === transaction.id ? null : currentId
                    ))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/transactions/${transaction.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <div style={styles.transactionLeft}>
                      <div style={{ ...styles.iconBubble, color: accent }}>
                        {categoryEmoji(transaction.category)}
                      </div>
                      <div>
                        <h3 style={styles.transactionLabel}>{transaction.label}</h3>
                        <p style={styles.transactionMeta}>
                          {transaction.category ?? DEFAULT_TRANSACTION_CATEGORY_LABEL} · {formatDate(transaction.date)}
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
                      <span style={styles.transactionDay}>{formatShortDate(transaction.date, { includeYear: false })}</span>
                      <div style={styles.transactionActions}>
                        <Link
                          href={`/transactions/${transaction.id}/edit`}
                          style={styles.editButton}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingDeleteId(transaction.id);
                          }}
                          disabled={deletingId === transaction.id}
                          style={{
                            ...styles.deleteButton,
                            cursor: deletingId === transaction.id ? "progress" : "pointer",
                            opacity: deletingId === transaction.id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === transaction.id ? "Suppression..." : "Supprimer"}
                        </button>
                      </div>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  insightsShell: {
    marginTop: "22px",
  },
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  insightsBadges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  listTitle: {
    margin: "8px 0 0",
    fontSize: "1.6rem",
    letterSpacing: "-0.04em",
  },
  insightsSubtitle: {
    margin: "10px 0 0",
    maxWidth: "38rem",
    color: "rgba(227, 236, 255, 0.72)",
    lineHeight: 1.6,
  },
  countPill: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(227, 236, 255, 0.82)",
    fontSize: "0.9rem",
  },
  statusPill: {
    padding: "10px 14px",
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: "0.9rem",
    fontWeight: 700,
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
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.1)",
    flexWrap: "wrap",
    cursor: "pointer",
    transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
  },
  transactionCardActive: {
    transform: "translateY(-2px)",
    borderColor: "rgba(100, 210, 255, 0.34)",
    boxShadow: "0 16px 34px rgba(10, 132, 255, 0.16)",
  },
  transactionLeft: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    minWidth: 0,
    flex: "1 1 260px",
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
    flex: "0 1 220px",
    width: "100%",
  },
  transactionAmount: {
    fontSize: "1.05rem",
    letterSpacing: "-0.03em",
  },
  transactionDay: {
    color: "rgba(208, 224, 255, 0.56)",
    fontSize: "0.88rem",
  },
  transactionActions: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  editButton: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(100, 210, 255, 0.28)",
    background: "rgba(100, 210, 255, 0.08)",
    color: "#bde8ff",
    fontSize: "0.76rem",
    fontWeight: 700,
    textDecoration: "none",
  },
  deleteButton: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 142, 135, 0.32)",
    background: "rgba(255, 142, 135, 0.08)",
    color: "#ffb2ad",
    fontSize: "0.76rem",
    fontWeight: 700,
  },
};
