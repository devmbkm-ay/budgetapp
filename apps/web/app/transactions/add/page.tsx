"use client";

import React, { useState, type CSSProperties, type FormEvent } from "react";

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
    const [showDetails, setShowDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const formatAmount = (val: string) => {
        const cleaned = val.replace(/[^\d]/g, "");
        if (!cleaned) return "0.00";
        const num = (parseInt(cleaned) / 100).toFixed(2);
        return num;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(formatAmount(e.target.value));
    };

    return (
        <div style={{ ...styles.container, background: palette.background }}>
            <div style={{ ...styles.orb, ...styles.orbPrimary, background: palette.orbOne }} />
            <div style={{ ...styles.orb, ...styles.orbSecondary, background: palette.orbTwo }} />
            <div style={{ ...styles.orb, ...styles.orbTertiary, background: palette.orbThree }} />
            <div style={{ ...styles.meshOverlay, background: `linear-gradient(180deg, ${palette.accentSoft}, rgba(255,255,255,0))` }} />

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
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <form style={styles.scrollContent}>
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
                                }}
                            >
                                <span style={styles.categoryIcon}>{cat.icon}</span>
                                <span style={{ ...styles.categoryName, color: category === cat.id ? cat.color : "#fff" }}>{cat.name}</span>
                            </button>
                        ))}
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
                        <input type="date" style={styles.textInput} defaultValue={getCurrentDate()} />
                        <textarea
                            placeholder="Notes additionnelles..."
                            style={{ ...styles.textInput, minHeight: 80, marginTop: 12 }}
                        />
                    </section>
                )}

                <div style={{ height: 120 }} /> {/* Padding for sticky button */}
            </form>

            {/* --- FIXED SUBMIT BUTTON --- */}
            <div style={styles.actionArea}>
                <button
                    disabled={parseFloat(amount) === 0 || !label}
                    style={{
                        ...styles.submitButton,
                        background: `linear-gradient(135deg, ${accentColor}, ${palette.secondaryGlow})`,
                        opacity: (parseFloat(amount) === 0 || !label) ? 0.5 : 1,
                        boxShadow: palette.actionShadow,
                    }}
                >
                    Confirmer {isExpense ? "la dépense" : "le revenu"}
                </button>
            </div>

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
        transition: "all 0.2s",
        cursor: "pointer",
    },
    amountContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
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
        transition: "all 0.2s ease",
    },
    categoryIcon: {
        fontSize: "20px",
    },
    categoryName: {
        fontSize: "14px",
        fontWeight: 600,
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
    actionArea: {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        padding: "20px",
        background: "linear-gradient(180deg, rgba(9, 17, 31, 0) 0%, rgba(9, 17, 31, 0.82) 34%, rgba(9, 17, 31, 0.94) 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        zIndex: 12,
    },
    submitButton: {
        width: "100%",
        padding: "18px",
        borderRadius: "18px",
        border: "none",
        color: "#fff",
        fontSize: "17px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.25s ease",
    },
};
