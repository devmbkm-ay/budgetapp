"use client";

import { useState } from "react";

// --- Types & Interfaces ---
interface FormData {
    label: string;
    amount: string;
    category: string;
    userId: string;
    date: string;
    type: "expense" | "income";
}

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
}

// --- Configuration ---
const CATEGORIES: Category[] = [
    { id: "food", name: "Alimentation", icon: "🍽️", color: "#FF6B6B", bgColor: "rgba(255, 107, 107, 0.1)" },
    { id: "transport", name: "Transport", icon: "🚗", color: "#4ECDC4", bgColor: "rgba(78, 205, 196, 0.1)" },
    { id: "housing", name: "Logement", icon: "🏠", color: "#45B7D1", bgColor: "rgba(69, 183, 209, 0.1)" },
    { id: "entertainment", name: "Loisirs", icon: "🎭", color: "#96CEB4", bgColor: "rgba(150, 206, 180, 0.1)" },
    { id: "health", name: "Santé", icon: "💊", color: "#FFEAA7", bgColor: "rgba(255, 234, 167, 0.1)" },
    { id: "shopping", name: "Shopping", icon: "🛍️", color: "#DDA0DD", bgColor: "rgba(221, 160, 221, 0.1)" },
    { id: "income", name: "Revenu", icon: "💰", color: "#55A3FF", bgColor: "rgba(85, 163, 255, 0.1)" },
];

const getCurrentDate = () => new Date().toISOString().slice(0, 10);

