"use client";

import { useState } from "react";

export default function AddTransactionPage() {
  const [formData, setFormData] = useState({
    label: "",
    amount: "",
    category: "Alimentation",
    userId: "ricardo@test.com",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Données à envoyer :", formData);
    alert("Prochaine étape : Connecter cette interface à l'API !");
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F6F6F6", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "1rem"
    }}>
      {/* Header Style Uber/Fintech */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <button onClick={() => window.history.back()} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>←</button>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600", marginLeft: "1rem", margin: "0" }}>Nouvelle transaction</h1>
        </div>

        {/* Card Principal */}
        <div style={{ 
          backgroundColor: "#FFFFFF", 
          borderRadius: "16px", 
          padding: "1.5rem", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Montant - Focus Style */}
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6B6B6B", display: "block", marginBottom: "0.5rem" }}>Montant</span>
              <div style={{ position: "relative", display: "inline-block" }}>
                <span style={{ position: "absolute", left: "-1.5rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.5rem", fontWeight: "600" }}>€</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: "700", 
                    border: "none", 
                    outline: "none", 
                    textAlign: "center",
                    width: "200px",
                    color: "#000"
                  }}
                />
              </div>
            </div>

            {/* Champs de saisie épurés */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Libellé</label>
                <input
                  type="text"
                  required
                  placeholder="Où avez-vous dépensé ?"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem 0", 
                    border: "none", 
                    borderBottom: "1px solid #E5E5E5", 
                    fontSize: "1rem",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem 0", 
                    border: "none", 
                    borderBottom: "1px solid #E5E5E5", 
                    fontSize: "1rem",
                    backgroundColor: "transparent",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  <option value="Alimentation">🛒 Alimentation</option>
                  <option value="Loisirs">🎭 Loisirs</option>
                  <option value="Logement">🏠 Logement</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Santé">💊 Santé</option>
                  <option value="Revenu">💰 Revenu</option>
                </select>
              </div>
            </div>

            {/* Bouton style Uber (Noir, bords arrondis, pleine largeur) */}
            <button
              type="submit"
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#333333")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000000")}
            >
              Enregistrer la dépense
            </button>
          </form>
        </div>

        {/* Footer info style Fintech */}
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#A0A0A0", marginTop: "1.5rem" }}>
          La transaction sera instantanément ajoutée à votre budget.
        </p>
      </div>
    </div>
  );
}
