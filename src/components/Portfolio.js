'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { obtenerCompras, agregarCompra, eliminarCompra } from '@/lib/storage';
import { TODOS_LOS_TICKERS, INFO_EMPRESAS, ESTRATEGIA_B } from '@/lib/constants';
import PurchaseForm from './PurchaseForm';
import { useAuth } from './AuthContext';

const formatNum = (n, decimals = 2) => {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const EX_RATE = 0.95; // 1 USD = 0.95 EUR (Simulado)

const convert = (val, from, to) => {
    if (from === to) return val;
    if (from === 'USD' && to === 'EUR') return val * EX_RATE;
    if (from === 'EUR' && to === 'USD') return val / EX_RATE;
    return val;
};

export default function Portfolio({ stocks, currency = 'USD' }) {
    const { user } = useAuth();
    const [compras, setCompras] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        const data = await obtenerCompras(user.uid);
        setCompras(data);
        setLoading(false);
    }, [user?.uid]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleNewPurchase = async (compra) => {
        if (!user?.uid) return;
        await agregarCompra(user.uid, compra);
        await loadData();
        setShowForm(false);
        // Dispatch custom event to trigger custom asset refresh in page.js
        window.dispatchEvent(new Event('purchase_added'));
    };

    const handleDelete = async (id) => {
        if (!user?.uid) return;
        if (window.confirm('¿Eliminar esta operación?')) {
            await eliminarCompra(user.uid, id);
            await loadData();
        }
    };

    // Enriquecer compras con datos actuales
    const comprasEnriquecidas = useMemo(() => {
        return compras.map(compra => {
            const stockData = stocks?.find(s => s.ticker === compra.ticker);
            const precioActual = stockData?.precioActual || 0;
            const precioCompra = Number(compra.precioCompra) || 0;
            const cantidad = Number(compra.cantidad) || 0;

            const capitalInvertido = precioCompra * cantidad;
            const valorActual = precioActual * cantidad;
            const rendimiento = capitalInvertido > 0 ? ((valorActual - capitalInvertido) / capitalInvertido) * 100 : 0;
            const ganancia = valorActual - capitalInvertido;

            const fechaCompra = new Date(compra.fechaCompra);
            const hoy = new Date();
            const diasEnMercado = Math.floor((hoy - fechaCompra) / (1000 * 60 * 60 * 24));

            return {
                ...compra,
                precioActual,
                capitalInvertido,
                valorActual,
                rendimiento,
                ganancia,
                diasEnMercado,
                divisa: compra.divisa || stockData?.divisa || 'USD',
                nombre: compra.nombre || INFO_EMPRESAS[compra.ticker]?.nombre || compra.ticker,
            };
        });
    }, [compras, stocks]);

    // Estadísticas agregadas
    const stats = useMemo(() => {
        const totalInvertido = comprasEnriquecidas.reduce((sum, c) => sum + convert(c.capitalInvertido, c.divisa, currency), 0);
        const valorTotal = comprasEnriquecidas.reduce((sum, c) => sum + convert(c.valorActual, c.divisa, currency), 0);
        const gananciaTotal = valorTotal - totalInvertido;
        const rendimientoTotal = totalInvertido > 0 ? (gananciaTotal / totalInvertido) * 100 : 0;

        const mejor = comprasEnriquecidas.reduce((best, c) => (!best || c.rendimiento > best.rendimiento) ? c : best, null);
        const peor = comprasEnriquecidas.reduce((worst, c) => (!worst || c.rendimiento < worst.rendimiento) ? c : worst, null);

        return { totalInvertido, valorTotal, gananciaTotal, rendimientoTotal, mejor, peor };
    }, [comprasEnriquecidas]);

    return (
        <div>
            {/* Estadísticas del Portfolio */}
            <div className="portfolio-stats">
                <div className="stat-card highlight">
                    <div className="stat-label">Capital Invertido</div>
                    <div className="stat-value text-cyan">
                        {currency === 'EUR' ? '€' : '$'}{formatNum(stats.totalInvertido)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Valor Actual</div>
                    <div className="stat-value" style={{ color: stats.gananciaTotal >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {currency === 'EUR' ? '€' : '$'}{formatNum(stats.valorTotal)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">P&L No Realizado</div>
                    <div className="stat-value" style={{ color: stats.gananciaTotal >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {stats.gananciaTotal >= 0 ? '+' : ''}{currency === 'EUR' ? '€' : '$'}{formatNum(stats.gananciaTotal)}
                        <span style={{ fontSize: '0.8rem', marginLeft: 6, opacity: 0.8 }}>
                            ({stats.rendimientoTotal >= 0 ? '+' : ''}{stats.rendimientoTotal.toFixed(2)}%)
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Operaciones</div>
                    <div className="stat-value text-purple">
                        {comprasEnriquecidas.length}
                    </div>
                </div>
            </div>

            {/* Mejor / Peor */}
            {comprasEnriquecidas.length > 0 && (
                <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 24 }}>
                    <div className="summary-card">
                        <div className="summary-label">🏆 Mejor Posición</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.mejor?.ticker}</span>
                            <span className="text-green" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                +{stats.mejor?.rendimiento?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">📉 Peor Posición</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.peor?.ticker}</span>
                            <span className="text-red" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {stats.peor?.rendimiento?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón para nueva compra */}
            <div style={{ marginBottom: 20 }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ Cerrar' : '+ Registrar Compra'}
                </button>
            </div>

            {/* Formulario */}
            {showForm && (
                <PurchaseForm
                    onSubmit={handleNewPurchase}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Tabla de Operaciones */}
            {comprasEnriquecidas.length === 0 ? (
                <div className="table-container">
                    <div className="empty-state">
                        <span className="empty-icon">💼</span>
                        <p className="empty-title">Sin operaciones registradas</p>
                        <p className="empty-desc">
                            Registra tus compras para hacer seguimiento del rendimiento real de tu portfolio.
                            El sistema calculará automáticamente las ganancias y pérdidas.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header">
                        <h2 className="table-title">💼 Mis Operaciones</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>Activo</th>
                                    <th>Estrategia</th>
                                    <th>Tramo</th>
                                    <th>Fecha Compra</th>
                                    <th>Precio Compra</th>
                                    <th>Cantidad</th>
                                    <th>Capital Invertido</th>
                                    <th>Precio Actual</th>
                                    <th>Valor Actual</th>
                                    <th>Rendimiento</th>
                                    <th>Días</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {comprasEnriquecidas.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="cell-ticker">
                                                <div className={`ticker-avatar estrategia-${c.estrategia?.toLowerCase()}`}>
                                                    {c.ticker.slice(0, 2)}
                                                </div>
                                                <div className="ticker-info">
                                                    <span className="ticker-symbol">{c.ticker}</span>
                                                    <span className="ticker-name">{c.nombre}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-estrategia-${c.estrategia?.toLowerCase()}`}>
                                                {c.estrategia === 'A' ? '⚡ BNF' : '🏛️ Chandler'}
                                            </span>
                                        </td>
                                        <td>
                                            {c.tramo ? (
                                                <span className={`badge-tramo badge-tramo-${c.tramo}`}>T{c.tramo}</span>
                                            ) : '—'}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                            {new Date(c.fechaCompra).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="cell-price">
                                            {currency === 'EUR' ? '€' : '$'}{formatNum(convert(c.precioCompra, c.divisa, currency))}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{c.cantidad}</td>
                                        <td className="cell-price">
                                            {currency === 'EUR' ? '€' : '$'}{formatNum(convert(c.capitalInvertido, c.divisa, currency))}
                                        </td>
                                        <td className="cell-price">
                                            {currency === 'EUR' ? '€' : '$'}{formatNum(convert(c.precioActual, c.divisa, currency))}
                                        </td>
                                        <td className="cell-price" style={{ color: c.ganancia >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {currency === 'EUR' ? '€' : '$'}{formatNum(convert(c.valorActual, c.divisa, currency))}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: 700,
                                                color: c.rendimiento >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                                            }}>
                                                {c.rendimiento >= 0 ? '+' : ''}{c.rendimiento.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {c.diasEnMercado}d
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                onClick={() => handleDelete(c.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
