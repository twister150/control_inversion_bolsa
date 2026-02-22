import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD o YYYY-MM-DDTHH:mm

    if (!ticker || !dateStr) {
        return NextResponse.json({ error: 'Faltan parámetros ticker o date' }, { status: 400 });
    }

    try {
        const targetDate = new Date(dateStr);
        // Queremos buscar datos desde unos 5 días antes hasta 1 día después para asegurarnos de encontrar datos si fue fin de semana
        const startTs = Math.floor((targetDate.getTime() - (5 * 24 * 60 * 60 * 1000)) / 1000);
        // Si la hora pedida es final del día, sumar hasta el día siguiente
        const endTs = Math.floor((targetDate.getTime() + (2 * 24 * 60 * 60 * 1000)) / 1000);

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${startTs}&period2=${endTs}&interval=1d&includePrePost=false`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance respondió con status ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result || !result.timestamp) {
            return NextResponse.json({ precio: null, currency: 'USD' });
        }

        const timestamps = result.timestamp;
        const closes = result.indicators?.quote?.[0]?.close || [];
        const meta = result.meta || {};

        const targetTs = Math.floor(targetDate.getTime() / 1000);

        // Encontrar el día más cercano anterior o igual a targetTs
        let bestIndex = -1;
        let minDiff = Infinity;

        for (let i = 0; i < timestamps.length; i++) {
            if (closes[i] == null) continue;
            const diff = targetTs - timestamps[i];
            // Si diff >= 0 (el timestamp es anterior o igual a la fecha objetivo)
            // o aceptamos el más cercano en general si solo hay posteriores (raro)
            if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                bestIndex = i;
            }
        }

        // Si no encontramos anterior, tomamos el último disponible
        if (bestIndex === -1 && timestamps.length > 0) {
            bestIndex = timestamps.length - 1;
        }

        const precio = bestIndex >= 0 ? closes[bestIndex] : null;

        return NextResponse.json({
            ticker,
            precio,
            currency: meta.currency || 'USD',
            dateEncontrada: bestIndex >= 0 ? new Date(timestamps[bestIndex] * 1000).toISOString() : null
        });
    } catch (error) {
        console.error('Error en /api/price-at-date:', error);
        return NextResponse.json({ error: 'Error al obtener precio histórico' }, { status: 500 });
    }
}
