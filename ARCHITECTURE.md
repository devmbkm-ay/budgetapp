# 🏗️ Architecture - AI Service

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Web/Mobile)                      │
└────────────────────┬────────────────────┬───────────────────────┘
                     │                    │
          ┌──────────▼──────────┐  ┌─────▼──────────┐
          │   Analyze Trends    │  │  Scan Receipt  │
          │  (Transactions)     │  │  (Receipts)    │
          └──────────┬──────────┘  └─────┬──────────┘
                     │                   │
    ┌────────────────▼──────────────────▼────────────┐
    │        Elysia API Server (3001)                │
    │   apps/api/src/routes/ai-service.ts           │
    └─┬──────────────────────────────────────────────┘
      │
      ├─ POST /ai/analyze-trends
      │   │
      │   ├─ 1️⃣ Client sends: { userEmail, period? }
      │   │
      │   ├─ 2️⃣ Function: generateAIInsightsWithClaude()
      │   │   ├─ Query: listTransactions(userEmail)
      │   │   │   └─ 🗄️ Database: Prisma → PostgreSQL
      │   │   │
      │   │   ├─ Prepare context:
      │   │   │   ├─ Total expenses/income
      │   │   │   ├─ Top 5 categories
      │   │   │   └─ Transaction patterns
      │   │   │
      │   │   └─ Call: anthropic.messages.create()
      │   │       ├─ Model: claude-3-5-sonnet
      │   │       ├─ Prompt: Financial analysis request
      │   │       └─ 🤖 Claude generates 3 insights
      │   │
      │   └─ 3️⃣ Response: { summary, insights[], metadata }
      │
      ├─ POST /ai/scan-receipt
      │   │
      │   ├─ 1️⃣ Client sends: { image (base64), userEmail? }
      │   │
      │   ├─ 2️⃣ Function: scanReceiptImage()
      │   │   ├─ Decode: base64 → Buffer
      │   │   │
      │   │   ├─ Optimize with Sharp:
      │   │   │   ├─ Resize: 1200x1600
      │   │   │   └─ Better quality for OCR
      │   │   │
      │   │   ├─ OCR with Tesseract.js:
      │   │   │   ├─ Lang: French
      │   │   │   └─ Extract: Raw text
      │   │   │
      │   │   ├─ Parse text:
      │   │   │   ├─ Merchant: First line
      │   │   │   └─ Amount: Regex match (EUR)
      │   │   │
      │   │   └─ Auto-categorize:
      │   │       ├─ Keyword matching
      │   │       ├─ Categories: {
      │   │       │   Alimentaire, Transport, Loisirs,
      │   │       │   Santé, Shopping, Restaurants, Divers
      │   │       │ }
      │   │       └─ Confidence score
      │   │
      │   └─ 3️⃣ Response: { merchant, amount, category, confidence }
      │
      └─ POST /ai/batch-scan-receipts
          ├─ 1️⃣ Client sends: { images: [base64...], userEmail? }
          ├─ 2️⃣ Process: Promise.all(images.map(img => scanReceiptImage(img)))
          └─ 3️⃣ Response: { scanned_count, results[], total_amount }
```

## 📦 Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  (Next.js Web App - apps/web/)                              │
│  - File upload component                                     │
│  - Transaction form                                          │
│  - Display insights                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼─────────────────────────────────────────┐
│                   API Layer (Node.js/Bun)                    │
│  Port 3001 - apps/api/                                       │
│  ├─ Framework: Elysia (FastAPI-like)                        │
│  ├─ Routes: ai-service.ts                                    │
│  └─ Middleware: CORS, error handling                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼────────────┐    ┌────────▼─────────────┐
│   AI/LLM Services  │    │  Image Processing   │
├────────────────────┤    ├─────────────────────┤
│ Anthropic API      │    │ Sharp (Image opt)   │
│ ├─ Claude Model    │    │ Tesseract.js (OCR)  │
│ ├─ 25K token limit │    │ ├─ French trained   │
│ └─ Streaming ready │    │ └─ ~2-3s per image  │
└────────────────────┘    └─────────────────────┘
        │                          │
        └────────────┬─────────────┘
                     │
          ┌──────────▼──────────┐
          │  Database Layer     │
          │  PostgreSQL + Prisma│
          ├──────────────────────┤
          │ • transactions       │
          │ • users              │
          │ • scan_results (NEW) │
          └──────────────────────┘
```

