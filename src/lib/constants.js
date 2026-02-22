// ═══════════════════════════════════════════════════════════
// CONSTANTES DEL SISTEMA DE ARBITRAJE DEL MIEDO
// ═══════════════════════════════════════════════════════════

export const ESTRATEGIA_A = {
    id: 'A',
    nombre: 'Cazador de Pánico (BNF)',
    descripcion: 'Rebotes rápidos del +20% al +25%. Entrada cuando el precio cae un 20% por debajo de la SMA 200.',
    objetivo: 'Rebote rápido',
    horizonte: '1-6 meses',
    tickers: ['NVDA', 'TSLA', 'META', 'AMD', 'NFLX'],
    umbralActivacion: 0.80, // Precio < SMA200 * 0.80
    salidaRebote: 0.25, // +25% desde precio medio de compra
    color: '#00d4ff',
    colorAlerta: '#ff4444',
};

export const ESTRATEGIA_B = {
    id: 'B',
    nombre: 'Bóveda Chandler (Largo Plazo)',
    descripcion: 'Construcción de riqueza comprando descuentos históricos. Compra escalonada basada en caída desde ATH.',
    objetivo: 'Riqueza a largo plazo',
    horizonte: '2-5 años',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NKE', 'COST', 'MC.PA', 'BRK-B', 'V'],
    tramos: [
        { id: 1, nombre: 'Tramo 1', caida: 0.30, capital: 0.20, color: '#ffa726', descripcion: 'Caída ≥ 30% desde ATH → 20% del capital' },
        { id: 2, nombre: 'Tramo 2', caida: 0.50, capital: 0.30, color: '#ff7043', descripcion: 'Caída ≥ 50% desde ATH O precio tocando SMA 200W → 30% del capital' },
        { id: 3, nombre: 'Zona Chandler', caida: 0.65, capital: 0.50, color: '#e53935', descripcion: 'Caída ≥ 65% desde ATH → 50% del capital' },
    ],
    color: '#7c4dff',
    colorAlerta: '#ff6d00',
};

export const TODOS_LOS_TICKERS = [
    ...ESTRATEGIA_A.tickers.map(t => ({ ticker: t, estrategia: 'A' })),
    ...ESTRATEGIA_B.tickers.map(t => ({ ticker: t, estrategia: 'B' })),
];

export const INFO_EMPRESAS = {
    'NVDA': { nombre: 'NVIDIA', sector: 'Semiconductores', divisa: 'USD' },
    'TSLA': { nombre: 'Tesla', sector: 'Vehículos Eléctricos', divisa: 'USD' },
    'META': { nombre: 'Meta Platforms', sector: 'Redes Sociales', divisa: 'USD' },
    'AMD': { nombre: 'AMD', sector: 'Semiconductores', divisa: 'USD' },
    'NFLX': { nombre: 'Netflix', sector: 'Streaming', divisa: 'USD' },
    'AAPL': { nombre: 'Apple', sector: 'Tecnología', divisa: 'USD' },
    'MSFT': { nombre: 'Microsoft', sector: 'Software', divisa: 'USD' },
    'GOOGL': { nombre: 'Alphabet (Google)', sector: 'Tecnología', divisa: 'USD' },
    'AMZN': { nombre: 'Amazon', sector: 'E-commerce / Cloud', divisa: 'USD' },
    'NKE': { nombre: 'Nike', sector: 'Consumo', divisa: 'USD' },
    'COST': { nombre: 'Costco', sector: 'Retail', divisa: 'USD' },
    'MC.PA': { nombre: 'LVMH', sector: 'Lujo', divisa: 'EUR' },
    'BRK-B': { nombre: 'Berkshire Hathaway', sector: 'Conglomerado', divisa: 'USD' },
    'V': { nombre: 'Visa', sector: 'Pagos', divisa: 'USD' },
};

export const COLORES = {
    fondo: '#0a0e1a',
    superficie: '#111827',
    tarjeta: '#1a1f35',
    tarjetaHover: '#222842',
    borde: '#2a3050',
    texto: '#e2e8f0',
    textoSecundario: '#94a3b8',
    acento: '#00d4ff',
    acentoVerde: '#10b981',
    acentoRojo: '#ef4444',
    acentoNaranja: '#f59e0b',
    acentoMorado: '#7c4dff',
    gradiente1: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)',
    gradiente2: 'linear-gradient(135deg, #00d4ff22 0%, #7c4dff22 100%)',
};

export const ACCIONES_RECOMENDADAS = {
    COMPRAR: { texto: '🟢 COMPRAR', color: '#10b981' },
    ESPERAR: { texto: '⏳ ESPERAR', color: '#94a3b8' },
    ZONA_SALIDA: { texto: '🎯 ZONA DE SALIDA', color: '#f59e0b' },
    ALERTA_MAXIMA: { texto: '🔴 ALERTA MÁXIMA', color: '#ef4444' },
};
