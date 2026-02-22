// ═══════════════════════════════════════════════════════════
// SERVICIO DE DATOS FINANCIEROS — YAHOO FINANCE
// ═══════════════════════════════════════════════════════════

// Cache en memoria del servidor (TTL: 15 minutos)
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function getCacheKey(ticker, tipo) {
    return `${ticker}_${tipo}`;
}

function getFromCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Obtiene datos históricos de Yahoo Finance
 * @param {string} ticker - Símbolo del activo (e.g., 'AAPL', 'MC.PA')
 * @param {string} range - Rango temporal: '1y', '5y', '10y', 'max'
 * @param {string} interval - Intervalo: '1d', '1wk', '1mo'
 * @returns {Promise<Array<{date: string, close: number, open: number, high: number, low: number, volume: number}>>}
 */
export async function obtenerDatosHistoricos(ticker, range = '2y', interval = '1d') {
    const cacheKey = getCacheKey(ticker, `hist_${range}_${interval}`);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance respondió con status ${response.status} para ${ticker}`);
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result) {
            throw new Error(`No hay datos disponibles para ${ticker}`);
        }

        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0] || {};

        const historico = timestamps.map((ts, i) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            close: quotes.close?.[i] || 0,
            open: quotes.open?.[i] || 0,
            high: quotes.high?.[i] || 0,
            low: quotes.low?.[i] || 0,
            volume: quotes.volume?.[i] || 0,
        })).filter(d => d.close > 0); // Filtrar datos nulos

        setCache(cacheKey, historico);
        return historico;
    } catch (error) {
        console.error(`Error al obtener datos de ${ticker}:`, error.message);
        return [];
    }
}

/**
 * Obtiene la cotización actual de un activo
 * @param {string} ticker
 * @returns {Promise<Object>} - { precio, cambio, cambioPct, volumen, marketCap, nombre, divisa }
 */
export async function obtenerCotizacion(ticker) {
    const cacheKey = getCacheKey(ticker, 'quote');
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5d&interval=1d`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance respondió con status ${response.status}`);
        }

        const data = await response.json();
        const meta = data.chart?.result?.[0]?.meta;
        const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
        const closes = quotes?.close?.filter(c => c != null) || [];

        const precio = meta?.regularMarketPrice || closes[closes.length - 1] || 0;
        const precioAnterior = meta?.chartPreviousClose || (closes.length > 1 ? closes[closes.length - 2] : precio);

        const cotizacion = {
            precio,
            cambio: precio - precioAnterior,
            cambioPct: precioAnterior > 0 ? ((precio - precioAnterior) / precioAnterior) * 100 : 0,
            divisa: meta?.currency || 'USD',
            exchange: meta?.exchangeName || '',
            nombre: meta?.shortName || ticker,
        };

        setCache(cacheKey, cotizacion);
        return cotizacion;
    } catch (error) {
        console.error(`Error al obtener cotización de ${ticker}:`, error.message);
        return { precio: 0, cambio: 0, cambioPct: 0, divisa: 'USD', exchange: '', nombre: ticker };
    }
}

/**
 * Obtiene todos los datos necesarios para un ticker
 * @param {string} ticker
 * @returns {Promise<Object>} - Datos históricos diarios + largo plazo para ATH
 */
export async function obtenerDatosCompletos(ticker) {
    const [historicoDiario, historicoCompleto, cotizacion] = await Promise.all([
        obtenerDatosHistoricos(ticker, '2y', '1d'),     // 2 años diarios para SMA200
        obtenerDatosHistoricos(ticker, 'max', '1wk'),   // Máximo histórico semanal para ATH y SMA200W
        obtenerCotizacion(ticker),
    ]);

    return {
        historicoDiario,
        historicoCompleto,
        cotizacion,
    };
}