## 🔄 Data Flow Examples

### Example 1: Analyze Trends

```
User clicks "Generate Insights"
  └─ Web: POST to /ai/analyze-trends
    - Body: { userEmail: "ricardo@app.local", period: "month" }
    │
    └─ API: generateAIInsightsWithClaude()
      ├─ DB Query: SELECT * FROM transactions WHERE userEmail = ? LIMIT 500
      │  → Returns: [
      │      { type: "expense", category: "Restaurant", amount: 45.50, ... },
      │      { type: "income", category: "Salary", amount: 3000, ... },
      │      ...
      │    ]
      │
      ├─ Calculate Summary:
      │  ├─ Total Expenses: 1,250€
      │  ├─ Total Income: 3,000€
      │  ├─ Top Category: "Restaurant" (35%)
      │  └─ Ratio: 41.7%
      │
      ├─ Anthropic API Call:
      │  ├─ Model: claude-3-5-sonnet-20241022
      │  ├─ Prompt Template:
      │  │  "Analysez ce profil de dépenses:
      │  │   Total: 1250€
      │  │   Revenus: 3000€
      │  │   Top: Restaurant (35%)
      │  │   [...]"
      │  │
      │  └─ Result (2-3 sec): [
      │      "Ricardo, chercher des alternatives moins chères",
      │      "Excellent ratio d'épargne!",
      │      "Détecté 5 abonnements..."
      │    ]
      │
      └─ Response: { summary, insights[], metadata }
        └─ Web: Display insights to user
```

### Example 2: Scan Receipt

```
User takes photo of receipt
  └─ Web: Convert image → Base64 (500KB max)
    └─ POST /ai/scan-receipt
      - Body: { image: "iVBORw0KGgo...", userEmail: "..." }
      │
      └─ API: scanReceiptImage(imageBase64)
        ├─ Decode: base64 → PNG/JPG Buffer
        │
        ├─ Sharp Optimization:
        │  ├─ Resize to 1200x1600
        │  └─ Enhance contrast
        │
        ├─ Tesseract.js OCR:
        │  ├─ Lang: French
        │  ├─ Extract: "CARREFOUR / 27.50€ / Produits frais..."
        │  └─ ~3 seconds processing
        │
        ├─ Parse Results:
        │  ├─ Merchant: "CARREFOUR" (1st line)
        │  ├─ Amount: 27.50 (regex €)
        │  └─ Keywords: "frais", "produits", "légumes"
        │
        ├─ Categorize:
        │  └─ Match keywords → "Alimentaire" (high confidence)
        │
        └─ Response: {
          merchant: "CARREFOUR",
          amount: 27.50,
          category: "Alimentaire",
          confidence: 0.85
        }
          └─ Web: Show result, allow user to confirm/edit
            └─ User can then save as transaction
```

## 🛡️ Error Handling

```
┌─────────────────────┐
│   Error Scenarios   │
├─────────────────────┤
│ No ANTHROPIC_API_KEY│ → 500: "Vériﬁe .env"
│ Invalid Email       │ → 400: "Email invalide"
│ Bad Image Format    │ → 400: "Base64 attendu"
│ OCR Failure         │ → 500: "Error OCR"
│ Claude API Down     │ → 503: "Claude unavailable"
│ DB Connection Lost  │ → 500: "DB Error"
└─────────────────────┘
```

## 📊 Performance Estimates

| Operation | Time | Notes |
|-----------|------|-------|
| Analyze Trends | 2-5 sec | API call to Claude |
| Single Scan | 3-4 sec | OCR processing |
| Batch Scan (5) | 15-20 sec | Parallel OCR |
| DB Query | <100ms | Indexed search |
| Image Resize | 50-200ms | Sharp optimization |

## 🔮 Future Enhancements

```
Phase 2: Auto-Import
├─ Automatically save scanned receipts as transactions
├─ Suggest category for high-confidence scans
└─ Batch import from phone gallery

Phase 3: Advanced Analytics
├─ Trend predictions (next month expenses)
├─ Budget alerts (exceeding limits)
└─ Spending patterns by day/week

Phase 4: ML Fine-tuning
├─ Custom category detection
├─ Merchant recognition training
└─ Personal spending behavior models
```
