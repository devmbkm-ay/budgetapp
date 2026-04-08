"use client";

import React, { useState, useEffect } from "react";

interface BudgetAlert {
  id: string;
  category: string;
  message: string;
  type: "warning" | "critical";
  currentAmount: number;
  limitAmount: number;
  isRead: boolean;
}

interface BudgetAlertsProps {
  userEmail?: string;
}

export function BudgetAlerts({ userEmail }: BudgetAlertsProps) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/budget-alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      
      const data = await response.json();
      setAlerts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch budget alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/budget-alerts/${alertId}/mark-read`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to mark alert as read");
      
      // Remove from display
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  };

  const criticalAlerts = alerts.filter(a => a.type === "critical");
  const warningAlerts = alerts.filter(a => a.type === "warning");
  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);
  const hiddenCount = alerts.length - 3;

  if (loading) {
    return null;
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
            alert.type === "critical"
              ? "bg-red-900/20 border-red-500/50"
              : "bg-orange-900/20 border-orange-500/50"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === "critical" ? (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-sm font-semibold ${
                alert.type === "critical" ? "text-red-400" : "text-orange-400"
              }`}>
                {alert.type === "critical" ? "⚠️ Dépassé" : "⚡ Attention"}
              </span>
              <span className="text-sm text-slate-400">{alert.category}</span>
            </div>
            
            <p className={`text-sm ${
              alert.type === "critical" ? "text-red-300" : "text-orange-300"
            }`}>
              €{alert.currentAmount.toFixed(2)} / €{alert.limitAmount.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => handleMarkAsRead(alert.id)}
            className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded transition-colors ${
              alert.type === "critical"
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
            }`}
          >
            OK
          </button>
        </div>
      ))}

      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full p-2 text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          Voir les {hiddenCount} autres alertes
        </button>
      )}
    </div>
  );
}
