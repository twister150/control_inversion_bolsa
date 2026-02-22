import { NextResponse } from 'next/server';
import { obtenerDatosHistoricos } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const range = searchParams.get('range') || '5y'; // 1mo, 3mo, 6mo, 1y, 5y, max

    if (!ticker) {
        return NextResponse.json({ error: 'Falta el parámetro ticker' }, { status: 400 });
    }

    try {
        // Usar la función existente o llamar directo si necesitamos rango distinto
        // Recordar que obtenerDatosHistoricos usa 1d o 1wk según el parámetro, pero no expondemos todo.
        // Haremos fetch directo para más control aquí
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=1d&includePrePost=false`;

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

        if (!result) {
            return NextResponse.json([]);
        }

        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0] || {};
        const meta = result.meta || {};

        const chartData = timestamps.map((ts, i) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            close: quotes.close?.[i] || 0,
            volume: quotes.volume?.[i] || 0,
        })).filter(d => d.close > 0);

        return NextResponse.json({
            ticker,
            currency: meta.currency,
            data: chartData
        });
    } catch (error) {
        console.error('Error en /api/chart:', error);
        return NextResponse.json({ error: 'Error al obtener datos del gráfico' }, { status: 500 });
    }
}
