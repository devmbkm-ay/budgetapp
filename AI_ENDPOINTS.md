# 🧠 AI Service Endpoints - Documentation

## Vue d'ensemble

Deux nouveaux endpoints "intelligents" ont été implémentés :

1. **Analyse Cognitive** (`POST /ai/analyze-trends`) - Conseils financiers personnalisés avec Claude
2. **Scan de Tickets** (`POST /ai/scan-receipt`) - Reconnaissance OCR des reçus

---

## 1️⃣ Analyse Cognitive - `/ai/analyze-trends`

### Description
Analyse vos transactions avec Claude pour générer des conseils personnalisés, détectez les patterns de dépenses, et recevez des recommandations sur-mesure.

### Endpoint
```
POST /ai/analyze-trends
```

### Body
```json
{
  "userEmail": "ricardo@example.com",
  "period": "month"  // Optional: "week", "month", "year"
}
```

### Response
```json
{
  "summary": "Analyse intelligente de vos 47 opérations.",
  "insights": [
    "Ricardo, je remarque que tu dépenses beaucoup en restaurant (32% de ton budget). Une cuisine à la maison 3-4 jours par semaine pourrait te faire économiser 200€/mois.",
    "Ton ratio dépenses/revenus est de 68%, ce qui est sain. Continue comme ça, tu as de la marge pour investir.",
    "J'ai détecté 5 abonnements (Netflix, Spotify, etc.). Un audit annuel pourrait identifier ceux inutilisés."
  ],
  "metadata": {
    "model": "claude-3-5-sonnet-20241022",
    "analysis_date": "2026-04-08T10:30:00.000Z",
    "transaction_count": 47
  }
}
```

### Configuration requise
- ✅ `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
- ✅ Au moins 3 transactions dans la base de données

### Exemple with curl
```bash
curl -X POST http://localhost:3001/ai/analyze-trends \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "ricardo@budgetapp.local",
    "period": "month"
  }'
```

---

## 2️⃣ Scan de Tickets - `/ai/scan-receipt`

### Description
Uploadez une photo de reçu, le système la traite via OCR (Tesseract.js) et extrait automatiquement :
- Le marchand 🏪
- Le montant 💰
- La catégorie 🏷️
- Un score de confiance

### Endpoint
```
POST /ai/scan-receipt
```

### Body
```json
{
  "image": "iVBORw0KGgoAAAANSUhEUgAA...",  // Base64-encoded image (PNG/JPG)
  "userEmail": "ricardo@example.com"  // Optional
}
```

### Response
```json
{
  "merchant": "CARREFOUR EXPRESS",
  "amount": 27.50,
  "category": "Alimentaire",
  "confidence": 0.85,
  "raw_text": "CARREFOUR EXPRESS\nRUE DE RIVOLI\n...",
  "extracted_at": "2026-04-08T10:32:00.000Z"
}
```

### Categories Supported
- **Alimentaire** : Carrefour, Leclerc, boulangerie, etc.
- **Transport** : Essence, parking, péage, SNCF
- **Loisirs** : Cinema, musée, sport
- **Santé** : Pharmacie, docteur
- **Shopping** : Zara, H&M, vêtements
- **Restaurants** : Pizzeria, cafe, bistrot
- **Divers** : Autres catégories

### Exemple avec curl
```bash
# Convertir une image en base64 et envoyer
curl -X POST http://localhost:3001/ai/scan-receipt \
  -H "Content-Type: application/json" \
  -d "{
    \"image\": \"$(base64 -w 0 receipt.jpg)\",
    \"userEmail\": \"ricardo@budgetapp.local\"
  }"
```

### Exemple JavaScript/TypeScript
```typescript
import fs from "fs";

async function scanReceipt(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const response = await fetch('http://localhost:3001/ai/scan-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      userEmail: "ricardo@budgetapp.local"
    })
  });

  const result = await response.json();
  console.log('Scanned receipt:', result);
  return result;
}

scanReceipt('./receipt.jpg');
```

---

## 3️⃣ Batch Scan - `/ai/batch-scan-receipts` (Bonus)

### Description
Scannez plusieurs reçus en une seule requête pour un traitement bulk.

### Endpoint
```
POST /ai/batch-scan-receipts
```

### Body
```json
{
  "images": [
    "iVBORw0KGgoAAAANSU...",
    "iVBORw0KGgoAAAANSU...",
    "iVBORw0KGgoAAAANSU..."
  ],
  "userEmail": "ricardo@example.com"  // Optional
}
```

### Response
```json
{
  "scanned_count": 3,
  "results": [
    { "merchant": "CARREFOUR", "amount": 27.50, "category": "Alimentaire", ... },
    { "merchant": "SHELL", "amount": 65.00, "category": "Transport", ... },
    { "merchant": "NETFLIX", "amount": 12.99, "category": "Loisirs", ... }
  ],
  "total_amount": 105.49,
  "processed_at": "2026-04-08T10:35:00.000Z"
}
```

---

## ⚙️ Configuration .env

```env
# Claude API Key (requis pour Analyse Cognitive)
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Database
DATABASE_URL=postgresql://postgres:mysecretpassword@db:5432/budget_db

# Auth
AUTH_SECRET=IpAtXbUbPpogLwyC91QpLz8ynQTlbxyR7pMsYDjHMfo
```

### Obtenir une clé Anthropic
1. Aller sur https://console.anthropic.com
2. Créer un compte / Se connecter
3. Générer une clé API
4. Modifier `.env` et ajouter : `ANTHROPIC_API_KEY=sk-ant-xxxxx`

---

## 📊 Limitations connues

| Feature | Limitation | Workaround |
|---------|-----------|-----------|
| **OCR** | Meilleur avec reçus clairs et droits | Prendre une bonne photo bien centrée |
| **Montant** | Peut échouer sur format non-standard | Vérifier le `confidence` score |
| **Catégories** | Basée sur mots-clés français | Ajouter de nouveaux keywords si besoin |
| **Claude** | Requiert API valide | Vérifier la clé dans `.env` |

---

## 🧪 Test rapide

```bash
# Démarrer l'API
cd /home/ricardo/DEV/budgetapp
bun apps/api/index.ts

# Dashboard Swagger (dans autre terminal)
# Ouvrir : http://localhost:3001/swagger

# Ou tester avec curl :
curl http://localhost:3001/ai/analyze-trends \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com"}'
```

---

## 🚀 Prochaines étapes

- [ ] Intégrer UI pour uploader les reçus
- [ ] Sauvegarder les reçus scannés en DB
- [ ] Intégrer avec transactions automatiquement
- [ ] Ajouter graphiques pour insights
- [ ] Améliorer détection de point de vente avec ML
