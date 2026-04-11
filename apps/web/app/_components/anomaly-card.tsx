"use client";

import { useEffect, useState } from "react";

interface Anomaly {
  id: string;
  type: "unusual_amount" | "category_spike" | "large_transaction";
  severity: "warning" | "alert";
  message: string;
  detail: string;
  amount?: number;
  category?: string;
  transactionId?: string;
  transactionLabel?: string;
}

const TYPE_META: Record<Anomaly["type"], { icon: string; label: string }> = {
  unusual_amount: { icon: "📊", label: "Montant inhabituel" },
  category_spike: { icon: "📈", label: "Hausse catégorie" },
  large_transaction: { icon: "💥", label: "Dépense exceptionnelle" },
};

export function AnomalyCard() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/anomalies")
      .then((r) => r.json())
      .then((data: { anomalies?: Anomaly[] }) => {
        if (mounted) setAnomalies(data.anomalies ?? []);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const visible = anomalies.filter((a) => !dismissed.has(a.id));
  const shown = expanded ? visible : visible.slice(0, 3);
  const hiddenCount = visible.length - 3;

  if (loading || visible.length === 0) return null;

  const alertCount = visible.filter((a) => a.severity === "alert").length;

  return (
    <div style={s.shell}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.radarIcon}>🔬</span>
          <div>
            <div style={s.title}>Détection d'anomalies</div>
            <div style={s.subtitle}>
              {alertCount > 0
                ? `${alertCount} alerte${alertCount > 1 ? "s" : ""} critique${alertCount > 1 ? "s" : ""} · ${visible.length} signaux`
                : `${visible.length} signal${visible.length > 1 ? "s" : ""} détecté${visible.length > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>
        <span
          style={{
            ...s.badge,
            background: alertCount > 0 ? "rgba(255,69,58,0.18)" : "rgba(255,159,10,0.15)",
            borderColor: alertCount > 0 ? "rgba(255,69,58,0.40)" : "rgba(255,159,10,0.35)",
            color: alertCount > 0 ? "#ff8e87" : "#ffb340",
          }}
        >
          {alertCount > 0 ? "⚠️ Critique" : "⚡ Attention"}
        </span>
      </div>

      {/* Anomaly list */}
      <div style={s.list}>
        {shown.map((anomaly) => {
          const isAlert = anomaly.severity === "alert";
          const meta = TYPE_META[anomaly.type];
          return (
            <div
              key={anomaly.id}
              style={{
                ...s.item,
                borderColor: isAlert
                  ? "rgba(255,69,58,0.25)"
                  : "rgba(255,159,10,0.20)",
                background: isAlert
                  ? "rgba(255,69,58,0.08)"
                  : "rgba(255,159,10,0.06)",
              }}
            >
              <div style={s.itemIcon}>{meta.icon}</div>
              <div style={s.itemBody}>
                <div style={s.itemTop}>
                  <span
                    style={{
                      ...s.itemSeverity,
                      color: isAlert ? "#ff8e87" : "#ffb340",
                    }}
                  >
                    {anomaly.message}
                  </span>
                </div>
                <div style={s.itemDetail}>{anomaly.detail}</div>
              </div>
              <button
                type="button"
                style={s.dismissBtn}
                onClick={() => setDismissed((prev) => new Set([...prev, anomaly.id]))}
                aria-label="Ignorer cette anomalie"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Expand / collapse */}
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          style={s.expandBtn}
          onClick={() => setExpanded(true)}
        >
          Voir {hiddenCount} autre{hiddenCount > 1 ? "s" : ""} signal{hiddenCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    borderRadius: "24px",
    padding: "18px",
    background: "rgba(30, 14, 8, 0.55)",
    border: "1px solid rgba(255, 159, 10, 0.22)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  radarIcon: {
    fontSize: "1.3rem",
    userSelect: "none",
  },
  title: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#f6fbff",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "rgba(208,224,255,0.50)",
    marginTop: "2px",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "5px 10px",
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "16px",
    borderWidth: "1px",
    borderStyle: "solid",
  },
  itemIcon: {
    fontSize: "1.1rem",
    flexShrink: 0,
    marginTop: "1px",
    userSelect: "none",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "3px",
  },
  itemSeverity: {
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  itemDetail: {
    fontSize: "0.78rem",
    color: "rgba(208,224,255,0.55)",
    lineHeight: 1.4,
  },
  dismissBtn: {
    background: "none",
    border: "none",
    color: "rgba(208,224,255,0.30)",
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: "2px 4px",
    flexShrink: 0,
    fontFamily: "inherit",
    transition: "color 0.15s ease",
  },
  expandBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "9px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(208,224,255,0.55)",
    fontSize: "0.80rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
};
