import fs from "fs";
import path from "path";

/**
 * Script de test pour les nouveaux endpoints AI
 * Usage: bun test-ai-endpoints.ts
 */

const API_URL = "http://localhost:3001";

// Colors pour le terminal
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

async function testAnalyzeTrends() {
    console.log(`\n${colors.blue}═══ TEST 1: Analyse Cognitive (Analyze Trends) ═══${colors.reset}`);

    const payload = {
        userEmail: "ricardo@budgetapp.local",
        period: "month",
    };

    console.log(`${colors.yellow}📤 Request:${colors.reset}`);
    console.log(JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${API_URL}/ai/analyze-trends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log(`\n${colors.yellow}📥 Response:${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log(
                `${colors.green}✅ SUCCESS: Analyse générée avec Claude${colors.reset}`
            );
        } else {
            console.log(
                `${colors.red}❌ ERROR: ${data.error || "Unknown error"}${colors.reset}`
            );
            if (data.hint) {
                console.log(`${colors.yellow}💡 Hint: ${data.hint}${colors.reset}`);
            }
        }
    } catch (error) {
        console.error(`${colors.red}❌ FETCH ERROR:${colors.reset}`, error);
    }
}

async function testScanReceipt() {
    console.log(
        `\n${colors.blue}═══ TEST 2: Scan de Tickets (OCR) ═══${colors.reset}`
    );

    // Créer une image de test simple (1x1 pixel blanc, en base64)
    const testImageBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    const payload = {
        image: testImageBase64,
        userEmail: "ricardo@budgetapp.local",
    };

    console.log(`${colors.yellow}📤 Request:${colors.reset}`);
    console.log("image: <base64 PNG 1x1>"); // Ne pas afficher la longue base64
    console.log("userEmail: ricardo@budgetapp.local");

    try {
        const response = await fetch(`${API_URL}/ai/scan-receipt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log(`\n${colors.yellow}📥 Response:${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log(
                `${colors.green}✅ SUCCESS: Reçu scanné (confidence: ${data.confidence})${colors.reset}`
            );
        } else {
            console.log(
                `${colors.red}❌ ERROR: ${data.error || "Unknown error"}${colors.reset}`
            );
        }
    } catch (error) {
        console.error(`${colors.red}❌ FETCH ERROR:${colors.reset}`, error);
    }
}

async function testBatchScan() {
    console.log(
        `\n${colors.blue}═══ TEST 3: Batch Scan (OCR Multiple) ═══${colors.reset}`
    );

    const testImageBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    const payload = {
        images: [testImageBase64, testImageBase64, testImageBase64],
        userEmail: "ricardo@budgetapp.local",
    };

    console.log(`${colors.yellow}📤 Request:${colors.reset}`);
    console.log("images: [<3 x base64 PNG>]");
    console.log("userEmail: ricardo@budgetapp.local");

    try {
        const response = await fetch(`${API_URL}/ai/batch-scan-receipts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log(`\n${colors.yellow}📥 Response:${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log(
                `${colors.green}✅ SUCCESS: ${data.scanned_count} reçus traités (Total: ${data.total_amount}€)${colors.reset}`
            );
        } else {
            console.log(
                `${colors.red}❌ ERROR: ${data.error || "Unknown error"}${colors.reset}`
            );
        }
    } catch (error) {
        console.error(`${colors.red}❌ FETCH ERROR:${colors.reset}`, error);
    }
}

async function runTests() {
    console.log(
        `${colors.green}🚀 Démarrage des tests AI Service${colors.reset}`
    );
    console.log(`Cible: ${API_URL}\n`);

    // Vérifier que l'API est accessible
    try {
        const health = await fetch(`${API_URL}/health`);
        if (!health.ok) throw new Error("API not responding");
        console.log(`${colors.green}✅ API accessible${colors.reset}\n`);
    } catch (error) {
        console.error(
            `${colors.red}❌ L'API n'est pas accessible sur ${API_URL}${colors.reset}`
        );
        console.log(
            `${colors.yellow}💡 Démarre l'API avec: bun apps/api/index.ts${colors.reset}`
        );
        return;
    }

    await testAnalyzeTrends();
    await testScanReceipt();
    await testBatchScan();

    console.log(
        `\n${colors.green}✅ Tests terminés!${colors.reset}${colors.yellow}`
    );
    console.log(`Pour plus d'infos, voir AI_ENDPOINTS.md${colors.reset}\n`);
}

runTests();
