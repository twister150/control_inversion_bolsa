// ═══════════════════════════════════════════════════════════
// API: /api/stocks — Datos de todos los activos monitoreados
// ═══════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { TODOS_LOS_TICKERS, INFO_EMPRESAS } from '@/lib/constants';
import { obtenerDatosCompletos } from '@/lib/yahoo-finance';
import { calcularSMA, calcularATH, caidaDesdeATH, desviacionSMA } from '@/lib/indicators';
import { evaluarAlertaA, evaluarAlertaB, determinarAccion, determinarTramo } from '@/lib/alerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const customParam = searchParams.get('custom');

    let customAssets = [];
    if (customParam) {
        try {
            customAssets = JSON.parse(decodeURIComponent(customParam));
        } catch (e) {
            console.error('Error parsing custom assets', e);
        }
    }

    try {
        const allTickersToFetch = [...TODOS_LOS_TICKERS, ...customAssets];

        const resultados = await Promise.allSettled(
            allTickersToFetch.map(async ({ ticker, estrategia, nombre: customNombre, descripcion }) => {
                try {
                    const datos = await obtenerDatosCompletos(ticker);
                    const info = INFO_EMPRESAS[ticker] || { nombre: customNombre || ticker, sector: '', divisa: 'USD' };

                    // Datos diarios para SMA200
                    const preciosDiarios = datos.historicoDiario.map(d => d.close);
                    const precioActual = datos.cotizacion.precio || (preciosDiarios.length > 0 ? preciosDiarios[preciosDiarios.length - 1] : 0);

                    // SMA 200 diaria
                    const sma200 = calcularSMA(preciosDiarios, 200);

                    // Datos semanales para SMA200W y ATH
                    const preciosSemanales = datos.historicoCompleto.map(d => d.close);
                    const ath = calcularATH(preciosSemanales);
                    const sma200w = calcularSMA(preciosSemanales, 200);

                    // Desviaciones
                    const devSma200 = sma200 ? desviacionSMA(precioActual, sma200) : null;
                    const caidaAth = ath ? caidaDesdeATH(precioActual, ath) : null;

                    // Indicadores
                    const indicadores = {
                        precioActual,
                        sma200,
                        sma200w,
                        ath,
                        desviacionSma200: devSma200,
                        caidaDesdeAth: caidaAth,
                    };

                    // Alertas
                    let alerta = null;
                    if (estrategia === 'A') {
                        alerta = evaluarAlertaA(indicadores, ticker);
                    } else if (estrategia === 'B') {
                        alerta = evaluarAlertaB(indicadores, ticker);
                    }

                    // Acción recomendada
                    const accion = estrategia === 'CUSTOM' ? 'ESPERAR' : determinarAccion(indicadores, estrategia);
                    const tramo = estrategia === 'B' ? determinarTramo(indicadores) : null;

                    // Gráfico mini (últimos 90 días)
                    const datosGrafico = datos.historicoDiario.slice(-90).map(d => ({
                        fecha: d.date,
                        precio: d.close,
                    }));

                    return {
                        ticker,
                        estrategia,
                        descripcion, // Preservamos la descripción del activo personalizado
                        nombre: info.nombre,
                        sector: info.sector,
                        divisa: datos.cotizacion.divisa || info.divisa,
                        precioActual,
                        cambio: datos.cotizacion.cambio,
                        cambioPct: datos.cotizacion.cambioPct,
                        sma200,
                        sma200w,
                        ath,
                        desviacionSma200: devSma200,
                        caidaDesdeAth: caidaAth,
                        alerta,
                        accion,
                        tramo,
                        datosGrafico,
                    };
                } catch (error) {
                    console.error(`Error procesando ${ticker}:`, error);
                    return {
                        ticker,
                        estrategia,
                        descripcion,
                        nombre: INFO_EMPRESAS[ticker]?.nombre || ticker,
                        error: error.message,
                    };
                }
            })
        );

        const stocks = resultados
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);

        // Separar alertas activas
        const alertasActivas = stocks
            .filter(s => s.alerta && (s.alerta.tipo.startsWith('ALERT_')))
            .map(s => s.alerta);

        return NextResponse.json({
            stocks,
            alertasActivas,
            ultimaActualizacion: new Date().toISOString(),
            totalActivos: stocks.length,
        });
    } catch (error) {
        console.error('Error general en /api/stocks:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos del mercado', detalle: error.message },
            { status: 500 }
        );
    }
}
