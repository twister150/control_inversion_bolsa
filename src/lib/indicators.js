// ═══════════════════════════════════════════════════════════
// CÁLCULO DE INDICADORES TÉCNICOS
// ═══════════════════════════════════════════════════════════

/**
 * Calcula la Media Móvil Simple (SMA)
 * @param {number[]} precios - Array de precios de cierre (más reciente al final)
 * @param {number} periodo - Número de periodos para la media
 * @returns {number|null} - Valor de la SMA o null si no hay datos suficientes
 */
export function calcularSMA(precios, periodo) {
    if (!precios || precios.length < periodo) return null;
    const slice = precios.slice(-periodo);
    const suma = slice.reduce((acc, p) => acc + p, 0);
    return suma / periodo;
}

/**
 * Calcula el Máximo Histórico (ATH)
 * @param {number[]} precios - Array de precios de cierre
 * @returns {number|null}
 */
export function calcularATH(precios) {
    if (!precios || precios.length === 0) return null;
    return Math.max(...precios);
}

/**
 * Calcula la desviación porcentual del precio actual respecto a la SMA
 * @param {number} precioActual
 * @param {number} sma
 * @returns {number} - Porcentaje (negativo = por debajo)
 */
export function desviacionSMA(precioActual, sma) {
    if (!sma || sma === 0) return 0;
    return ((precioActual - sma) / sma) * 100;
}

/**
 * Calcula el porcentaje de caída desde el ATH
 * @param {number} precioActual
 * @param {number} ath
 * @returns {number} - Porcentaje de caída (número positivo = caída)
 */
export function caidaDesdeATH(precioActual, ath) {
    if (!ath || ath === 0) return 0;
    return ((ath - precioActual) / ath) * 100;
}

/**
 * Convierte datos diarios a datos semanales (cierre del viernes)
 * @param {Array<{date: string, close: number}>} datosDiarios
 * @returns {number[]} - Array de cierres semanales
 */
export function convertirADatosSemanales(datosDiarios) {
    if (!datosDiarios || datosDiarios.length === 0) return [];

    const semanales = [];
    let semanaActual = null;
    let cierreSemana = null;

    for (const dato of datosDiarios) {
        const fecha = new Date(dato.date);
        const semana = getNumeroSemana(fecha);
        const año = fecha.getFullYear();
        const claveSemana = `${año}-${semana}`;

        if (claveSemana !== semanaActual) {
            if (cierreSemana !== null) {
                semanales.push(cierreSemana);
            }
            semanaActual = claveSemana;
        }
        cierreSemana = dato.close;
    }

    if (cierreSemana !== null) {
        semanales.push(cierreSemana);
    }

    return semanales;
}

function getNumeroSemana(fecha) {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaSemana = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - diaSemana);
    const inicioAño = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - inicioAño) / 86400000 + 1) / 7);
}

/**
 * Procesa datos crudos de un ticker y calcula todos los indicadores
 * @param {Object} datosCrudos - { historicoDiario: [{date, close}], historicoCompleto: [{date, close}] }
 * @returns {Object} - Todos los indicadores calculados
 */
export function calcularTodosLosIndicadores(datosCrudos) {
    const { historicoDiario, historicoCompleto } = datosCrudos;

    const preciosDiarios = historicoDiario.map(d => d.close);
    const preciosCompletos = historicoCompleto.map(d => d.close);
    const datosSemanales = convertirADatosSemanales(historicoCompleto);

    const precioActual = preciosDiarios.length > 0 ? preciosDiarios[preciosDiarios.length - 1] : 0;
    const sma200 = calcularSMA(preciosDiarios, 200);
    const sma200w = calcularSMA(datosSemanales, 200);
    const ath = calcularATH(preciosCompletos);

    return {
        precioActual,
        sma200,
        sma200w,
        ath,
        desviacionSma200: sma200 ? desviacionSMA(precioActual, sma200) : null,
        caidaDesdeAth: ath ? caidaDesdeATH(precioActual, ath) : null,
        datosGrafico: historicoDiario.slice(-90).map(d => ({
            fecha: d.date,
            precio: d.close,
        })),
    };
}
