'use client';

import StockTable from './StockTable';

export default function StrategyPanel({ estrategia, stocks, tipo, currency = 'USD', exchangeRate = 0.95 }) {
    if (!estrategia) return null;

    const alertasActivas = stocks.filter(s => s.alerta && s.alerta.tipo.startsWith('ALERT_'));

    return (
        <div>
            {/* Cabecera de Estrategia */}
            <div className="strategy-header">
                <div className={`strategy-icon ${tipo.toLowerCase()}`}>
                    {tipo === 'A' ? '⚡' : '🏛️'}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 className="strategy-name">{estrategia.nombre}</h2>
                    <p className="strategy-desc">{estrategia.descripcion}</p>
                    <p className="strategy-desc" style={{ marginTop: 4 }}>
                        <strong>Horizonte:</strong> {estrategia.horizonte} &nbsp;|&nbsp;
                        <strong>Objetivo:</strong> {estrategia.objetivo}
                    </p>
                </div>
                {alertasActivas.length > 0 && (
                    <div style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                            {alertasActivas.length}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Alertas
                        </div>
                    </div>
                )}
            </div>

            {/* Reglas de la Estrategia */}
            <div className="strategy-rules">
                {tipo === 'A' ? (
                    <>
                        <p style={{ marginBottom: 8 }}>
                            <strong>📐 Regla de activación:</strong>{' '}
                            <code>Precio Actual &lt; SMA 200 × 0.80</code>
                        </p>
                        <p style={{ marginBottom: 4 }}>
                            <strong>Entrada:</strong> 50% del capital al activarse. Si cae un 10% adicional, el 50% restante.
                        </p>
                        <p>
                            <strong>Salida:</strong> Precio toca SMA 200 <strong>o</strong> +25% desde precio medio de compra.
                        </p>
                    </>
                ) : (
                    <>
                        <p style={{ marginBottom: 12 }}>
                            <strong>📐 Sistema de compra escalonada basado en caída desde ATH:</strong>
                        </p>
                        {estrategia.tramos.map(tramo => (
                            <p key={tramo.id} style={{ marginBottom: 6, paddingLeft: 16 }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 10, height: 10,
                                    borderRadius: 2,
                                    background: tramo.color,
                                    marginRight: 8,
                                    verticalAlign: 'middle',
                                }}></span>
                                <strong>{tramo.nombre}:</strong> {tramo.descripcion}
                            </p>
                        ))}
                        <p style={{ marginTop: 12 }}>
                            <strong>Venta:</strong> No se muestran señales de venta hasta que el precio supere el ATH previo.
                        </p>
                    </>
                )}
            </div>

            {/* Resumen */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-label">Activos</div>
                    <div className="summary-value" style={{ color: tipo === 'A' ? 'var(--accent-cyan)' : 'var(--accent-purple)' }}>
                        {stocks.length}
                    </div>
                </div>

                {tipo === 'A' ? (
                    <>
                        <div className="summary-card">
                            <div className="summary-label">Mayor Desviación SMA</div>
                            <div className="summary-value text-orange">
                                {stocks.length > 0
                                    ? `${Math.min(...stocks.map(s => s.desviacionSma200 || 0)).toFixed(1)}%`
                                    : '—'}
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">En Zona BNF</div>
                            <div className="summary-value text-red">
                                {stocks.filter(s => s.alerta?.tipo === 'ALERT_A').length}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="summary-card">
                            <div className="summary-label">Mayor Caída ATH</div>
                            <div className="summary-value text-orange">
                                {stocks.length > 0
                                    ? `-${Math.max(...stocks.map(s => s.caidaDesdeAth || 0)).toFixed(1)}%`
                                    : '—'}
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">En Tramo 1+</div>
                            <div className="summary-value text-orange">
                                {stocks.filter(s => s.tramo >= 1).length}
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Zona Chandler</div>
                            <div className="summary-value text-red">
                                {stocks.filter(s => s.tramo >= 3).length}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Tabla */}
            <StockTable
                stocks={stocks}
                titulo={`Activos — ${estrategia.nombre}`}
            />
        </div>
    );
}