// --- Components ---
export default function AddTransactionPage() {
    const [formData, setFormData] = useState<FormData>({
        label: "",
        amount: "",
        category: "food",
        userId: "ricardo@test.com",
        date: getCurrentDate(),
        type: "expense",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const selectedCategory = CATEGORIES.find(c => c.id === formData.category);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log("Transaction saved:", formData);
        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            // Reset form
            setFormData({
                label: "",
                amount: "",
                category: "food",
                userId: "ricardo@test.com",
                date: getCurrentDate(),
                type: "expense",
            });
        }, 2000);
    };

    const formatAmount = (value: string) => {
        // Allow only numbers and one decimal point
        const cleaned = value.replace(/[^\\d.]/g, "");
        const parts = cleaned.split(".");
        if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
        return cleaned;
    };

    return (
        <div style={styles.container}>
            {/* Animated Background Gradient */}
            <div style={styles.backgroundGradient} />

            {/* Success Overlay */}
            {showSuccess && (
                <div style={styles.successOverlay}>
                    <div style={styles.successContent}>
                        <div style={styles.successIcon}>✓</div>
                        <p style={styles.successText}>Transaction enregistrée !</p>
                    </div>
                </div>
            )}

            <div style={styles.contentWrapper}>
                {/* Header */}
                <header style={styles.header}>
                    <button
                        onClick={() => window.history.back()}
                        style={styles.backButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
                            e.currentTarget.style.transform = "translateX(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "translateX(0)";
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 style={styles.title}>Nouvelle transaction</h1>
                    <div style={{ width: "40px" }} /> {/* Spacer for alignment */}
                </header>

                {/* Main Card */}
                <div style={styles.mainCard}>
                    {/* Transaction Type Toggle */}
                    <div style={styles.typeToggle}>
                        <button
                            onClick={() => setFormData({ ...formData, type: "expense" })}
                            style={{
                                ...styles.typeButton,
                                ...(formData.type === "expense" ? styles.typeButtonActive : {}),
                                backgroundColor: formData.type === "expense" ? "#FF6B6B" : "transparent",
                                color: formData.type === "expense" ? "#fff" : "#6B7280",
                            }}
                        >
                            <span style={styles.typeIcon}>↓</span>
                            Dépense
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, type: "income", category: "income" })}
                            style={{
                                ...styles.typeButton,
                                ...(formData.type === "income" ? styles.typeButtonActive : {}),
                                backgroundColor: formData.type === "income" ? "#10B981" : "transparent",
                                color: formData.type === "income" ? "#fff" : "#6B7280",
                            }}
                        >
                            <span style={styles.typeIcon}>↑</span>
                            Revenu
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Amount Section - Hero Style */}
                        <div style={styles.amountSection}>
                            <label style={styles.amountLabel}>Montant</label>
                            <div style={styles.amountInputWrapper}>
                                <span style={styles.currencySymbol}>€</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: formatAmount(e.target.value) })}
                                    onFocus={() => setFocusedField("amount")}
                                    onBlur={() => setFocusedField(null)}
                                    style={{
                                        ...styles.amountInput,
                                        color: formData.type === "expense" ? "#FF6B6B" : "#10B981",
                                    }}
                                />
                            </div>
                            <div style={{
                                ...styles.amountUnderline,
                                backgroundColor: formData.type === "expense" ? "#FF6B6B" : "#10B981",
                                transform: focusedField === "amount" ? "scaleX(1)" : "scaleX(0)",
                            }} />
                        </div>

                        {/* Quick Amount Chips */}
                        <div style={styles.quickAmounts}>
                            {[10, 20, 50, 100].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                                    style={styles.amountChip}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#F3F4F6";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    +{amount}€
                                </button>
                            ))}
                        </div>

                        {/* Form Fields */}
                        <div style={styles.fieldsContainer}>
                            {/* Label Field */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.fieldLabel}>Libellé</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>✏️</span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Courses hebdomadaires"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        onFocus={() => setFocusedField("label")}
                                        onBlur={() => setFocusedField(null)}
                                        style={styles.textInput}
                                    />
                                </div>
                                <div style={{
                                    ...styles.fieldUnderline,
                                    transform: focusedField === "label" ? "scaleX(1)" : "scaleX(0)",
                                }} />
                            </div>

                            {/* Date Field */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.fieldLabel}>Date</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>📅</span>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        onFocus={() => setFocusedField("date")}
                                        onBlur={() => setFocusedField(null)}
                                        style={{ ...styles.textInput, colorScheme: "light" }}
                                    />
                                </div>
                                <div style={{
                                    ...styles.fieldUnderline,
                                    transform: focusedField === "date" ? "scaleX(1)" : "scaleX(0)",
                                }} />
                            </div>

                            {/* Category Selection */}
                            <div style={styles.fieldGroup}>
                                <label style={styles.fieldLabel}>Catégorie</label>
                                <div style={styles.categoriesGrid}>
                                    {CATEGORIES.filter(c => formData.type === "income" ? c.id === "income" : c.id !== "income").map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: category.id })}
                                            style={{
                                                ...styles.categoryCard,
                                                backgroundColor: formData.category === category.id ? category.bgColor : "#F9FAFB",
                                                borderColor: formData.category === category.id ? category.color : "transparent",
                                                transform: formData.category === category.id ? "scale(1.02)" : "scale(1)",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (formData.category !== category.id) {
                                                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (formData.category !== category.id) {
                                                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                                                }
                                            }}
                                        >
                                            <span style={{
                                                ...styles.categoryIcon,
                                                backgroundColor: category.color,
                                                boxShadow: formData.category === category.id ? `0 4px 12px ${category.color}40` : "none",
                                            }}>
                                                {category.icon}
                                            </span>
                                            <span style={{
                                                ...styles.categoryName,
                                                color: formData.category === category.id ? category.color : "#374151",
                                                fontWeight: formData.category === category.id ? "600" : "500",
                                            }}>
                                                {category.name}
                                            </span>
                                            {formData.category === category.id && (
                                                <div style={{
                                                    ...styles.checkMark,
                                                    backgroundColor: category.color,
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.amount || !formData.label}
                            style={{
                                ...styles.submitButton,
                                backgroundColor: formData.type === "expense" ? "#1F2937" : "#10B981",
                                opacity: isSubmitting || !formData.amount || !formData.label ? 0.6 : 1,
                                cursor: isSubmitting || !formData.amount || !formData.label ? "not-allowed" : "pointer",
                                transform: isSubmitting ? "scale(0.98)" : "scale(1)",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting && formData.amount && formData.label) {
                                    e.currentTarget.style.transform = "scale(1.02)";
                                    e.currentTarget.style.boxShadow = formData.type === "expense"
                                        ? "0 8px 24px rgba(31, 41, 55, 0.3)"
                                        : "0 8px 24px rgba(16, 185, 129, 0.3)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {isSubmitting ? (
                                <div style={styles.spinner}>
                                    <div style={styles.spinnerCircle} />
                                </div>
                            ) : (
                                <>
                                    <span style={styles.submitIcon}>
                                        {formData.type === "expense" ? "💳" : "💰"}
                                    </span>
                                    {formData.type === "expense" ? "Enregistrer la dépense" : "Enregistrer le revenu"}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div style={styles.footer}>
                    <div style={styles.footerIcon}>🔒</div>
                    <p style={styles.footerText}>
                        Vos données sont chiffrées et sécurisées.<br />
                        <span style={styles.footerSubtext}>Transaction instantanée • Historique complet</span>
                    </p>
                </div>
            </div>

            {/* CSS-in-JS Styles */}
            <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes successPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
}

// --- Styles Object ---
const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#FAFBFC",
    },
    backgroundGradient: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        opacity: 0.08,
        zIndex: 0,
    },
    contentWrapper: {
        position: "relative",
        zIndex: 1,
        maxWidth: "520px",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        animation: "slideUp 0.6s ease-out",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2rem",
    },
    backButton: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        color: "#374151",
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#1F2937",
        margin: 0,
        letterSpacing: "-0.025em",
    },
    mainCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        padding: "2rem",
        boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 8px 20px -8px rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    typeToggle: {
        display: "flex",
        gap: "0.5rem",
        backgroundColor: "#F3F4F6",
        padding: "0.375rem",
        borderRadius: "16px",
        marginBottom: "2rem",
    },
    typeButton: {
        flex: 1,
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        border: "none",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
    },
    typeButtonActive: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    typeIcon: {
        fontSize: "1rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    amountSection: {
        textAlign: "center",
        position: "relative",
        paddingBottom: "1rem",
    },
    amountLabel: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "0.75rem",
        display: "block",
    },
    amountInputWrapper: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
    },
    currencySymbol: {
        fontSize: "2rem",
        fontWeight: "600",
        color: "#9CA3AF",
        marginRight: "0.25rem",
        marginTop: "0.5rem",
    },
    amountInput: {
        fontSize: "3.5rem",
        fontWeight: "700",
        border: "none",
        outline: "none",
        textAlign: "center",
        width: "220px",
        backgroundColor: "transparent",
        fontFamily: "inherit",
        letterSpacing: "-0.02em",
        transition: "color 0.3s ease",
    },
    amountUnderline: {
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%) scaleX(0)",
        width: "120px",
        height: "3px",
        borderRadius: "2px",
        transition: "transform 0.3s ease",
    },
    quickAmounts: {
        display: "flex",
        gap: "0.75rem",
        justifyContent: "center",
        marginTop: "0.5rem",
    },
    amountChip: {
        padding: "0.5rem 1rem",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        backgroundColor: "#F9FAFB",
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#6B7280",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    fieldsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    fieldGroup: {
        position: "relative",
    },
    fieldLabel: {
        fontSize: "0.75rem",
        fontWeight: "700",
        color: "#374151",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "0.5rem",
        display: "block",
    },
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    inputIcon: {
        fontSize: "1.25rem",
        opacity: 0.7,
    },
    textInput: {
        flex: 1,
        padding: "0.875rem 0",
        border: "none",
        borderBottom: "2px solid #E5E7EB",
        fontSize: "1rem",
        outline: "none",
        backgroundColor: "transparent",
        fontFamily: "inherit",
        color: "#1F2937",
        transition: "border-color 0.2s ease",
    },
    fieldUnderline: {
        position: "absolute",
        bottom: 0,
        left: "2rem",
        right: 0,
        height: "2px",
        backgroundColor: "#6366F1",
        transform: "scaleX(0)",
        transition: "transform 0.3s ease",
        transformOrigin: "left",
    },
    categoriesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.75rem",
    },
    categoryCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem 0.5rem",
        borderRadius: "16px",
        border: "2px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
    },
    categoryIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        marginBottom: "0.5rem",
        transition: "all 0.3s ease",
    },
    categoryName: {
        fontSize: "0.75rem",
        textAlign: "center",
        transition: "all 0.2s ease",
    },
    checkMark: {
        position: "absolute",
        top: "-4px",
        right: "-4px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "successPop 0.3s ease",
    },
    submitButton: {
        marginTop: "0.5rem",
        padding: "1.125rem 1.5rem",
        border: "none",
        borderRadius: "16px",
        fontSize: "1rem",
        fontWeight: "700",
        color: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        letterSpacing: "-0.01em",
    },
    submitIcon: {
        fontSize: "1.25rem",
    },
    spinner: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    spinnerCircle: {
        width: "20px",
        height: "20px",
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "#FFFFFF",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    footer: {
        marginTop: "2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
    },
    footerIcon: {
        fontSize: "1.5rem",
        opacity: 0.6,
    },
    footerText: {
        fontSize: "0.75rem",
        color: "#9CA3AF",
        margin: 0,
        lineHeight: "1.6",
    },
    footerSubtext: {
        color: "#D1D5DB",
    },
    successOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "slideUp 0.3s ease",
    },
    successContent: {
        textAlign: "center",
    },
    successIcon: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "#10B981",
        color: "white",
        fontSize: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.5rem",
        animation: "successPop 0.5s ease",
        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    },
    successText: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#1F2937",
        margin: 0,
    },
};
