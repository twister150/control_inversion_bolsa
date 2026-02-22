// ═══════════════════════════════════════════════════════════
// MOTOR DE ALERTAS
// ═══════════════════════════════════════════════════════════

import { ESTRATEGIA_A, ESTRATEGIA_B } from './constants.js';

/**
 * Evalúa alertas para Estrategia A (Cazador de Pánico / BNF)
 * Regla: Precio Actual < SMA 200 × 0.80
 *
 * @param {Object} indicadores - { precioActual, sma200, desviacionSma200 }
 * @param {string} ticker
 * @returns {Object|null} - Alerta o null
 */
export function evaluarAlertaA(indicadores, ticker) {
    const { precioActual, sma200 } = indicadores;

    if (!sma200 || !precioActual) return null;

    const umbral = sma200 * ESTRATEGIA_A.umbralActivacion;
    const enZona = precioActual < umbral;
    const desviacion = ((precioActual - sma200) / sma200) * 100;

    if (enZona) {
        return {
            tipo: 'ALERT_A',
            ticker,
            estrategia: 'A',
            mensaje: `${ticker} ha superado el -20% respecto a la SMA 200. Zona BNF detectada.`,
            severidad: 'critica',
            precioActual,
            sma200,
            umbral,
            desviacion: desviacion.toFixed(2),
            accionRecomendada: 'COMPRAR',
            detalles: {
                entrada: '50% del capital asignado',
                refuerzo: 'Si cae un 10% adicional: 50% restante',
                salida: `Precio toca SMA 200 (${sma200.toFixed(2)}) o +25% desde precio medio de compra`,
            },
        };
    }

    // Zona de cercanía (entre -15% y -20%)
    if (desviacion <= -15 && desviacion > -20) {
        return {
            tipo: 'WATCH_A',
            ticker,
            estrategia: 'A',
            mensaje: `${ticker} se acerca a la zona BNF. Desviación: ${desviacion.toFixed(1)}% vs SMA 200.`,
            severidad: 'vigilancia',
            precioActual,
            sma200,
            desviacion: desviacion.toFixed(2),
            accionRecomendada: 'ESPERAR',
        };
    }

    return null;
}

/**
 * Evalúa alertas para Estrategia B (Bóveda Chandler)
 * Tramo 1: Caída ≥ 30% desde ATH
 * Tramo 2: Caída ≥ 50% desde ATH O Precio ≤ SMA 200W
 * Tramo 3: Caída ≥ 65% desde ATH (Zona Chandler)
 *
 * @param {Object} indicadores - { precioActual, ath, sma200w, caidaDesdeAth }
 * @param {string} ticker
 * @returns {Object|null} - Alerta o null
 */
export function evaluarAlertaB(indicadores, ticker) {
    const { precioActual, ath, sma200w, caidaDesdeAth } = indicadores;

    if (!ath || !precioActual) return null;

    const caida = caidaDesdeAth || ((ath - precioActual) / ath) * 100;

    // Tramo 3 — Zona Chandler (más crítico primero)
    if (caida >= 65) {
        return {
            tipo: 'ALERT_B_3',
            ticker,
            estrategia: 'B',
            tramo: 3,
            mensaje: `${ticker} caída del ${caida.toFixed(1)}%. ZONA CHANDLER ACTIVA.`,
            severidad: 'critica',
            precioActual,
            ath,
            caida: caida.toFixed(2),
            accionRecomendada: 'ALERTA_MAXIMA',
            capitalSugerido: '50% del capital',
        };
    }

    // Tramo 2
    const tocaSma200w = sma200w && precioActual <= sma200w;
    if (caida >= 50 || tocaSma200w) {
        return {
            tipo: 'ALERT_B_2',
            ticker,
            estrategia: 'B',
            tramo: 2,
            mensaje: `${ticker} caída del ${caida.toFixed(1)}% desde ATH. Tramo 2 activo.${tocaSma200w ? ' Precio tocando SMA 200W.' : ''}`,
            severidad: 'alta',
            precioActual,
            ath,
            sma200w,
            caida: caida.toFixed(2),
            accionRecomendada: 'COMPRAR',
            capitalSugerido: '30% del capital',
        };
    }

    // Tramo 1
    if (caida >= 30) {
        return {
            tipo: 'ALERT_B_1',
            ticker,
            estrategia: 'B',
            tramo: 1,
            mensaje: `${ticker} caída del ${caida.toFixed(1)}% desde ATH. Tramo 1 activo.`,
            severidad: 'media',
            precioActual,
            ath,
            caida: caida.toFixed(2),
            accionRecomendada: 'COMPRAR',
            capitalSugerido: '20% del capital',
        };
    }

    // Zona de vigilancia (entre 20-30%)
    if (caida >= 20) {
        return {
            tipo: 'WATCH_B',
            ticker,
            estrategia: 'B',
            mensaje: `${ticker} acumula una caída del ${caida.toFixed(1)}% desde ATH. En vigilancia.`,
            severidad: 'vigilancia',
            precioActual,
            ath,
            caida: caida.toFixed(2),
            accionRecomendada: 'ESPERAR',
        };
    }

    return null;
}

/**
 * Determina la acción recomendada para un activo
 */
export function determinarAccion(indicadores, estrategia) {
    if (estrategia === 'A') {
        const alerta = evaluarAlertaA(indicadores, '');
        if (alerta?.tipo === 'ALERT_A') return 'COMPRAR';

        // Check zona de salida: precio >= SMA200
        if (indicadores.precioActual >= indicadores.sma200) {
            return 'ZONA_SALIDA';
        }
        return 'ESPERAR';
    }

    if (estrategia === 'B') {
        const caida = indicadores.caidaDesdeAth || 0;
        if (caida >= 65) return 'ALERTA_MAXIMA';
        if (caida >= 50 || (indicadores.sma200w && indicadores.precioActual <= indicadores.sma200w)) return 'COMPRAR';
        if (caida >= 30) return 'COMPRAR';

        // Zona de salida: precio supera ATH previo
        if (indicadores.precioActual >= indicadores.ath) {
            return 'ZONA_SALIDA';
        }
        return 'ESPERAR';
    }

    return 'ESPERAR';
}

/**
 * Determina el tramo activo para Estrategia B
 */
export function determinarTramo(indicadores) {
    const caida = indicadores.caidaDesdeAth || 0;
    const tocaSma200w = indicadores.sma200w && indicadores.precioActual <= indicadores.sma200w;

    if (caida >= 65) return 3;
    if (caida >= 50 || tocaSma200w) return 2;
    if (caida >= 30) return 1;
    return 0;
}
