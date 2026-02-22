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

export default function StockTable({ stocks, titulo = 'Activos' }) {
    const [activeChart, setActiveChart] = useState(null);

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
                                        <div className="ticker-info">
                                            <span className="ticker-symbol">{stock.ticker}</span>
                                            <span className="ticker-name">{stock.nombre}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Precio */}
                                <td className="cell-price">
                                    {stock.divisa === 'EUR' ? '€' : '$'}{formatNum(stock.precioActual)}
                                </td>

                                {/* Cambio diario */}
                                <td className={`cell-change ${stock.cambioPct >= 0 ? 'text-green' : 'text-red'}`}>
                                    {formatPct(stock.cambioPct)}
                                </td>

                                {/* SMA 200 */}
                                <td className="cell-indicator text-muted">
                                    {stock.sma200 ? `${stock.divisa === 'EUR' ? '€' : '$'}${formatNum(stock.sma200)}` : '—'}
                                </td>

                                {/* Desviación SMA */}
                                <td className={`cell-indicator ${stock.desviacionSma200 < -15 ? 'text-red' : stock.desviacionSma200 < 0 ? 'text-orange' : 'text-green'}`}>
                                    {formatPct(stock.desviacionSma200)}
                                </td>

                                {/* ATH */}
                                <td className="cell-indicator text-muted">
                                    {stock.ath ? `${stock.divisa === 'EUR' ? '€' : '$'}${formatNum(stock.ath)}` : '—'}
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
                                    <span className={`action-badge ${getActionClass(stock.accion)}`}>
                                        {getActionLabel(stock.accion)}
                                    </span>
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
