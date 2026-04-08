"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BudgetGoal {
  id: string;
  category: string;
  limitAmount: number;
  period: "monthly" | "weekly" | "yearly";
}

interface BudgetGoalWithSpent extends BudgetGoal {
  spent: number;
  percentUsed: number;
}

const CATEGORIES = [
  "Alimentaire",
  "Restaurants",
  "Cafés & Bars",
  "Transport",
  "Vêtements",
  "Électronique",
  "Divertissement",
  "Loisirs & Sports",
  "Santé",
  "Éducation",
  "Logement",
  "Utilitaires",
];

const PERIODS = [
  { value: "weekly", label: "Par semaine" },
  { value: "monthly", label: "Par mois" },
  { value: "yearly", label: "Par année" },
] as const;

export default function BudgetGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<BudgetGoalWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: "",
    limitAmount: "",
    period: "monthly" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/budget-goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      
      const data = await response.json();
      setGoals(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching goals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limitAmount) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/budget-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          limitAmount: parseFloat(formData.limitAmount),
          period: formData.period,
        }),
      });

      if (!response.ok) throw new Error("Failed to create goal");
      
      // Reset form and refetch
      setFormData({ category: "", limitAmount: "", period: "monthly" });
      setIsFormOpen(false);
      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce budget ?")) return;

    try {
      const response = await fetch(`/api/budget-goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");
      
      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting goal");
    }
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return "bg-red-500";
    if (percentUsed >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStatusLabel = (percentUsed: number) => {
    if (percentUsed >= 100) return "Dépassé";
    if (percentUsed >= 80) return "Attention";
    return "OK";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            💰 Budgets
          </h1>
          <p className="text-slate-400">Gérez vos limites de dépenses par catégorie</p>
        </div>

        {/* Add Goal Button */}
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            + Ajouter un budget
          </button>
        )}

        {/* Create Goal Form */}
        {isFormOpen && (
          <div className="mb-6 p-6 bg-slate-800 border border-purple-500/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-4">Créer un nouveau budget</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Limit Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Limite (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.limitAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, limitAmount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Période
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period: e.target.value as typeof formData.period,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    {PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Création..." : "Créer le budget"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormData({ category: "", limitAmount: "", period: "monthly" });
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Chargement des budgets...</div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-600 rounded-lg">
            <div className="text-slate-400">Aucun budget créé</div>
            <p className="text-slate-500 text-sm mt-1">Établissez vos premiers budgets pour commencer à contrôler vos dépenses</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-5 bg-gradient-to-r from-slate-800 to-slate-700/50 border border-purple-500/20 rounded-xl backdrop-blur-sm hover:border-purple-500/40 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.category}</h3>
                    <p className="text-sm text-slate-400">
                      {PERIODS.find(p => p.value === goal.period)?.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      €{goal.spent.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400">
                      / €{goal.limitAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">Utilisation</span>
                    <span className={`text-sm font-semibold ${
                      goal.percentUsed >= 100 ? 'text-red-400' :
                      goal.percentUsed >= 80 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {goal.percentUsed.toFixed(0)}% - {getStatusLabel(goal.percentUsed)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(goal.percentUsed)} transition-all duration-300`}
                      style={{ width: `${Math.min(goal.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Supprimer ce budget
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
