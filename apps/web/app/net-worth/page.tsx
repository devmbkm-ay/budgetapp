"use client";

import React, { useState, useEffect, useCallback } from "react";

interface AssetRecord {
  id: string;
  label: string;
  value: number;
  type: string;
  currency: string;
  note: string | null;
}

interface LiabilityRecord {
  id: string;
  label: string;
  balance: number;
  type: string;
  currency: string;
  note: string | null;
}

interface SnapshotRecord {
  id: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
}

interface NetWorthData {
  assets: AssetRecord[];
  liabilities: LiabilityRecord[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  history: SnapshotRecord[];
}

const ASSET_TYPES = [
  { value: "cash", label: "Épargne / Cash", emoji: "💰" },
  { value: "crypto", label: "Crypto", emoji: "₿" },
  { value: "investment", label: "Investissement", emoji: "📈" },
  { value: "property", label: "Immobilier", emoji: "🏠" },
  { value: "other", label: "Autre", emoji: "📦" },
];

const LIABILITY_TYPES = [
  { value: "loan", label: "Prêt", emoji: "🏦" },
  { value: "credit", label: "Crédit / CB", emoji: "💳" },
  { value: "mortgage", label: "Hypothèque", emoji: "🏡" },
  { value: "other", label: "Autre", emoji: "📦" },
];

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function assetEmoji(type: string) {
  return ASSET_TYPES.find((t) => t.value === type)?.emoji ?? "📦";
}

function liabilityEmoji(type: string) {
  return LIABILITY_TYPES.find((t) => t.value === type)?.emoji ?? "📦";
}

export default function NetWorthPage() {
  const [data, setData] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asset form
  const [assetForm, setAssetForm] = useState(false);
  const [assetData, setAssetData] = useState({ label: "", value: "", type: "cash", note: "" });
  const [assetSubmitting, setAssetSubmitting] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);

  // Liability form
  const [liabilityForm, setLiabilityForm] = useState(false);
  const [liabilityData, setLiabilityData] = useState({ label: "", balance: "", type: "loan", note: "" });
  const [liabilitySubmitting, setLiabilitySubmitting] = useState(false);
  const [liabilityError, setLiabilityError] = useState<string | null>(null);

