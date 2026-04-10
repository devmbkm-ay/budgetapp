// Simple bridge to avoid CORS/Fetch issues in local dev if web and api are on different ports
export const GET = async () => {
    try {
        console.log("Proxying BTC price request...");
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur', {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`CoinGecko responded with ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.bitcoin || !data.bitcoin.eur) {
            throw new Error("Invalid response format from CoinGecko");
        }

        return Response.json({
            symbol: 'BTC',
            price: data.bitcoin.eur,
            currency: 'EUR',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("BTC Proxy Error:", error);
        return Response.json({ 
            error: 'Failed to proxy BTC price',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { savings, btcPrice } = body;
        
        const btcAmount = savings / btcPrice;
        const satoshis = Math.floor(btcAmount * 100000000);

        return Response.json({
            investmentAmount: savings,
            btcPriceAtSimulation: btcPrice,
            simulatedBtc: btcAmount.toFixed(8),
            simulatedSatoshis: satoshis
        });
    } catch (error) {
        return Response.json({ error: 'Simulation failed' }, { status: 500 });
    }
}
