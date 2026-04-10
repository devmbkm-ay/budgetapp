"use client";

import React, { useEffect, useState, type CSSProperties } from "react";

interface Transaction {
  id: string;
  amount: number;
  type: "expense" | "income";
  date: string;
  category: string | null;
}

export default function StatsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Forecasting: Simple average daily burn rate
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - daysPassed;
  
  const dailyBurn = totalExpense / daysPassed;
  const forecastExpense = totalExpense + (dailyBurn * remainingDays);
  const forecastBalance = totalIncome - forecastExpense;

  if (loading) return (
    <div style={styles.loading}>
        <div style={styles.spinner} />
        Analyse des flux...
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.orb} />
      
      <header style={styles.header}>
        <div style={styles.eyebrow}>PREDICTIONS 2026</div>
        <h1 style={styles.title}>Intelligence Financière</h1>
        <p style={styles.subtitle}>Analyse prédictive de vos comportements</p>
      </header>

      <div style={styles.grid}>
        {/* Burn Rate Card */}
        <div style={{ ...styles.card, borderLeft: "4px solid #FF453A" }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🔥</span>
            <p style={styles.cardLabel}>BURN RATE</p>
          </div>
          <h2 style={{ ...styles.cardValue, color: "#FF453A", textShadow: "0 0 15px rgba(255, 69, 58, 0.4)" }}>
            {dailyBurn.toFixed(2)} € <span style={styles.unit}>/ jour</span>
          </h2>
          <p style={styles.cardInfo}>Consommé sur {daysPassed} jours</p>
        </div>

        {/* Forecast Card */}
        <div style={{ ...styles.card, borderLeft: "4px solid #32D74B" }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🎯</span>
            <p style={styles.cardLabel}>FIN DE MOIS</p>
          </div>
          <h2 style={{ ...styles.cardValue, color: forecastBalance >= 0 ? "#32D74B" : "#FF453A", textShadow: forecastBalance >= 0 ? "0 0 15px rgba(50, 215, 75, 0.4)" : "0 0 15px rgba(255, 69, 58, 0.4)" }}>
            {forecastBalance.toFixed(2)} €
          </h2>
          <p style={styles.cardInfo}>Basé sur vos revenus actuels</p>
        </div>
      </div>

      <div style={styles.fullCard}>
        <div style={styles.cardHeader}>
            <p style={styles.cardLabel}>CAPACITÉ DE SURVIE DU BUDGET</p>
        </div>
        <div style={styles.progressBarBg}>
          <div 
            style={{ 
              ...styles.progressBarFill, 
              width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%`,
              background: totalExpense > totalIncome 
                ? "linear-gradient(90deg, #FF453A, #ff8e87)" 
                : "linear-gradient(90deg, #32D74B, #64D2FF)",
              boxShadow: totalExpense > totalIncome 
                ? "0 0 15px rgba(255, 69, 58, 0.6)" 
                : "0 0 15px rgba(100, 210, 255, 0.6)"
            }} 
          />
        </div>
        <div style={styles.progressFooter}>
            <p style={styles.cardInfo}>Consommation : {((totalExpense / totalIncome) * 100).toFixed(1)}%</p>
            <p style={styles.cardInfo}>{forecastExpense.toFixed(0)}€ projetés</p>
        </div>
      </div>

      <button onClick={() => window.history.back()} style={styles.backButton}>
        ← Retourner aux transactions
      </button>

      <style>{`
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top right, #1a1a2e, #08101e)",
    color: "#fff",
    padding: "40px 20px 120px",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    top: "10%",
    right: "-10%",
    width: "300px",
    height: "300px",
    background: "rgba(100, 210, 255, 0.15)",
    filter: "blur(80px)",
    borderRadius: "50%",
    animation: "pulse 8s infinite ease-in-out",
  },
  header: { marginBottom: "40px", position: "relative" },
  eyebrow: { fontSize: "0.7rem", fontWeight: 800, letterSpacing: "3px", color: "#64d2ff", marginBottom: "8px" },
  title: { fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  subtitle: { color: "rgba(255,255,255,0.5)", marginTop: "6px", fontSize: "0.9rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "20px",
    backdropFilter: "blur(20px)",
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  cardIcon: { fontSize: "1.2rem" },
  fullCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px",
    marginBottom: "40px",
    backdropFilter: "blur(20px)",
  },
  cardLabel: { fontSize: "0.65rem", fontWeight: 900, letterSpacing: "1.5px", opacity: 0.8, margin: 0 },
  cardValue: { fontSize: "1.5rem", fontWeight: 900, margin: 0, display: "flex", alignItems: "baseline", gap: "4px" },
  unit: { fontSize: "0.8rem", opacity: 0.5, fontWeight: 400 },
  cardInfo: { fontSize: "0.75rem", opacity: 0.4, marginTop: "8px", fontWeight: 500 },
  progressBarBg: { height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden", marginTop: "12px" },
  progressBarFill: { height: "100%", borderRadius: "4px", transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" },
  progressFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  loading: { display: "flex", flexDirection: "column", gap: "20px", height: "100vh", alignItems: "center", justifyContent: "center", background: "#08101e", color: "#64D2FF" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(100, 210, 255, 0.1)", borderTop: "3px solid #64d2ff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  backButton: { 
    background: "rgba(255,255,255,0.05)", 
    border: "1px solid rgba(255,255,255,0.1)", 
    color: "rgba(255,255,255,0.7)", 
    padding: "16px 24px", 
    borderRadius: "16px", 
    cursor: "pointer", 
    width: "100%", 
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "all 0.2s ease"
  }
};
