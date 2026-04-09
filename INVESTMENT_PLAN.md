# Plan de Développement : Hub Investissement & Simulateur (BudgetApp)

Ce plan vise à intégrer le simulateur d'investissement sans impacter les fonctionnalités existantes de gestion budgétaire.

## 1. Extension de la Base de Données (Non-destructif)
Ajout d'un modèle `InvestmentProfile` pour stocker les préférences sans toucher aux tables `Transaction` ou `User` existantes.
*   `btcAddress`: (Optionnel) Pour un suivi réel plus tard.
*   `riskTolerance`: Niveau de risque pour les conseils de l'IA.
*   `autoInvestThreshold`: Pourcentage des économies à simuler en investissement.

## 2. Service "Investment Intelligence" (Nouveau Package)
Création de `packages/investment-intelligence` :
*   **Price Engine :** Fetch du prix du BTC (API publique gratuite type CoinGecko).
*   **Simulator Logic :** Fonction qui prend (Revenus - Dépenses) et calcule le nombre de Satoshis cumulables.
*   **DCA Calculator :** Simulation historique ("Si tu avais investi tes économies des 6 derniers mois...").

## 3. Nouveaux Endpoints API
Ajout dans `apps/api/src/routes/investment.ts` :
*   `GET /investment/market-data` : Prix actuel et tendance.
*   `POST /investment/simulate` : Calcul du potentiel d'investissement basé sur le mois en cours.

## 4. Interface Utilisateur (Web)
*   **Mode "Ghost Investment" :** Une option sur le dashboard pour afficher le solde "Si j'avais investi mon surplus en BTC".
*   **Composant "Opportunity Card" :** Affiche la capacité d'investissement en temps réel dans le feed de l'assistant.

## 5. Sécurité & Stabilité
*   Utilisation de **feature flags** (ex: `ENABLE_INVESTMENT_HUB=true`) pour activer la vue uniquement quand elle est prête.
*   Tests unitaires isolés dans `apps/api/src/routes/investment.test.ts`.

---
**Prochaine étape proposée :** Création du service de récupération du prix du BTC et premier calcul de la "Capacité d'Investissement" basée sur tes transactions réelles.
