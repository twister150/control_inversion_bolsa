'use client';

import { useState } from 'react';
import MiniSparkline from './MiniSparkline';
import ChartModal from './ChartModal';

const formatNum = (n, decimals = 2) => {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatPct = (n) => {
    if (n == null || isNaN(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${Number(n).toFixed(2)}%`;
};

const EX_RATE = 0.95; // 1 USD = 0.95 EUR (Simulado)

const convert = (val, from, to) => {
    if (from === to) return val;
    if (from === 'USD' && to === 'EUR') return val * EX_RATE;
    if (from === 'EUR' && to === 'USD') return val / EX_RATE;
    return val;
};

function getActionClass(accion) {
    switch (accion) {
        case 'COMPRAR': return 'action-comprar';
        case 'ESPERAR': return 'action-esperar';
        case 'ZONA_SALIDA': return 'action-salida';
        case 'ALERTA_MAXIMA': return 'action-alerta';
        default: return 'action-esperar';
    }
}

function getActionLabel(accion) {
    switch (accion) {
        case 'COMPRAR': return '🟢 COMPRAR';
        case 'ESPERAR': return '⏳ ESPERAR';
        case 'ZONA_SALIDA': return '🎯 ZONA DE SALIDA';
        case 'ALERTA_MAXIMA': return '🔴 ALERTA MÁXIMA';
        default: return '⏳ ESPERAR';
    }
}

export default function StockTable({ stocks, titulo = 'Activos', currency = 'USD', onDelete = null }) {
    const [activeChart, setActiveChart] = useState(null);
    const [hoveredDescription, setHoveredDescription] = useState(null);

    if (!stocks || stocks.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <span className="empty-icon">📊</span>
                    <p className="empty-title">No hay datos disponibles</p>
                    <p className="empty-desc">Los datos se cargarán automáticamente al conectar con el mercado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-header">
                <h2 className="table-title">
                    📊 {titulo}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        ({stocks.length} activos)
                    </span>
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Activo</th>
                            <th>Precio</th>
                            <th>Cambio</th>
                            <th>SMA 200</th>
                            <th>% Dev SMA</th>
                            <th>ATH</th>
                            <th>% Caída ATH</th>
                            <th>Estrategia</th>
                            <th>Tramo</th>
                            <th>Gráfico 90d</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(stock => (
                            <tr key={stock.ticker}>
                                {/* Ticker */}
                                <td>
                                    <div className="cell-ticker">
                                        <div className={`ticker-avatar estrategia-${stock.estrategia?.toLowerCase()}`}>
                                            {stock.ticker.slice(0, 2)}
                                        </div>
                                        <div
                                            className="ticker-info"
                                            style={{ cursor: stock.descripcion ? 'help' : 'default', position: 'relative' }}
                                            onMouseEnter={() => stock.descripcion && setHoveredDescription(stock.ticker)}
                                            onMouseLeave={() => setHoveredDescription(null)}
                                            onClick={() => stock.descripcion && alert(`Motivo: ${stock.descripcion}`)}
                                            title={stock.descripcion ? `Motivo: ${stock.descripcion}` : ''}
                                        >
                                            <span className="ticker-symbol">{stock.ticker}</span>
                                            <span className="ticker-name">{stock.nombre}</span>

                                            {hoveredDescription === stock.ticker && stock.descripcion && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '100%',
                                                    left: 0,
                                                    marginBottom: '8px',
                                                    background: 'var(--bg-tertiary)',
                                                    border: '1px solid var(--accent-cyan)',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    zIndex: 999,
                                                    width: '240px',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.6)',
                                                    pointerEvents: 'none',
                                                    whiteSpace: 'normal',
                                                    lineHeight: '1.4',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        💡 Motivo del Monitoreo
                                                    </div>
                                                    {stock.descripcion}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Precio */}
                                <td className="cell-price">
                                    {currency === 'EUR' ? '€' : '$'}{formatNum(convert(stock.precioActual, stock.divisa, currency))}
                                </td>

                                {/* Cambio diario */}
                                <td className={`cell-change ${stock.cambioPct >= 0 ? 'text-green' : 'text-red'}`}>
                                    {formatPct(stock.cambioPct)}
                                </td>

                                {/* SMA 200 */}
                                <td className="cell-indicator text-muted">
                                    {stock.sma200 ? `${currency === 'EUR' ? '€' : '$'}${formatNum(convert(stock.sma200, stock.divisa, currency))}` : '—'}
                                </td>

                                {/* Desviación SMA */}
                                <td className={`cell-indicator ${stock.desviacionSma200 < -15 ? 'text-red' : stock.desviacionSma200 < 0 ? 'text-orange' : 'text-green'}`}>
                                    {formatPct(stock.desviacionSma200)}
                                </td>

                                {/* ATH */}
                                <td className="cell-indicator text-muted">
                                    {stock.ath ? `${currency === 'EUR' ? '€' : '$'}${formatNum(convert(stock.ath, stock.divisa, currency))}` : '—'}
                                </td>

                                {/* Caída desde ATH */}
                                <td className={`cell-indicator ${stock.caidaDesdeAth > 50 ? 'text-red' : stock.caidaDesdeAth > 30 ? 'text-orange' : stock.caidaDesdeAth > 10 ? 'text-muted' : 'text-green'}`}>
                                    {stock.caidaDesdeAth != null ? `-${formatNum(stock.caidaDesdeAth)}%` : '—'}
                                </td>

                                {/* Estrategia */}
                                <td>
                                    <span className={`badge badge-estrategia-${stock.estrategia?.toLowerCase()}`}>
                                        {stock.estrategia === 'A' ? '⚡ BNF' : '🏛️ Chandler'}
                                    </span>
                                </td>

                                {/* Tramo */}
                                <td>
                                    {stock.estrategia === 'B' ? (
                                        <span className={`badge-tramo badge-tramo-${stock.tramo || 0}`}>
                                            {stock.tramo ? (stock.tramo === 3 ? '🔴 T3' : `T${stock.tramo}`) : '—'}
                                        </span>
                                    ) : (
                                        <span className={`badge-tramo ${stock.alerta?.tipo === 'ALERT_A' ? 'badge-tramo-3' : 'badge-tramo-0'}`}>
                                            {stock.alerta?.tipo === 'ALERT_A' ? '⚡ BNF' : '—'}
                                        </span>
                                    )}
                                </td>

                                {/* Mini Sparkline */}
                                <td>
                                    {stock.datosGrafico && stock.datosGrafico.length > 5 && (
                                        <MiniSparkline
                                            data={stock.datosGrafico}
                                            color={stock.cambioPct >= 0 ? '#10b981' : '#ef4444'}
                                            onClick={() => setActiveChart({ ticker: stock.ticker, nombre: stock.nombre })}
                                        />
                                    )}
                                </td>

                                {/* Acción */}
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`action-badge ${getActionClass(stock.accion)}`} style={{ flex: 1, textAlign: 'center' }}>
                                            {getActionLabel(stock.accion)}
                                        </span>
                                        {onDelete && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => onDelete(stock.ticker)}
                                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                title="Eliminar de seguimiento"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ChartModal
                isOpen={!!activeChart}
                ticker={activeChart?.ticker}
                nombre={activeChart?.nombre}
                onClose={() => setActiveChart(null)}
            />
        </div>
    );
}
