"use client";

import React, { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

type TransactionType = "expense" | "income";

interface Category {
  color: string;
  icon: string;
  id: string;
  name: string;
  type: TransactionType;
}

interface ModePalette {
  accent: string;
  accentGlow: string;
  accentSoft: string;
  actionShadow: string;
  background: string;
  orbOne: string;
  orbThree: string;
  orbTwo: string;
  secondaryGlow: string;
  textShadow: string;
  toggleActive: string;
}

interface TransactionRecord {
  amount: number;
  category: string | null;
  currency: string;
  date: string;
  id: string;
  label: string;
  type: TransactionType;
}

interface SavedTransactionSnapshot {
  amount: number;
  date: string;
  label: string;
  type: TransactionType;
}

const CATEGORIES: Category[] = [
  { id: "food", name: "Alimentation", icon: "🍽️", color: "#FF453A", type: "expense" },
  { id: "transport", name: "Transport", icon: "🚇", color: "#0A84FF", type: "expense" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#BF5AF2", type: "expense" },
  { id: "entertainment", name: "Loisirs", icon: "🎞️", color: "#5E5CE6", type: "expense" },
  { id: "salary", name: "Salaire", icon: "💼", color: "#32D74B", type: "income" },
  { id: "freelance", name: "Freelance", icon: "✨", color: "#64D2FF", type: "income" },
];

const PALETTES: Record<TransactionType, ModePalette> = {
  expense: {
    accent: "#FF453A",
    accentSoft: "rgba(255, 69, 58, 0.18)",
    accentGlow: "rgba(255, 69, 58, 0.34)",
    secondaryGlow: "rgba(10, 132, 255, 0.24)",
    toggleActive: "linear-gradient(135deg, rgba(255, 69, 58, 0.95), rgba(255, 110, 98, 0.82))",
    textShadow: "0 8px 28px rgba(255, 69, 58, 0.22), 0 4px 18px rgba(10, 132, 255, 0.16)",
    actionShadow: "0 20px 36px rgba(255, 69, 58, 0.28), 0 10px 30px rgba(10, 132, 255, 0.18)",
    background: "radial-gradient(circle at 18% 16%, rgba(10, 132, 255, 0.34), transparent 26%), radial-gradient(circle at 84% 18%, rgba(255, 69, 58, 0.28), transparent 24%), linear-gradient(145deg, #08101e 0%, #101a34 44%, #2a1124 100%)",
    orbOne: "rgba(10, 132, 255, 0.42)",
    orbTwo: "rgba(255, 69, 58, 0.34)",
    orbThree: "rgba(191, 90, 242, 0.22)",
  },
  income: {
    accent: "#32D74B",
    accentSoft: "rgba(50, 215, 75, 0.16)",
    accentGlow: "rgba(50, 215, 75, 0.28)",
    secondaryGlow: "rgba(100, 210, 255, 0.22)",
    toggleActive: "linear-gradient(135deg, rgba(50, 215, 75, 0.92), rgba(100, 210, 255, 0.78))",
    textShadow: "0 8px 28px rgba(50, 215, 75, 0.2), 0 4px 18px rgba(100, 210, 255, 0.18)",
    actionShadow: "0 20px 36px rgba(50, 215, 75, 0.24), 0 10px 30px rgba(100, 210, 255, 0.22)",
    background: "radial-gradient(circle at 14% 18%, rgba(50, 215, 75, 0.28), transparent 24%), radial-gradient(circle at 82% 14%, rgba(100, 210, 255, 0.26), transparent 24%), linear-gradient(145deg, #07141b 0%, #10212b 40%, #0e2d26 100%)",
    orbOne: "rgba(50, 215, 75, 0.34)",
    orbTwo: "rgba(100, 210, 255, 0.32)",
    orbThree: "rgba(10, 132, 255, 0.18)",
  },
};

function findCategoryId(categoryName: string | null, type: TransactionType) {
  const normalizedCategoryName = categoryName?.trim().toLowerCase();
  const category = CATEGORIES.find(
    (item) => item.type === type && item.name.trim().toLowerCase() === normalizedCategoryName,
  );

  return category?.id ?? CATEGORIES.find((item) => item.type === type)?.id ?? "";
}

function formatAmountInput(value: string) {
  const cleaned = value.replace(/[^\d]/g, "");

  if (!cleaned) {
    return "0.00";
  }

  return (parseInt(cleaned, 10) / 100).toFixed(2);
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(findCategoryId(null, "expense"));
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedTransaction, setSavedTransaction] = useState<SavedTransactionSnapshot | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setIsLoading(false);
      setLoadError("Transaction introuvable.");
      return;
    }

    let mounted = true;

    const loadTransaction = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

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
              : "Impossible de charger les transactions.",
          );
        }

        const transaction = "id" in payload ? payload : null;

        if (!transaction) {
          throw new Error("Transaction introuvable.");
        }

        if (!mounted) {
          return;
        }

        setType(transaction.type);
        setAmount(transaction.amount.toFixed(2));
        setLabel(transaction.label);
        setCategory(findCategoryId(transaction.category, transaction.type));
        setDate(transaction.date.slice(0, 10));
        setCurrency(transaction.currency || "EUR");
      } catch (error) {
        if (mounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Impossible de charger cette transaction.",
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

  useEffect(() => {
    const fallbackCategoryId = CATEGORIES.find((item) => item.type === type)?.id ?? "";
    const matchingCategory = CATEGORIES.find((item) => item.id === category && item.type === type);

    if (!matchingCategory && fallbackCategoryId) {
      setCategory(fallbackCategoryId);
    }
  }, [category, type]);

  const filteredCategories = CATEGORIES.filter((item) => item.type === type);
  const palette = PALETTES[type];
  const selectedCategory =
    filteredCategories.find((item) => item.id === category) ??
    filteredCategories[0] ?? {
      id: "",
      name: "",
      icon: "",
      color: palette.accent,
      type,
    };
  const accentColor = selectedCategory.color ?? palette.accent;
  const amountValue = parseFloat(amount || "0");
  const amountInteger = `${type === "expense" ? "-" : "+"}${Math.floor(amountValue).toString()}`;
  const amountDecimals = amountValue.toFixed(2).split(".")[1] ?? "00";
  const isSubmitDisabled = isSubmitting || amountValue <= 0 || !label.trim() || !date;
  const previewNarrative = type === "expense"
    ? `Cette depense sera mise a jour dans ${selectedCategory.name || "une categorie"}`
    : `Ce revenu sera mis a jour dans ${selectedCategory.name || "une categorie"}`;

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    setAmount(formatAmountInput(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!transactionId || isSubmitDisabled) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch(
        `/api/transactions?id=${encodeURIComponent(transactionId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountValue,
            category: selectedCategory.name || null,
            currency,
            date: `${date}T12:00:00Z`,
            label: label.trim(),
            type,
          }),
        },
      );
      const payload = (await response.json()) as
        | { data?: TransactionRecord; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible d'enregistrer les modifications.");
      }

      setSavedTransaction(
        payload?.data ?? {
          amount: amountValue,
          date: `${date}T12:00:00Z`,
          label: label.trim(),
          type,
        },
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer les modifications.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main style={{ ...styles.page, background: PALETTES.expense.background }}>
        <div style={styles.ambientBlue} />
        <div style={styles.ambientCoral} />
        <section style={styles.statusShell}>
          <div style={styles.statusCard}>Chargement de la transaction...</div>
        </section>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={{ ...styles.page, background: PALETTES.expense.background }}>
        <div style={styles.ambientBlue} />
        <div style={styles.ambientCoral} />
        <section style={styles.statusShell}>
          <div style={{ ...styles.statusCard, ...styles.errorCard }}>
            <strong>Edition indisponible</strong>
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              style={styles.statusButton}
            >
              Retour aux transactions
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div style={{ ...styles.page, background: palette.background }}>
      <div style={{ ...styles.orb, ...styles.orbPrimary, background: palette.orbOne }} />
      <div style={{ ...styles.orb, ...styles.orbSecondary, background: palette.orbTwo }} />
      <div style={{ ...styles.orb, ...styles.orbTertiary, background: palette.orbThree }} />
      <div style={{ ...styles.meshOverlay, background: `linear-gradient(180deg, ${palette.accentSoft}, rgba(255,255,255,0))` }} />

      {submitError ? (
        <div style={styles.errorBanner}>
          <strong style={styles.errorTitle}>Mise a jour indisponible</strong>
          <span>{submitError}</span>
        </div>
      ) : null}

      {savedTransaction ? (
        <div style={styles.successOverlay}>
          <div style={{ ...styles.successPanel, boxShadow: palette.actionShadow }}>
            <div style={{ ...styles.successHalo, background: `radial-gradient(circle, ${palette.accentGlow} 0%, rgba(255,255,255,0) 70%)` }} />
            <div style={{ ...styles.successCheck, background: palette.toggleActive }}>✓</div>
            <p style={styles.successEyebrow}>Transaction mise a jour</p>
            <div style={{ ...styles.previewCard, borderColor: `${accentColor}55` }}>
              <div style={styles.previewTopRow}>
                <div style={styles.previewBadge}>
                  <span style={{ ...styles.previewCategoryIcon, backgroundColor: `${accentColor}22`, color: accentColor }}>
                    {selectedCategory.icon}
                  </span>
                  <div>
                    <p style={styles.previewCategory}>{selectedCategory.name}</p>
                    <p style={styles.previewMeta}>{savedTransaction.date.slice(0, 10)}</p>
                  </div>
                </div>
                <p style={{ ...styles.previewAmountMajor, color: accentColor }}>
                  {`${savedTransaction.type === "income" ? "+" : "-"} ${savedTransaction.amount.toFixed(2)} €`}
                </p>
              </div>
              <h3 style={styles.previewTitle}>{savedTransaction.label}</h3>
              <p style={styles.previewNarrative}>
                La transaction a ete mise a jour dans votre historique.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                router.push("/transactions");
                router.refresh();
              }}
              style={{ ...styles.primaryButton, background: palette.toggleActive }}
            >
              Retour aux transactions
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ ...styles.stickyHeader, borderBottomColor: `${accentColor}33` }}>
        <div style={styles.headerTop}>
          <button
            type="button"
            onClick={() => router.push("/transactions")}
            style={styles.iconButton}
          >
            ✕
          </button>
          <div>
            <p style={styles.headerEyebrow}>Edition</p>
            <h1 style={styles.headerTitle}>Modifier la transaction</h1>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={styles.typeToggle}>
          <button
            type="button"
            onClick={() => setType("expense")}
            style={{
              ...styles.toggleButton,
              color: type === "expense" ? "#fff" : "rgba(247, 251, 255, 0.72)",
              background: type === "expense" ? palette.toggleActive : "transparent",
              boxShadow: type === "expense" ? `0 12px 24px ${palette.accentSoft}` : "none",
            }}
          >
            Depense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            style={{
              ...styles.toggleButton,
              color: type === "income" ? "#fff" : "rgba(247, 251, 255, 0.72)",
              background: type === "income" ? PALETTES.income.toggleActive : "transparent",
              boxShadow: type === "income" ? `0 12px 24px ${PALETTES.income.accentSoft}` : "none",
            }}
          >
            Revenu
          </button>
        </div>

        <div style={styles.amountContainer}>
          <div style={styles.amountInputRow}>
            <span style={{ ...styles.currencySymbol, color: accentColor }}>
              {type === "expense" ? "-" : "+"} €
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              style={{ ...styles.amountInput, textShadow: palette.textShadow }}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>
      </div>

      <form id="edit-transaction-form" style={styles.scrollContent} onSubmit={handleSubmit}>
        <section style={styles.section}>
          <p style={styles.sectionTitle}>Details principaux</p>
          <input
            type="text"
            placeholder="Qu'avez-vous modifie ?"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            style={styles.textInput}
          />

          <div style={styles.categoryGrid}>
            {filteredCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                style={{
                  ...styles.categoryChip,
                  background: category === item.id
                    ? `linear-gradient(135deg, ${item.color}33, rgba(255,255,255,0.08))`
                    : "rgba(8, 14, 29, 0.36)",
                  borderColor: category === item.id ? item.color : "rgba(255,255,255,0.08)",
                  boxShadow: category === item.id ? `0 16px 30px -18px ${item.color}` : "none",
                }}
              >
                <span style={styles.categoryIcon}>{item.icon}</span>
                <span style={{ ...styles.categoryName, color: category === item.id ? item.color : "#fff" }}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>

          <label style={styles.selectLabel}>
            Toutes les categories
            <div style={styles.selectWrap}>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={{ ...styles.selectInput, borderColor: `${accentColor}33` }}
              >
                {filteredCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {item.name}
                  </option>
                ))}
              </select>
              <span style={{ ...styles.selectChevron, color: accentColor }}>⌄</span>
            </div>
          </label>
        </section>

        <section style={styles.section}>
          <p style={styles.sectionTitle}>Date</p>
          <input
            type="date"
            style={styles.textInput}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </section>

        <section style={{ ...styles.section, ...styles.previewSection, borderColor: `${accentColor}44` }}>
          <div style={styles.previewTopRow}>
            <div style={styles.previewBadge}>
              <span style={{ ...styles.previewCategoryIcon, backgroundColor: `${accentColor}22`, color: accentColor }}>
                {selectedCategory.icon || "•"}
              </span>
              <div>
                <p style={styles.previewCategory}>{selectedCategory.name || "Categorie"}</p>
                <p style={styles.previewMeta}>{date || "Date a definir"}</p>
              </div>
            </div>
            <div style={styles.previewAmountWrap}>
              <p style={{ ...styles.previewAmountMajor, color: accentColor }}>{amountInteger}</p>
              <p style={{ ...styles.previewAmountMinor, color: accentColor }}>,{amountDecimals} €</p>
            </div>
          </div>
          <h2 style={styles.previewTitle}>{label.trim() || "Votre transaction mise a jour apparaitra ici"}</h2>
          <p style={styles.previewNarrative}>{previewNarrative}</p>
        </section>

        <div style={{ height: 208 }} />
      </form>

      {!savedTransaction ? (
        <div style={styles.actionArea}>
          <button
            form="edit-transaction-form"
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              ...styles.primaryButton,
              background: `linear-gradient(135deg, ${accentColor}, ${palette.secondaryGlow})`,
              opacity: isSubmitDisabled ? 0.5 : 1,
              boxShadow: palette.actionShadow,
            }}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    color: "#f7fbff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
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
  orb: {
    position: "fixed",
    borderRadius: "999px",
    filter: "blur(42px)",
    pointerEvents: "none",
    opacity: 0.88,
    zIndex: 0,
  },
  orbPrimary: {
    width: "15rem",
    height: "15rem",
    top: "4.5rem",
    left: "-3rem",
  },
  orbSecondary: {
    width: "18rem",
    height: "18rem",
    top: "22rem",
    right: "-5rem",
  },
  orbTertiary: {
    width: "12rem",
    height: "12rem",
    bottom: "8rem",
    left: "35%",
  },
  meshOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.3,
    zIndex: 0,
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
  statusButton: {
    width: "fit-content",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, rgba(255, 69, 58, 0.96), rgba(10, 132, 255, 0.82))",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBanner: {
    position: "relative",
    zIndex: 16,
    margin: "16px 20px 0",
    padding: "14px 16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(119, 24, 31, 0.42)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    display: "grid",
    gap: "4px",
    color: "#ffe7e8",
  },
  errorTitle: {
    fontSize: "0.92rem",
    letterSpacing: "0.02em",
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "linear-gradient(180deg, rgba(11, 18, 35, 0.72) 0%, rgba(15, 22, 43, 0.48) 100%)",
    backdropFilter: "blur(26px) saturate(180%)",
    WebkitBackdropFilter: "blur(26px) saturate(180%)",
    padding: "16px 20px 30px",
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 20px 45px rgba(5, 10, 22, 0.28)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  headerEyebrow: {
    margin: 0,
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(208, 224, 255, 0.68)",
  },
  headerTitle: {
    margin: "6px 0 0",
    fontSize: "1.3rem",
    letterSpacing: "-0.04em",
  },
  iconButton: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#f7fbff",
    fontSize: "20px",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    borderRadius: "999px",
  },
  typeToggle: {
    display: "flex",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "999px",
    padding: "3px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    width: "fit-content",
    margin: "0 auto 24px",
  },
  toggleButton: {
    padding: "6px 16px",
    borderRadius: "999px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
    cursor: "pointer",
  },
  amountContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  amountInputRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginRight: "8px",
  },
  amountInput: {
    background: "none",
    border: "none",
    color: "#f7fbff",
    fontSize: "3.5rem",
    fontWeight: 800,
    width: "200px",
    outline: "none",
    textAlign: "left",
  },
  scrollContent: {
    padding: "24px 20px",
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  section: {
    marginBottom: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "18px",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
    boxShadow: "0 16px 40px rgba(3, 8, 20, 0.22)",
  },
  sectionTitle: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "rgba(227, 236, 255, 0.72)",
    marginBottom: "16px",
    fontWeight: 600,
  },
  textInput: {
    width: "100%",
    background: "rgba(8, 14, 29, 0.38)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "16px",
    color: "#f7fbff",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "16px",
  },
  categoryChip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    textAlign: "left",
  },
  categoryIcon: {
    fontSize: "20px",
  },
  categoryName: {
    fontSize: "14px",
    fontWeight: 600,
  },
  selectLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px",
    fontSize: "0.84rem",
    color: "rgba(227, 236, 255, 0.74)",
  },
  selectWrap: {
    position: "relative",
  },
  selectInput: {
    width: "100%",
    appearance: "none",
    background: "rgba(8, 14, 29, 0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "14px 44px 14px 16px",
    color: "#f7fbff",
    fontSize: "0.98rem",
    outline: "none",
  },
  selectChevron: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  previewSection: {
    overflow: "hidden",
  },
  previewCard: {
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
    padding: "18px",
  },
  previewTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  previewBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  previewCategoryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.15rem",
    fontWeight: 700,
  },
  previewCategory: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 700,
  },
  previewMeta: {
    margin: "2px 0 0",
    fontSize: "0.8rem",
    color: "rgba(227, 236, 255, 0.68)",
  },
  previewAmountWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: "2px",
  },
  previewAmountMajor: {
    margin: 0,
    fontSize: "1.55rem",
    fontWeight: 800,
    letterSpacing: "-0.05em",
    lineHeight: 0.95,
  },
  previewAmountMinor: {
    margin: "0 0 2px",
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  previewTitle: {
    margin: "18px 0 8px",
    fontSize: "1.35rem",
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  },
  previewNarrative: {
    margin: 0,
    color: "rgba(237, 243, 255, 0.8)",
    lineHeight: 1.5,
  },
  actionArea: {
    position: "fixed",
    bottom: "96px",
    left: "0",
    right: "0",
    padding: "20px",
    background: "linear-gradient(180deg, rgba(9, 17, 31, 0) 0%, rgba(9, 17, 31, 0.82) 34%, rgba(9, 17, 31, 0.94) 100%)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    zIndex: 40,
    pointerEvents: "none",
  },
  primaryButton: {
    width: "100%",
    maxWidth: "min(640px, calc(100vw - 40px))",
    margin: "0 auto",
    display: "block",
    padding: "18px",
    borderRadius: "18px",
    border: "none",
    color: "#fff",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.25s ease",
    pointerEvents: "auto",
  },
  successOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(8, 12, 24, 0.52)",
    backdropFilter: "blur(26px)",
    WebkitBackdropFilter: "blur(26px)",
  },
  successPanel: {
    position: "relative",
    width: "min(460px, 100%)",
    borderRadius: "28px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(16, 24, 43, 0.92) 0%, rgba(12, 18, 31, 0.96) 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
    overflow: "hidden",
    display: "grid",
    gap: "18px",
  },
  successHalo: {
    position: "absolute",
    inset: "-20%",
    opacity: 0.55,
    pointerEvents: "none",
  },
  successCheck: {
    position: "relative",
    zIndex: 1,
    width: "58px",
    height: "58px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    fontWeight: 800,
    boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
  },
  successEyebrow: {
    position: "relative",
    zIndex: 1,
    margin: "0",
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(227, 236, 255, 0.68)",
  },
};
