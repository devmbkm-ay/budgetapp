import { Elysia, t } from 'elysia';

export const investmentRoutes = new Elysia({ prefix: '/investment' })
    .get('/btc-price', async () => {
        try {
            // Utilisation de l'API publique de CoinGecko (sans clé requise pour les tests)
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
            const data = await response.json();
            
            return {
                symbol: 'BTC',
                price: data.bitcoin.eur,
                currency: 'EUR',
                timestamp: new Date().toISOString(),
                source: 'CoinGecko'
            };
        } catch (error) {
            return { error: 'Failed to fetch BTC price', details: error };
        }
    })
    .post('/simulate', async ({ body, set }) => {
        const { savings, btcPrice } = body;
        
        if (btcPrice <= 0) {
            set.status = 400;
            return { error: 'Invalid BTC price' };
        }

        const btcAmount = savings / btcPrice;
        const satoshis = Math.floor(btcAmount * 100000000);

        return {
            investmentAmount: savings,
            btcPriceAtSimulation: btcPrice,
            simulatedBtc: btcAmount.toFixed(8),
            simulatedSatoshis: satoshis,
            message: `Avec ${savings}€, tu pourrais acquérir ${satoshis.toLocaleString()} Satoshis au cours actuel.`
        };
    }, {
        body: t.Object({
            savings: t.Number(),
            btcPrice: t.Number()
        })
    });
