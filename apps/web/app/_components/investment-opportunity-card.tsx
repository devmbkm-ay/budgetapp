"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/transactions";

interface InvestmentData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

interface SimulationData {
  investmentAmount: number;
  btcPriceAtSimulation: number;
  simulatedBtc: string;
  simulatedSatoshis: number;
  message: string;
}

export function InvestmentOpportunityCard({ balance }: { balance: number }) {
  const [market, setMarket] = useState<InvestmentData | null>(null);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await fetch("/api/investment");
        const data = await response.json();
        setMarket(data);
      } catch (err) {
        console.error("Failed to fetch BTC price", err);
      }
    };

    fetchMarket();
  }, []);

  useEffect(() => {
    if (market && balance > 0) {
      const runSimulation = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/investment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ savings: balance, btcPrice: market.price }),
          });
          const data = await response.json();
          setSimulation(data);
        } catch (err) {
          console.error("Simulation failed", err);
        } finally {
          setIsLoading(false);
        }
      };
      runSimulation();
    }
  }, [market, balance]);

  if (balance <= 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>₿</span>
        <h3 style={styles.title}>Opportunité d&apos;Investissement</h3>
      </div>
      
      {isLoading ? (
        <p style={styles.loading}>Calcul de ton potentiel...</p>
      ) : simulation ? (
        <div style={styles.body}>
          <p style={styles.highlight}>
            Ton surplus de <span style={styles.accent}>{formatCurrency(balance, "EUR")}</span> pourrait devenir :
          </p>
          <div style={styles.resultBox}>
            <span style={styles.satsValue}>
              {simulation.simulatedSatoshis ? simulation.simulatedSatoshis.toLocaleString() : '0'}
            </span>
            <span style={styles.satsLabel}> Satoshis</span>
          </div>
          <p style={styles.meta}>
            Cours actuel : {formatCurrency(simulation.btcPriceAtSimulation, "EUR")} / BTC
          </p>
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(247, 147, 26, 0.15), rgba(255, 255, 255, 0.05))",
    border: "1px solid rgba(247, 147, 26, 0.3)",
    backdropFilter: "blur(12px)",
    marginTop: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  icon: {
    fontSize: "1.4rem",
    color: "#F7931A",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f6fbff",
  },
  loading: {
    margin: 0,
    fontSize: "0.95rem",
    color: "rgba(227, 236, 255, 0.6)",
  },
  body: {
    display: "grid",
    gap: "12px",
  },
  highlight: {
    margin: 0,
    fontSize: "0.95rem",
    color: "rgba(227, 236, 255, 0.8)",
  },
  accent: {
    color: "#7ff0b6",
    fontWeight: 700,
  },
  resultBox: {
    padding: "12px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "14px",
    textAlign: "center",
    border: "1px solid rgba(247, 147, 26, 0.2)",
  },
  satsValue: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#F7931A",
    letterSpacing: "0.05em",
  },
  satsLabel: {
    fontSize: "0.9rem",
    color: "rgba(247, 147, 26, 0.8)",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  meta: {
    margin: 0,
    fontSize: "0.8rem",
    color: "rgba(208, 224, 255, 0.5)",
    textAlign: "right",
  }
};
