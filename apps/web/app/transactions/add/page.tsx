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

const CATEGORIES: Category[] = [
    { id: "food", name: "Alimentation", icon: "🍽️", color: "#FF453A", type: "expense" },
    { id: "transport", name: "Transport", icon: "🚇", color: "#0A84FF", type: "expense" },
    { id: "shopping", name: "Shopping", icon: "🛍️", color: "#BF5AF2", type: "expense" },
    { id: "entertainment", name: "Loisirs", icon: "🎞️", color: "#5E5CE6", type: "expense" },
    { id: "salary", name: "Salaire", icon: "💼", color: "#32D74B", type: "income" },
    { id: "freelance", name: "Freelance", icon: "✨", color: "#64D2FF", type: "income" },
];

export default function MobileFintechAdd() {
    const [type, setType] = useState<TransactionType>("expense");
    const [amount, setAmount] = useState("");
    const [label, setLabel] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [showDetails, setShowDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isExpense = type === "expense";
    const accentColor = isExpense ? "#FF453A" : "#32D74B";

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
        <div style={styles.container}>
            {/* --- STICKY HEADER: MONTANT --- */}
            <div style={{ ...styles.stickyHeader, borderBottomColor: `${accentColor}33` }}>
                <div style={styles.headerTop}>
                    <button onClick={() => window.history.back()} style={styles.iconButton}>✕</button>
                    <div style={styles.typeToggle}>
                        <button
                            onClick={() => setType("expense")}
                            style={{ ...styles.toggleBtn, color: isExpense ? "#fff" : "#444", background: isExpense ? "#1c1c1e" : "transparent" }}
                        >Dépense</button>
                        <button
                            onClick={() => setType("income")}
                            style={{ ...styles.toggleBtn, color: !isExpense ? "#fff" : "#444", background: !isExpense ? "#1c1c1e" : "transparent" }}
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
                        style={styles.amountInput}
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
                        {CATEGORIES.filter(c => c.type === type).map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                style={{
                                    ...styles.categoryChip,
                                    backgroundColor: category === cat.id ? `${cat.color}22` : "#1c1c1e",
                                    borderColor: category === cat.id ? cat.color : "transparent",
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
                        <input type="date" style={styles.textInput} defaultValue={new Date().toISOString().split('T')[0]} />
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
                        backgroundColor: accentColor,
                        opacity: (parseFloat(amount) === 0 || !label) ? 0.5 : 1
                    }}
                >
                    Confirmer {isExpense ? "la dépense" : "le revenu"}
                </button>
            </div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: {
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    stickyHeader: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(20px)",
        padding: "16px 20px 30px",
        borderBottom: "1px solid #1c1c1e",
    },
    headerTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    },
    iconButton: {
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "20px",
        cursor: "pointer",
    },
    typeToggle: {
        display: "flex",
        backgroundColor: "#1c1c1e",
        borderRadius: "999px",
        padding: "2px",
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
        color: "#fff",
        fontSize: "3.5rem",
        fontWeight: 800,
        width: "200px",
        outline: "none",
        textAlign: "left",
    },
    scrollContent: {
        padding: "24px 20px",
        flex: 1,
    },
    section: {
        marginBottom: "32px",
    },
    sectionTitle: {
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "#8e8e93",
        marginBottom: "16px",
        fontWeight: 600,
    },
    textInput: {
        width: "100%",
        backgroundColor: "#1c1c1e",
        border: "1px solid #2c2c2e",
        borderRadius: "14px",
        padding: "16px",
        color: "#fff",
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
        border: "1px solid transparent",
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
    expandButton: {
        background: "none",
        border: "1px dashed #444",
        color: "#8e8e93",
        width: "100%",
        padding: "16px",
        borderRadius: "14px",
        fontSize: "14px",
        cursor: "pointer",
    },
    sectionAnimated: {
        animation: "fadeIn 0.4s ease-out",
    },
    actionArea: {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        padding: "20px",
        background: "linear-gradient(transparent, #000 30%)",
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
        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    },
};