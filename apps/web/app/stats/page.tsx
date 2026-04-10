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

  const balance = totalIncome - totalExpense;
  
  // Forecasting: Simple average daily burn rate
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - daysPassed;
  
  const dailyBurn = totalExpense / daysPassed;
  const forecastExpense = totalExpense + (dailyBurn * remainingDays);
  const forecastBalance = totalIncome - forecastExpense;

  if (loading) return <div style={styles.loading}>Analyse des flux...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Intelligence Financière</h1>
        <p style={styles.subtitle}>Prévisions & Analyse du mois</p>
      </div>

      <div style={styles.grid}>
        {/* Burn Rate Card */}
        <div style={{ ...styles.card, borderColor: "#FF453A" }}>
          <p style={styles.cardLabel}>BURN RATE QUOTIDIEN</p>
          <h2 style={{ ...styles.cardValue, color: "#FF453A" }}>{dailyBurn.toFixed(2)} €</h2>
          <p style={styles.cardInfo}>Basé sur {daysPassed} jours écoulés</p>
        </div>

        {/* Forecast Card */}
        <div style={{ ...styles.card, borderColor: "#32D74B" }}>
          <p style={styles.cardLabel}>ESTIMATION FIN DE MOIS</p>
          <h2 style={{ ...styles.cardValue, color: forecastBalance >= 0 ? "#32D74B" : "#FF453A" }}>
            {forecastBalance.toFixed(2)} €
          </h2>
          <p style={styles.cardInfo}>Dépenses prévues: {forecastExpense.toFixed(0)} €</p>
        </div>
      </div>

      <div style={styles.fullCard}>
        <p style={styles.cardLabel}>SANTÉ DU BUDGET</p>
        <div style={styles.progressBarBg}>
          <div 
            style={{ 
              ...styles.progressBarFill, 
              width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%`,
              background: totalExpense > totalIncome ? "#FF453A" : "linear-gradient(90deg, #32D74B, #64D2FF)"
            }} 
          />
        </div>
        <p style={styles.cardInfo}>Vous avez consommé {((totalExpense / totalIncome) * 100).toFixed(1)}% de vos revenus.</p>
      </div>

      <button onClick={() => window.history.back()} style={styles.backButton}>
        Retour
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#08101e",
    color: "#fff",
    padding: "40px 20px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: { marginBottom: "40px" },
  title: { fontSize: "1.8rem", fontWeight: 800, margin: 0 },
  subtitle: { color: "rgba(255,255,255,0.6)", marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  fullCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "40px",
  },
  cardLabel: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", opacity: 0.6, marginBottom: "12px" },
  cardValue: { fontSize: "1.4rem", fontWeight: 800, margin: 0 },
  cardInfo: { fontSize: "0.8rem", opacity: 0.5, marginTop: "8px" },
  progressBarBg: { height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden", marginTop: "16px" },
  progressBarFill: { height: "100%", borderRadius: "6px", transition: "width 1s ease-out" },
  loading: { display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#08101e", color: "#64D2FF" },
  backButton: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "12px 24px", borderRadius: "12px", cursor: "pointer" }
};
