#!/bin/bash

# 🧠 BudgetApp AI Service - Quick Start Guide
# This script helps you get started with the new AI capabilities

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     💰 BudgetApp AI Service - Configuration Helper       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the project root."
    exit 1
fi

echo "✅ Project root detected!"
echo ""

# Step 1: Check dependencies
echo "📦 STEP 1: Checking dependencies..."
if grep -q "@anthropic-ai/sdk" apps/api/package.json; then
    echo "✅ Dependencies already installed!"
else
    echo "⏳ Installing dependencies..."
    bun install
    echo "✅ Dependencies installed!"
fi
echo ""

# Step 2: Check .env
echo "🔐 STEP 2: Checking .env configuration..."
if grep -q "ANTHROPIC_API_KEY" .env; then
    if grep -q "sk-ant-" .env; then
        echo "✅ ANTHROPIC_API_KEY looks valid!"
    else
        echo "⚠️  ANTHROPIC_API_KEY is set but might be a placeholder"
        echo "    Follow: https://console.anthropic.com to get your key"
    fi
else
    echo "❌ ANTHROPIC_API_KEY missing in .env"
    echo "   Add: ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE"
fi
echo ""

# Step 3: Show endpoints
echo "🎯 STEP 3: Available Endpoints"
echo ""
echo "  1️⃣  POST /ai/analyze-trends"
echo "     └─ Generate personalized financial insights with Claude"
echo ""
echo "  2️⃣  POST /ai/scan-receipt"  
echo "     └─ Scan a receipt image and extract merchant/amount/category"
echo ""
echo "  3️⃣  POST /ai/batch-scan-receipts"
echo "     └─ Process multiple receipts at once"
echo ""

# Step 4: How to test
echo "🧪 STEP 4: Testing"
echo ""
echo "  In Terminal 1 (start API):"
echo "  $ bun apps/api/index.ts"
echo ""
echo "  In Terminal 2 (run tests):"
echo "  $ bun test-ai-endpoints.ts"
echo ""

# Step 5: Documentation
echo "📚 STEP 5: Documentation"
echo ""
echo "  Complete API Reference:"
echo "  $ less AI_ENDPOINTS.md"
echo ""
echo "  TypeScript Types:"
echo "  $ grep -A 20 'interface AssistantInsight' lib/finance-intelligence.ts"
echo ""

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                      Ready to go! 🚀                      ║"
echo "║                                                           ║"
echo "║  Next: Get your API key from console.anthropic.com       ║"
echo "║  Update .env with ANTHROPIC_API_KEY=sk-ant-xxxxx         ║"
echo "║  Then: bun test-ai-endpoints.ts                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
