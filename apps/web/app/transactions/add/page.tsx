"use client";

import React, { useState, useEffect, type CSSProperties, type FormEvent } from "react";

type TransactionType = "expense" | "income";

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
}

interface ModePalette {
    accent: string;
    accentSoft: string;
    accentGlow: string;
    secondaryGlow: string;
    toggleActive: string;
    textShadow: string;
    actionShadow: string;
    background: string;
    orbOne: string;
    orbTwo: string;
    orbThree: string;
}

interface TransactionSnapshot {
    amount: string;
    label: string;
    categoryName: string;
    categoryIcon: string;
    date: string;
    note: string;
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

const DEFAULT_CATEGORY_ID = CATEGORIES[0]?.id ?? "";
const getCurrentDate = () => new Date().toISOString().slice(0, 10);
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

export default function MobileFintechAdd() {
    const [type, setType] = useState<TransactionType>("expense");
    const [amount, setAmount] = useState("");
    const [label, setLabel] = useState("");
    const [category, setCategory] = useState(DEFAULT_CATEGORY_ID);
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedTransaction, setSavedTransaction] = useState<TransactionSnapshot | null>(null);
    const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isCapturingPreview, setIsCapturingPreview] = useState(false);
    const [initialBalance, setInitialBalance] = useState<number | null>(null);

    useEffect(() => {
        setDate((currentDate) => currentDate || getCurrentDate());

        const fetchBalance = async () => {
            try {
                const response = await fetch("/api/transactions");
                const data = await response.json();
                if (Array.isArray(data)) {
                    const balance = data.reduce((acc, tx) => {
                        return acc + (tx.type === "income" ? tx.amount : -tx.amount);
                    }, 0);
                    setInitialBalance(balance);
                }
            } catch (err) {
                console.error("Failed to fetch initial balance", err);
            }
        };
        fetchBalance();
    }, []);

    const isExpense = type === "expense";
    const filteredCategories = CATEGORIES.filter((c) => c.type === type);
    const palette = PALETTES[type];
    const selectedCategory =
        filteredCategories.find((c) => c.id === category) ??
        filteredCategories[0] ?? {
            id: "",
            name: "",
            icon: "",
            color: palette.accent,
            type,
        };
    const accentColor = selectedCategory?.color ?? palette.accent;
    const amountValue = parseFloat(amount || "0");
    const currentBalance = initialBalance !== null
        ? initialBalance + (isExpense ? -amountValue : amountValue)
        : null;
    const isSubmitDisabled = isSubmitting || amountValue <= 0 || !label.trim();
    const formattedPreviewAmount = `${isExpense ? "-" : "+"} ${amountValue.toFixed(2)} €`;
    const amountInteger = `${isExpense ? "-" : "+"}${Math.floor(amountValue).toString()}`;
    const amountDecimals = amountValue.toFixed(2).split(".")[1] ?? "00";
    const previewNarrative = isExpense
        ? `Cette depense sera rangee dans ${selectedCategory.name || "une categorie"}`
        : `Ce revenu sera ajoute a ${selectedCategory.name || "une categorie"}`;

    const formatAmount = (val: string) => {
        const cleaned = val.replace(/[^\d]/g, "");
        if (!cleaned) return "0.00";
        const num = (parseInt(cleaned) / 100).toFixed(2);
        return num;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            setAmount("");
            return;
        }
        setAmount(formatAmount(val));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitDisabled) {
            return;
        }

        setIsSubmitting(true);
        setIsCapturingPreview(true);
        setCardTilt({ rotateX: 0, rotateY: 0 });
        setSubmitError(null);

        try {
            const body = {
                amount: amountValue,
                category: selectedCategory.name || null,
                currency: "EUR",
                date: date + "T12:00:00Z",
                label: label.trim(),
                note: note.trim() || undefined,
                type,
            };

            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error ?? "Impossible d'enregistrer la transaction.");
            }

            setSavedTransaction({
                amount: `${type === "income" ? "+" : "-"} ${amountValue.toFixed(2)} €`,
                label: label.trim(),
                categoryName: selectedCategory.name ?? "Categorie",
                categoryIcon: selectedCategory.icon || "•",
                date: date,
                note: note.trim(),
                type: type,
            });

            // Update initialBalance for next entry
            setInitialBalance(prev => prev !== null ? prev + (type === "income" ? amountValue : -amountValue) : null);
            
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
            setIsCapturingPreview(false);
        }
    };

    const handlePreviewMove = (event: React.MouseEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

        setCardTilt({
            rotateX: offsetY * -8,
            rotateY: offsetX * 10,
        });
    };

    const resetPreviewTilt = () => {
        setCardTilt({ rotateX: 0, rotateY: 0 });
    };

    return (
        <div style={{ ...styles.container, background: palette.background }}>
            <div style={{ ...styles.orb, ...styles.orbPrimary, background: palette.orbOne }} />
            <div style={{ ...styles.orb, ...styles.orbSecondary, background: palette.orbTwo }} />
            <div style={{ ...styles.orb, ...styles.orbTertiary, background: palette.orbThree }} />
            <div style={{ ...styles.meshOverlay, background: `linear-gradient(180deg, ${palette.accentSoft}, rgba(255,255,255,0))` }} />

            {submitError ? (
                <div style={styles.errorBanner}>
                    <strong style={styles.errorTitle}>Enregistrement indisponible</strong>
                    <span>{submitError}</span>
                </div>
            ) : null}

            {savedTransaction ? (
                <div style={styles.successOverlay}>
                    <div style={{ ...styles.successPanel, boxShadow: palette.actionShadow }}>
                        <div style={{ ...styles.successHalo, background: `radial-gradient(circle, ${palette.accentGlow} 0%, rgba(255,255,255,0) 70%)` }} />
                        <div style={{ ...styles.successCheck, background: palette.toggleActive }}>✓</div>
                        <p style={styles.successEyebrow}>Transaction enregistree</p>
                        <div style={{ ...styles.previewCard, ...styles.previewCardSuccess, borderColor: `${accentColor}55` }}>
                            <div style={styles.previewTopRow}>
                                <div style={styles.previewBadge}>
                                    <span style={{ ...styles.previewCategoryIcon, backgroundColor: `${accentColor}22`, color: accentColor }}>
                                        {savedTransaction.categoryIcon}
                                    </span>
                                    <div>
                                        <p style={styles.previewCategory}>{savedTransaction.categoryName}</p>
                                        <p style={styles.previewMeta}>{savedTransaction.date}</p>
                                    </div>
                                </div>
                                <p style={{ ...styles.previewAmountMajor, color: accentColor }}>{savedTransaction.amount}</p>
                            </div>
                            <h3 style={styles.previewTitle}>{savedTransaction.label}</h3>
                            <p style={styles.previewNarrative}>
                                {savedTransaction.type === "expense"
                                    ? "La depense a ete ajoutee a votre timeline budget."
                                    : "Le revenu a ete ajoute a votre flux financier."}
                            </p>
                            {savedTransaction.note ? (
                                <p style={styles.previewNote}>“{savedTransaction.note}”</p>
                            ) : null}
                        </div>
                        <div style={styles.successActions}>
                            <button
                                type="button"
                                onClick={() => {
                                    setSavedTransaction(null);
                                    setAmount("");
                                    setLabel("");
                                    setNote("");
                                    setDate(getCurrentDate());
                                    setShowDetails(false);
                                    setSubmitError(null);
                                }}
                                style={{ ...styles.successButton, ...styles.secondarySuccessButton }}
                            >
                                Ajouter une autre
                            </button>
                            <button
                                type="button"
                                onClick={() => setSavedTransaction(null)}
                                style={{ ...styles.successButton, background: palette.toggleActive }}
                            >
                                Revenir au formulaire
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* --- STICKY HEADER: MONTANT --- */}
            <div style={{ ...styles.stickyHeader, borderBottomColor: `${accentColor}33` }}>
                <div style={styles.headerTop}>
                    <button onClick={() => window.history.back()} style={styles.iconButton}>✕</button>
                    <div style={styles.typeToggle}>
                        <button
                            onClick={() => {
                                setType("expense");
                                setCategory(CATEGORIES.find((c) => c.type === "expense")?.id ?? DEFAULT_CATEGORY_ID);
                            }}
                            style={{
                                ...styles.toggleBtn,
                                color: isExpense ? "#fff" : "rgba(247, 251, 255, 0.72)",
                                background: isExpense ? palette.toggleActive : "transparent",
                                boxShadow: isExpense ? `0 12px 24px ${palette.accentSoft}` : "none",
                            }}
                        >Dépense</button>
                        <button
                            onClick={() => {
                                setType("income");
                                setCategory(CATEGORIES.find((c) => c.type === "income")?.id ?? DEFAULT_CATEGORY_ID);
                            }}
                            style={{
                                ...styles.toggleBtn,
                                color: !isExpense ? "#fff" : "rgba(247, 251, 255, 0.72)",
                                background: !isExpense ? PALETTES.income.toggleActive : "transparent",
                                boxShadow: !isExpense ? `0 12px 24px ${PALETTES.income.accentSoft}` : "none",
                            }}
                        >Revenu</button>
                    </div>
                    <div style={{ width: 40 }} /> {/* Spacer */}
                </div>

                <div style={styles.amountContainer}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={styles.amountInputRow}>
                            <span style={{ ...styles.currencySymbol, color: accentColor }}>{isExpense ? "-" : "+"} €</span>
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
                        {currentBalance !== null && (
                            <p style={{ 
                                margin: "8px 0 0", 
                                fontSize: "0.9rem", 
                                color: "rgba(255,255,255,0.6)",
                                letterSpacing: "0.05em"
                            }}>
                                SOLDE APRÈS : <span style={{ color: currentBalance >= 0 ? "#32D74B" : "#FF453A", fontWeight: 700 }}>
                                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(currentBalance)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <form id="transaction-form" style={styles.scrollContent} onSubmit={handleSubmit}>
                <section style={styles.section}>
                    <p style={styles.sectionTitle}>Détails principaux</p>
                    <input
                        type="text"
                        placeholder="Qu'avez-vous acheté ?"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        style={styles.textInput}
                    />

                    <div style={styles.categoryGrid}>
                        {filteredCategories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                style={{
                                    ...styles.categoryChip,
                                    background: category === cat.id
                                        ? `linear-gradient(135deg, ${cat.color}33, rgba(255,255,255,0.08))`
                                        : "rgba(8, 14, 29, 0.36)",
                                    borderColor: category === cat.id ? cat.color : "rgba(255,255,255,0.08)",
                                    boxShadow: category === cat.id ? `0 16px 30px -18px ${cat.color}, inset 0 1px 0 rgba(255,255,255,0.18)` : "none",
                                    transform: category === cat.id ? "translateY(-1px)" : "translateY(0)",
                                    animation: category === cat.id ? "chipPop 0.34s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                                }}
                            >
                                {category === cat.id ? (
                                    <span
                                        style={{
                                            ...styles.categoryRipple,
                                            color: cat.color,
                                        }}
                                    />
                                ) : null}
                                <span style={styles.categoryIcon}>{cat.icon}</span>
                                <span style={{ ...styles.categoryName, color: category === cat.id ? cat.color : "#fff" }}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                    <label style={styles.selectLabel}>
                        Toutes les catégories
                        <div style={styles.selectWrap}>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ ...styles.selectInput, borderColor: `${accentColor}33` }}
                            >
                                {filteredCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            <span style={{ ...styles.selectChevron, color: accentColor }}>⌄</span>
                        </div>
                    </label>
                </section>

                <section
                    style={{
                        ...styles.section,
                        ...styles.previewSection,
                        borderColor: `${accentColor}44`,
                        transform: `perspective(1200px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg) translateY(${isCapturingPreview ? "-20px" : "0px"}) scale(${isCapturingPreview ? 0.94 : 1})`,
                        boxShadow: isCapturingPreview
                            ? `0 42px 90px -42px ${palette.accentGlow}`
                            : `0 24px 52px -28px ${palette.accentGlow}`,
                        opacity: isCapturingPreview ? 0.35 : 1,
                    }}
                    onMouseMove={handlePreviewMove}
                    onMouseLeave={resetPreviewTilt}
                >
                    <div
                        style={{
                            ...styles.previewReflection,
                            background: `linear-gradient(120deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02) 38%, transparent 62%)`,
                            transform: `translateX(${cardTilt.rotateY * 2}px) translateY(${cardTilt.rotateX * -2}px)`,
                        }}
                    />
                    <div style={styles.previewTopRow}>
                        <div style={styles.previewBadge}>
                            <span style={{ ...styles.previewCategoryIcon, backgroundColor: `${accentColor}22`, color: accentColor }}>
                                {selectedCategory.icon || "•"}
                            </span>
                            <div>
                                <p style={styles.previewCategory}>{selectedCategory.name || "Categorie"}</p>
                                <p style={styles.previewMeta}>{date}</p>
                            </div>
                        </div>
                        <div key={formattedPreviewAmount} style={styles.previewAmountWrap}>
                            <p style={{ ...styles.previewAmountMajor, color: accentColor }}>{amountInteger}</p>
                            <p style={{ ...styles.previewAmountMinor, color: accentColor }}>,{amountDecimals} €</p>
                        </div>
                    </div>
                    <h2 style={styles.previewTitle}>{label.trim() || "Votre transaction apparaitra ici"}</h2>
                    <p style={styles.previewNarrative}>{previewNarrative}</p>
                    {note.trim() ? <p style={styles.previewNote}>“{note.trim()}”</p> : null}
                    <div style={styles.previewFooter}>
                        <span style={{ ...styles.previewPulse, backgroundColor: accentColor, color: accentColor }}>
                            <span style={styles.previewPulseRing} />
                        </span>
                        <span style={styles.previewFooterText}>
                            {isExpense ? "Effet immediat sur votre budget du mois" : "Le solde disponible augmentera instantanement"}
                        </span>
                    </div>
                </section>

                {/* --- PROGRESSIVE DISCLOSURE --- */}
                {!showDetails ? (
                    <button
                        type="button"
                        onClick={() => setShowDetails(true)}
                        style={styles.expandButton}
                    >
                        + Ajouter une note ou changer la date
                    </button>
                ) : (
                    <section style={styles.sectionAnimated}>
                        <p style={styles.sectionTitle}>Options avancées</p>
                        <input type="date" style={styles.textInput} value={date} onChange={(e) => setDate(e.target.value)} />
                        <textarea
                            placeholder="Notes additionnelles..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{ ...styles.textInput, minHeight: 80, marginTop: 12 }}
                        />
                    </section>
                )}

                <div style={{ height: 208 }} /> {/* Padding for sticky button + app nav */}
            </form>

            {/* --- FIXED SUBMIT BUTTON --- */}
            {!savedTransaction ? (
                <div style={styles.actionArea}>
                    <button
                        form="transaction-form"
                        type="submit"
                        disabled={isSubmitDisabled}
                        style={{
                            ...styles.submitButton,
                            background: `linear-gradient(135deg, ${accentColor}, ${palette.secondaryGlow})`,
                            opacity: isSubmitDisabled ? 0.5 : 1,
                            boxShadow: palette.actionShadow,
                        }}
                    >
                        {isSubmitting ? "Enregistrement..." : `Confirmer ${isExpense ? "la dépense" : "le revenu"}`}
                    </button>
                </div>
            ) : null}

            <style jsx>{`
                @keyframes floatOne {
                    0% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(24px, 18px, 0) scale(1.08); }
                    100% { transform: translate3d(0, 0, 0) scale(1); }
                }

                @keyframes floatTwo {
                    0% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-26px, 22px, 0) scale(0.94); }
                    100% { transform: translate3d(0, 0, 0) scale(1); }
                }

                @keyframes floatThree {
                    0% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(12px, -18px, 0) scale(1.04); }
                    100% { transform: translate3d(0, 0, 0) scale(1); }
                }

                @keyframes pulseRing {
                    0% { transform: scale(0.92); opacity: 0.9; }
                    70% { transform: scale(1.4); opacity: 0; }
                    100% { transform: scale(1.4); opacity: 0; }
                }

                @keyframes successRise {
                    0% { transform: translateY(34px) scale(0.88); opacity: 0; }
                    55% { transform: translateY(-4px) scale(1.02); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }

                @keyframes shimmerSweep {
                    0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
                    20% { opacity: 0.55; }
                    100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
                }

                @keyframes amountLift {
                    0% { opacity: 0.7; transform: translateY(10px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes amountRoll {
                    0% { opacity: 0; transform: translateY(16px) scale(0.96); filter: blur(6px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }

                @keyframes chipPop {
                    0% { transform: scale(0.96); }
                    55% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                }

                @keyframes rippleOut {
                    0% { transform: scale(0.3); opacity: 0.38; }
                    100% { transform: scale(1.7); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: {
        color: "#f7fbff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
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
        animation: "floatOne 12s ease-in-out infinite",
    },
    orbSecondary: {
        width: "18rem",
        height: "18rem",
        top: "22rem",
        right: "-5rem",
        animation: "floatTwo 15s ease-in-out infinite",
    },
    orbTertiary: {
        width: "12rem",
        height: "12rem",
        bottom: "8rem",
        left: "35%",
        animation: "floatThree 13s ease-in-out infinite",
    },
    meshOverlay: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.3,
        zIndex: 0,
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
        boxShadow: "0 18px 32px rgba(23, 8, 12, 0.24)",
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
        marginBottom: "24px",
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
    },
    toggleBtn: {
        padding: "6px 16px",
        borderRadius: "999px",
        border: "none",
        fontSize: "13px",
        fontWeight: 600,
        transition: "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        cursor: "pointer",
    },
    amountInputRow: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
    },
    amountContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        marginBottom: "32px",
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
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
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
        background: "rgba(8, 14, 29, 0.36)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        transition: "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        position: "relative",
        overflow: "hidden",
    },
    categoryRipple: {
        position: "absolute",
        inset: "50% auto auto 50%",
        width: "72px",
        height: "72px",
        borderRadius: "999px",
        border: "1px solid currentColor",
        transform: "translate(-50%, -50%)",
        opacity: 0,
        animation: "rippleOut 0.56s ease-out",
        pointerEvents: "none",
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
        letterSpacing: "0.02em",
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
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
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
    expandButton: {
        background: "rgba(255,255,255,0.07)",
        border: "1px dashed rgba(255,255,255,0.22)",
        color: "rgba(227, 236, 255, 0.78)",
        width: "100%",
        padding: "16px",
        borderRadius: "20px",
        fontSize: "14px",
        cursor: "pointer",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
    },
    sectionAnimated: {
        animation: "fadeIn 0.4s ease-out",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "24px",
        padding: "18px",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow: "0 16px 40px rgba(3, 8, 20, 0.22)",
    },
    previewSection: {
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.24s ease",
        transformStyle: "preserve-3d",
    },
    previewReflection: {
        position: "absolute",
        inset: "-20%",
        opacity: 0.55,
        pointerEvents: "none",
        animation: "shimmerSweep 5.2s ease-in-out infinite",
    },
    previewCard: {
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        padding: "18px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
    },
    previewCardSuccess: {
        marginTop: "8px",
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
        animation: "amountRoll 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
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
    previewNote: {
        margin: "14px 0 0",
        padding: "12px 14px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.07)",
        color: "rgba(247, 251, 255, 0.9)",
        fontStyle: "italic",
    },
    previewFooter: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "16px",
    },
    previewPulse: {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
    },
    previewPulseRing: {
        position: "absolute",
        inset: "-6px",
        borderRadius: "999px",
        border: "1px solid currentColor",
        opacity: 0.75,
        animation: "pulseRing 1.8s ease-out infinite",
    },
    previewFooterText: {
        color: "rgba(227, 236, 255, 0.72)",
        fontSize: "0.84rem",
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
    submitButton: {
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
        animation: "successRise 0.35s ease-out",
        overflow: "hidden",
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
        marginBottom: "16px",
        boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
    },
    successEyebrow: {
        position: "relative",
        zIndex: 1,
        margin: "0 0 8px",
        fontSize: "0.78rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(227, 236, 255, 0.68)",
    },
    successActions: {
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginTop: "18px",
    },
    successButton: {
        border: "none",
        borderRadius: "16px",
        padding: "14px 16px",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
    },
    secondarySuccessButton: {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
    },
};