  // Edit state
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingAssetValue, setEditingAssetValue] = useState("");
  const [editingLiability, setEditingLiability] = useState<string | null>(null);
  const [editingLiabilityValue, setEditingLiabilityValue] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/net-worth");
      if (!res.ok) throw new Error("Impossible de charger les données.");
      const json = await res.json() as NetWorthData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function handleAddAsset(e: React.FormEvent) {
    e.preventDefault();
    setAssetError(null);
    if (!assetData.label || !assetData.value) { setAssetError("Remplissez tous les champs requis."); return; }
    try {
      setAssetSubmitting(true);
      const res = await fetch("/api/net-worth/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: assetData.label, value: parseFloat(assetData.value), type: assetData.type, note: assetData.note || null }),
      });
      if (!res.ok) { const d = await res.json() as { error: string }; throw new Error(d.error); }
      setAssetData({ label: "", value: "", type: "cash", note: "" });
      setAssetForm(false);
      await loadData();
    } catch (err) { setAssetError(err instanceof Error ? err.message : "Erreur."); }
    finally { setAssetSubmitting(false); }
  }

  async function handleAddLiability(e: React.FormEvent) {
    e.preventDefault();
    setLiabilityError(null);
    if (!liabilityData.label || !liabilityData.balance) { setLiabilityError("Remplissez tous les champs requis."); return; }
    try {
      setLiabilitySubmitting(true);
      const res = await fetch("/api/net-worth/liabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: liabilityData.label, balance: parseFloat(liabilityData.balance), type: liabilityData.type, note: liabilityData.note || null }),
      });
      if (!res.ok) { const d = await res.json() as { error: string }; throw new Error(d.error); }
      setLiabilityData({ label: "", balance: "", type: "loan", note: "" });
      setLiabilityForm(false);
      await loadData();
    } catch (err) { setLiabilityError(err instanceof Error ? err.message : "Erreur."); }
    finally { setLiabilitySubmitting(false); }
  }

  async function handleUpdateAssetValue(id: string) {
    const value = parseFloat(editingAssetValue);
    if (isNaN(value)) return;
    await fetch(`/api/net-worth/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setEditingAsset(null);
    await loadData();
  }

  async function handleUpdateLiabilityBalance(id: string) {
    const balance = parseFloat(editingLiabilityValue);
    if (isNaN(balance)) return;
    await fetch(`/api/net-worth/liabilities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance }),
    });
    setEditingLiability(null);
    await loadData();
  }

  async function handleDeleteAsset(id: string) {
    await fetch(`/api/net-worth/assets/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleDeleteLiability(id: string) {
    await fetch(`/api/net-worth/liabilities/${id}`, { method: "DELETE" });
    await loadData();
  }

  // History chart
  const historyMax = data ? Math.max(...data.history.map((s) => Math.abs(s.netWorth)), 1) : 1;

  const netWorthColor = !data ? "#64d2ff"
    : data.netWorth > 0 ? "#7ff0b6"
    : data.netWorth < 0 ? "#ff8e87"
    : "#64d2ff";

  return (
    <main style={s.page}>
      <div style={s.ambientGreen} />
      <div style={s.ambientBlue} />

      <div style={s.shell}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>Santé financière</p>
            <h1 style={s.title}>Patrimoine Net</h1>
            <p style={s.subtitle}>Actifs moins passifs — votre vraie valeur financière.</p>
          </div>
        </header>

        {loading ? (
          <div style={s.statePanel}>
            <div style={s.skeleton} /><div style={{ ...s.skeleton, width: "70%", marginTop: 12 }} />
          </div>
        ) : error ? (
          <div style={s.errorPanel}><strong>Erreur</strong><p style={{ margin: 0 }}>{error}</p></div>
        ) : data && (
          <>
            {/* Big net worth number */}
            <section style={s.heroCard}>
              <div style={s.heroHalo} />
              <p style={s.heroLabel}>Patrimoine net</p>
              <h2 style={{ ...s.heroValue, color: netWorthColor }}>{eur(data.netWorth)}</h2>
              <div style={s.heroSplit}>
                <div>
                  <p style={s.splitLabel}>Actifs</p>
                  <p style={{ ...s.splitValue, color: "#7ff0b6" }}>{eur(data.totalAssets)}</p>
                </div>
                <div style={s.splitDivider} />
                <div>
                  <p style={s.splitLabel}>Passifs</p>
                  <p style={{ ...s.splitValue, color: "#ff8e87" }}>{eur(data.totalLiabilities)}</p>
                </div>
                {data.totalAssets > 0 && (
                  <>
                    <div style={s.splitDivider} />
                    <div>
                      <p style={s.splitLabel}>Ratio actifs/passifs</p>
                      <p style={{ ...s.splitValue, color: "#64d2ff" }}>
                        {data.totalLiabilities > 0
                          ? `${((data.totalAssets / data.totalLiabilities) * 100).toFixed(0)}%`
                          : "∞"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Balance bar */}
              {(data.totalAssets > 0 || data.totalLiabilities > 0) && (
                <div style={s.balanceBarTrack}>
                  <div
                    style={{
                      ...s.balanceBarFill,
                      width: `${data.totalAssets + data.totalLiabilities > 0
                        ? (data.totalAssets / (data.totalAssets + data.totalLiabilities)) * 100
                        : 50}%`,
                    }}
                  />
                </div>
              )}
            </section>

            {/* Assets + Liabilities columns */}
            <div style={s.columns}>
              {/* Assets */}
              <section style={s.panel}>
                <div style={s.panelHeader}>
                  <div>
                    <h2 style={s.panelTitle}>Actifs</h2>
                    <p style={{ ...s.panelTotal, color: "#7ff0b6" }}>{eur(data.totalAssets)}</p>
                  </div>
                  {!assetForm && (
                    <button type="button" onClick={() => setAssetForm(true)} style={s.addBtn}>+ Ajouter</button>
                  )}
                </div>

                {assetForm && (
                  <form onSubmit={handleAddAsset} style={s.inlineForm}>
                    <input
                      placeholder="Label (ex: Livret A)"
                      value={assetData.label}
                      onChange={(e) => setAssetData({ ...assetData, label: e.target.value })}
                      style={s.input}
                    />
                    <div style={s.formRow}>
                      <input
                        type="number" step="0.01" placeholder="Valeur €"
                        value={assetData.value}
                        onChange={(e) => setAssetData({ ...assetData, value: e.target.value })}
                        style={{ ...s.input, flex: 1 }}
                      />
                      <select
                        value={assetData.type}
                        onChange={(e) => setAssetData({ ...assetData, type: e.target.value })}
                        style={{ ...s.select, flex: 1 }}
                      >
                        {ASSET_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    {assetError && <p style={s.inlineError}>{assetError}</p>}
                    <div style={s.formActions}>
                      <button type="submit" disabled={assetSubmitting} style={s.submitGreen}>
                        {assetSubmitting ? "…" : "Ajouter"}
                      </button>
                      <button type="button" onClick={() => { setAssetForm(false); setAssetError(null); }} style={s.cancelBtn}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                {data.assets.length === 0 && !assetForm ? (
                  <p style={s.empty}>Aucun actif enregistré.</p>
                ) : (
                  <div style={s.itemList}>
                    {data.assets.map((a) => (
                      <div key={a.id} style={s.item}>
                        <span style={s.itemEmoji}>{assetEmoji(a.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.itemLabel}>{a.label}</p>
                          {editingAsset === a.id ? (
                            <div style={s.editRow}>
                              <input
                                type="number" step="0.01"
                                value={editingAssetValue}
                                onChange={(e) => setEditingAssetValue(e.target.value)}
                                style={{ ...s.input, padding: "6px 10px", fontSize: "0.9rem" }}
                                autoFocus
                              />
                              <button type="button" onClick={() => void handleUpdateAssetValue(a.id)} style={s.saveBtn}>✓</button>
                              <button type="button" onClick={() => setEditingAsset(null)} style={s.cancelSmall}>✕</button>
                            </div>
                          ) : (
                            <p
                              style={s.itemValue}
                              onClick={() => { setEditingAsset(a.id); setEditingAssetValue(String(a.value)); }}
                              title="Cliquer pour modifier"
                            >
                              {eur(a.value)}
                            </p>
                          )}
                        </div>
                        <button type="button" onClick={() => void handleDeleteAsset(a.id)} style={s.deleteBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Liabilities */}
              <section style={s.panel}>
                <div style={s.panelHeader}>
                  <div>
                    <h2 style={s.panelTitle}>Passifs</h2>
                    <p style={{ ...s.panelTotal, color: "#ff8e87" }}>{eur(data.totalLiabilities)}</p>
                  </div>
                  {!liabilityForm && (
                    <button type="button" onClick={() => setLiabilityForm(true)} style={s.addBtnRed}>+ Ajouter</button>
                  )}
                </div>

                {liabilityForm && (
                  <form onSubmit={handleAddLiability} style={s.inlineForm}>
                    <input
                      placeholder="Label (ex: Prêt auto)"
                      value={liabilityData.label}
                      onChange={(e) => setLiabilityData({ ...liabilityData, label: e.target.value })}
                      style={s.input}
                    />
                    <div style={s.formRow}>
                      <input
                        type="number" step="0.01" placeholder="Solde €"
                        value={liabilityData.balance}
                        onChange={(e) => setLiabilityData({ ...liabilityData, balance: e.target.value })}
                        style={{ ...s.input, flex: 1 }}
                      />
                      <select
                        value={liabilityData.type}
                        onChange={(e) => setLiabilityData({ ...liabilityData, type: e.target.value })}
                        style={{ ...s.select, flex: 1 }}
                      >
                        {LIABILITY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    {liabilityError && <p style={s.inlineError}>{liabilityError}</p>}
                    <div style={s.formActions}>
                      <button type="submit" disabled={liabilitySubmitting} style={s.submitRed}>
                        {liabilitySubmitting ? "…" : "Ajouter"}
                      </button>
                      <button type="button" onClick={() => { setLiabilityForm(false); setLiabilityError(null); }} style={s.cancelBtn}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                {data.liabilities.length === 0 && !liabilityForm ? (
                  <p style={s.empty}>Aucun passif enregistré.</p>
                ) : (
                  <div style={s.itemList}>
                    {data.liabilities.map((l) => (
                      <div key={l.id} style={s.item}>
                        <span style={s.itemEmoji}>{liabilityEmoji(l.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.itemLabel}>{l.label}</p>
                          {editingLiability === l.id ? (
                            <div style={s.editRow}>
                              <input
                                type="number" step="0.01"
                                value={editingLiabilityValue}
                                onChange={(e) => setEditingLiabilityValue(e.target.value)}
                                style={{ ...s.input, padding: "6px 10px", fontSize: "0.9rem" }}
                                autoFocus
                              />
                              <button type="button" onClick={() => void handleUpdateLiabilityBalance(l.id)} style={s.saveBtn}>✓</button>
                              <button type="button" onClick={() => setEditingLiability(null)} style={s.cancelSmall}>✕</button>
                            </div>
                          ) : (
                            <p
                              style={{ ...s.itemValue, color: "#ff8e87" }}
                              onClick={() => { setEditingLiability(l.id); setEditingLiabilityValue(String(l.balance)); }}
                              title="Cliquer pour modifier"
                            >
                              {eur(l.balance)}
                            </p>
                          )}
                        </div>
                        <button type="button" onClick={() => void handleDeleteLiability(l.id)} style={s.deleteBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* History chart */}
            {data.history.length > 1 && (
              <section style={s.historySection}>
                <h2 style={s.historyTitle}>Évolution du patrimoine</h2>
                <div style={s.chartArea}>
                  {data.history.map((snap, i) => {
                    const barH = Math.max(4, (Math.abs(snap.netWorth) / historyMax) * 120);
                    const color = snap.netWorth >= 0 ? "#7ff0b6" : "#ff8e87";
                    const date = new Date(snap.createdAt);
                    const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                    return (
                      <div key={snap.id} style={s.chartBar} title={`${label}: ${eur(snap.netWorth)}`}>
                        <p style={{ ...s.barValue, color }}>{snap.netWorth >= 0 ? "+" : ""}{Math.round(snap.netWorth / 1000) !== 0 ? `${(snap.netWorth / 1000).toFixed(1)}k` : eur(snap.netWorth)}</p>
                        <div style={{ ...s.bar, height: barH, background: color }} />
                        <p style={s.barDate}>{i === 0 || i === data.history.length - 1 ? label : ""}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #081120 0%, #0a1a20 42%, #0d1a2a 100%)",
    color: "#f6fbff",
    overflowX: "hidden",
    paddingBottom: 100,
  },
  ambientGreen: {
    position: "fixed",
    top: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(127,240,182,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ambientBlue: {
    position: "fixed",
    bottom: "-80px",
    left: "-80px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,132,255,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    maxWidth: "860px",
    margin: "0 auto",
    padding: "32px 20px",
  },
  header: { marginBottom: 28 },
  eyebrow: {
    margin: 0,
    color: "rgba(208,224,255,0.68)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "0.74rem",
  },
  title: {
    margin: "8px 0 10px",
    fontSize: "clamp(2.4rem, 6vw, 4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: 0,
    color: "rgba(227,236,255,0.74)",
    lineHeight: 1.6,
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: "28px 28px 22px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 22px 60px rgba(4,10,22,0.28)",
    marginBottom: 24,
  },
  heroHalo: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(127,240,182,0.14) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroLabel: {
    margin: "0 0 8px",
    color: "rgba(208,224,255,0.68)",
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroValue: {
    margin: "0 0 20px",
    fontSize: "clamp(2.6rem, 7vw, 4.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    fontWeight: 800,
  },
  heroSplit: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 20,
  },
  splitLabel: {
    margin: "0 0 4px",
    fontSize: "0.72rem",
    color: "rgba(208,224,255,0.55)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  splitValue: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: 700,
    letterSpacing: "-0.04em",
  },
  splitDivider: {
    width: 1,
    height: 40,
    background: "rgba(255,255,255,0.12)",
  },
  balanceBarTrack: {
    height: 6,
    borderRadius: 999,
    background: "rgba(255,142,135,0.3)",
    overflow: "hidden",
  },
  balanceBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #7ff0b6, #64d2ff)",
    transition: "width 0.5s ease",
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  panel: {
    borderRadius: 24,
    padding: "20px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  panelTitle: {
    margin: "0 0 4px",
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  panelTotal: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  addBtn: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(127,240,182,0.12)",
    border: "1px solid rgba(127,240,182,0.3)",
    color: "#7ff0b6",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  addBtnRed: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,142,135,0.12)",
    border: "1px solid rgba(255,142,135,0.3)",
    color: "#ff8e87",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  inlineForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 16,
    padding: "14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
  },
  formRow: { display: "flex", gap: 8 },
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#f6fbff",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#f6fbff",
    fontSize: "0.95rem",
    outline: "none",
  },
  formActions: { display: "flex", gap: 8 },
  submitGreen: {
    padding: "9px 16px",
    borderRadius: "999px",
    background: "rgba(127,240,182,0.18)",
    border: "1px solid rgba(127,240,182,0.35)",
    color: "#7ff0b6",
    fontWeight: 700,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  submitRed: {
    padding: "9px 16px",
    borderRadius: "999px",
    background: "rgba(255,142,135,0.18)",
    border: "1px solid rgba(255,142,135,0.35)",
    color: "#ff8e87",
    fontWeight: 700,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "9px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(227,236,255,0.7)",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  inlineError: { margin: 0, color: "#ff8e87", fontSize: "0.82rem" },
  itemList: { display: "flex", flexDirection: "column", gap: 8 },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  itemEmoji: { fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 },
  itemLabel: { margin: "0 0 2px", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemValue: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#7ff0b6",
    letterSpacing: "-0.02em",
    cursor: "pointer",
  },
  editRow: { display: "flex", alignItems: "center", gap: 6 },
  saveBtn: {
    padding: "4px 10px",
    borderRadius: 8,
    background: "rgba(127,240,182,0.15)",
    border: "1px solid rgba(127,240,182,0.3)",
    color: "#7ff0b6",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  cancelSmall: {
    padding: "4px 8px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(227,236,255,0.6)",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,142,135,0.45)",
    fontSize: "0.8rem",
    cursor: "pointer",
    padding: "4px",
    flexShrink: 0,
  },
  empty: {
    margin: 0,
    color: "rgba(208,224,255,0.45)",
    fontSize: "0.88rem",
    fontStyle: "italic",
    padding: "8px 0",
  },
  historySection: {
    borderRadius: 24,
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  historyTitle: {
    margin: "0 0 20px",
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  chartArea: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    height: 160,
    paddingBottom: 24,
  },
  chartBar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    cursor: "default",
  },
  bar: {
    width: "100%",
    borderRadius: "6px 6px 0 0",
    minHeight: 4,
    transition: "height 0.4s ease",
  },
  barValue: {
    fontSize: "0.6rem",
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
    letterSpacing: "-0.02em",
  },
  barDate: {
    fontSize: "0.6rem",
    color: "rgba(208,224,255,0.45)",
    margin: 0,
    textAlign: "center",
    position: "absolute" as const,
    bottom: 0,
  },
  statePanel: {
    borderRadius: 22,
    padding: 28,
    background: "rgba(8,14,29,0.36)",
    color: "rgba(227,236,255,0.82)",
  },
  skeleton: {
    height: 16,
    width: "100%",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
  },
  errorPanel: {
    display: "grid",
    gap: 6,
    borderRadius: 22,
    padding: 20,
    background: "rgba(119,24,31,0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffe8ea",
  },
};
