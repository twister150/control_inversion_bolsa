import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: 'Falta el parámetro q' }, { status: 400 });
    }

    try {
        const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance respondió con status ${response.status}`);
        }

        const data = await response.json();

        // Filtramos solo equity, etfs, mutual funds (no cripto o divisas si no queremos, o dejamos todo)
        const quotes = data.quotes
            .filter(quote => ['EQUITY', 'ETF', 'MUTUALFUND'].includes(quote.quoteType))
            .map(quote => ({
                ticker: quote.symbol,
                nombre: quote.shortname || quote.longname || quote.symbol,
                exchange: quote.exchDisp || quote.exchange,
                tipo: quote.quoteType
            }));

        return NextResponse.json(quotes);
    } catch (error) {
        console.error('Error en /api/search:', error);
        return NextResponse.json({ error: 'Error al buscar activos' }, { status: 500 });
    }
}
