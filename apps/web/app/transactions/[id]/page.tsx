"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  categoryEmoji,
  DEFAULT_TRANSACTION_CATEGORY_LABEL,
  formatCurrency,
  formatLongDate,
  formatShortDate,
  type TransactionRecord,
} from "../../../lib/transactions";

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      setError("Transaction introuvable.");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const loadTransaction = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/transactions/${transactionId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as
          | TransactionRecord
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Impossible de charger la transaction.",
          );
        }

        if (mounted) {
          setTransaction("id" in payload ? payload : null);
        }
      } catch (caughtError) {
        if (mounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger la transaction.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTransaction();

    return () => {
      mounted = false;
    };
  }, [transactionId]);

  const accent = transaction?.type === "income" ? "#7ff0b6" : "#ff8e87";
  const amountPrefix = transaction?.type === "income" ? "+" : "-";
  const typeLabel = transaction?.type === "income" ? "Revenu" : "Depense";

  const handleDelete = async () => {
    if (!transaction || isDeleting) {
      return;
    }

    const shouldDelete = window.confirm(
      "Supprimer cette transaction de votre historique ?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/transactions/${encodeURIComponent(transaction.id)}`, {
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

      router.push("/transactions");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer la transaction.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main style={styles.page}>
        <div style={styles.ambientBlue} />
        <div style={styles.ambientCoral} />
        <section style={styles.statusShell}>
          <div style={styles.statusCard}>Chargement de la transaction...</div>
        </section>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main style={styles.page}>
        <div style={styles.ambientBlue} />
        <div style={styles.ambientCoral} />
        <section style={styles.statusShell}>
          <div style={{ ...styles.statusCard, ...styles.errorCard }}>
            <strong>Transaction indisponible</strong>
            <span>{error ?? "Cette transaction est introuvable."}</span>
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              style={styles.primaryButton}
            >
              Retour aux transactions
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.ambientBlue} />
      <div style={styles.ambientCoral} />

      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Fiche transaction</p>
            <h1 style={styles.title}>{transaction.label}</h1>
            <p style={styles.subtitle}>
              Une vue detaillee pour verifier les infos et repartir vers l’edition si besoin.
            </p>
          </div>
          <div style={styles.headerActions}>
            <Link href="/transactions" style={styles.secondaryButton}>
              Retour
            </Link>
            <Link href={`/transactions/${transaction.id}/edit`} style={styles.primaryButtonLink}>
              Modifier
            </Link>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              style={{
                ...styles.deleteButton,
                cursor: isDeleting ? "progress" : "pointer",
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </header>

        {error ? (
          <div style={styles.errorBanner}>
            <strong>Action indisponible</strong>
            <span>{error}</span>
          </div>
        ) : null}

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.badge}>
              <div style={{ ...styles.iconBubble, color: accent }}>
                {categoryEmoji(transaction.category)}
              </div>
              <div>
                <p style={styles.badgeLabel}>{transaction.category ?? DEFAULT_TRANSACTION_CATEGORY_LABEL}</p>
                <p style={styles.badgeMeta}>{typeLabel}</p>
              </div>
            </div>
            <div style={styles.heroAmountWrap}>
              <span style={styles.heroAmountPrefix}>{amountPrefix}</span>
              <strong style={{ ...styles.heroAmount, color: accent }}>
                {formatCurrency(transaction.amount, transaction.currency)}
              </strong>
            </div>
          </div>

          <div style={styles.heroMetaGrid}>
            <article style={styles.metaCard}>
              <p style={styles.metaLabel}>Date complete</p>
              <strong style={styles.metaValue}>{formatLongDate(transaction.date)}</strong>
            </article>
            <article style={styles.metaCard}>
              <p style={styles.metaLabel}>Compte</p>
              <strong style={styles.metaValue}>{transaction.userName ?? transaction.userEmail}</strong>
            </article>
            <article style={styles.metaCard}>
              <p style={styles.metaLabel}>Reference</p>
              <strong style={styles.metaValueMono}>{transaction.id}</strong>
            </article>
          </div>
        </section>

        <section style={styles.detailGrid}>
          <article style={styles.detailPanel}>
            <p style={styles.sectionEyebrow}>Resume</p>
            <h2 style={styles.sectionTitle}>Lecture rapide</h2>
            <div style={styles.factList}>
              <div style={styles.factRow}>
                <span style={styles.factKey}>Montant</span>
                <span style={{ ...styles.factValue, color: accent }}>
                  {amountPrefix}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
              <div style={styles.factRow}>
                <span style={styles.factKey}>Type</span>
                <span style={styles.factValue}>{typeLabel}</span>
              </div>
              <div style={styles.factRow}>
                <span style={styles.factKey}>Categorie</span>
                <span style={styles.factValue}>{transaction.category ?? DEFAULT_TRANSACTION_CATEGORY_LABEL}</span>
              </div>
              <div style={styles.factRow}>
                <span style={styles.factKey}>Date</span>
                <span style={styles.factValue}>{formatShortDate(transaction.date)}</span>
              </div>
              <div style={styles.factRow}>
                <span style={styles.factKey}>Devise</span>
                <span style={styles.factValue}>{transaction.currency}</span>
              </div>
            </div>
          </article>

          <article style={styles.detailPanel}>
            <p style={styles.sectionEyebrow}>Contexte</p>
            <h2 style={styles.sectionTitle}>Origine</h2>
            <p style={styles.narrative}>
              Cette transaction appartient a{" "}
              <strong>{transaction.userName ?? transaction.userEmail}</strong> et a ete enregistree
              le <strong>{formatLongDate(transaction.date)}</strong>.
            </p>
            <p style={styles.narrative}>
              Utilisez cette page comme point de verification avant une modification ou un retour a
              la timeline.
            </p>
            <div style={styles.inlineActions}>
              <Link href={`/transactions/${transaction.id}/edit`} style={styles.inlinePrimaryAction}>
                Ouvrir l’edition
              </Link>
              <Link href="/transactions" style={styles.inlineSecondaryAction}>
                Revenir a la liste
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

const glassPanel: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
};

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
    padding: "36px 20px 96px",
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
    fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: 0,
    maxWidth: "40rem",
    color: "rgba(227, 236, 255, 0.74)",
    lineHeight: 1.6,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButtonLink: {
    padding: "14px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(255,69,58,0.95), rgba(10,132,255,0.78))",
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 18px 42px rgba(10, 132, 255, 0.16)",
  },
  secondaryButton: {
    padding: "14px 18px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f6fbff",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 700,
    textDecoration: "none",
  },
  deleteButton: {
    padding: "14px 18px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 142, 135, 0.32)",
    background: "rgba(255, 142, 135, 0.08)",
    color: "#ffb2ad",
    fontWeight: 700,
  },
  heroCard: {
    ...glassPanel,
    marginTop: "28px",
    padding: "28px",
    borderRadius: "32px",
    boxShadow: "0 22px 48px rgba(4, 10, 22, 0.24)",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  badgeLabel: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
  },
  badgeMeta: {
    margin: "4px 0 0",
    color: "rgba(227, 236, 255, 0.68)",
  },
  iconBubble: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    fontSize: "1.6rem",
    flexShrink: 0,
  },
  heroAmountWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  heroAmountPrefix: {
    fontSize: "2rem",
    color: "rgba(227, 236, 255, 0.7)",
  },
  heroAmount: {
    fontSize: "clamp(2rem, 7vw, 3.8rem)",
    letterSpacing: "-0.06em",
    lineHeight: 0.95,
  },
  heroMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "22px",
  },
  metaCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(8, 14, 29, 0.36)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  metaLabel: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.62)",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  metaValue: {
    display: "block",
    marginTop: "12px",
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  metaValueMono: {
    display: "block",
    marginTop: "12px",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },
  detailPanel: {
    ...glassPanel,
    borderRadius: "28px",
    padding: "24px",
  },
  sectionEyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.68)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "0.76rem",
  },
  sectionTitle: {
    margin: "8px 0 18px",
    fontSize: "1.55rem",
    letterSpacing: "-0.04em",
  },
  factList: {
    display: "grid",
    gap: "12px",
  },
  factRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  factKey: {
    color: "rgba(227, 236, 255, 0.68)",
  },
  factValue: {
    textAlign: "right",
    fontWeight: 700,
  },
  narrative: {
    margin: "0 0 14px",
    color: "rgba(227, 236, 255, 0.8)",
    lineHeight: 1.7,
  },
  errorBanner: {
    display: "grid",
    gap: "4px",
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(119, 24, 31, 0.42)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    color: "#ffe7e8",
  },
  inlineActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },
  inlinePrimaryAction: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(100, 210, 255, 0.12)",
    border: "1px solid rgba(100, 210, 255, 0.28)",
    color: "#bde8ff",
    fontWeight: 700,
    textDecoration: "none",
  },
  inlineSecondaryAction: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f6fbff",
    fontWeight: 700,
    textDecoration: "none",
  },
  statusShell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  statusCard: {
    width: "min(460px, 100%)",
    borderRadius: "28px",
    padding: "24px",
    background: "rgba(8, 14, 29, 0.52)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    color: "#f7fbff",
    display: "grid",
    gap: "12px",
  },
  errorCard: {
    color: "#ffe7e8",
    background: "rgba(119, 24, 31, 0.42)",
  },
  primaryButton: {
    width: "fit-content",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, rgba(255, 69, 58, 0.96), rgba(10, 132, 255, 0.82))",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
