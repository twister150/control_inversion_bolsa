'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RANGOS = [
    { id: '1mo', label: '1M' },
    { id: '3mo', label: '3M' },
    { id: '6mo', label: '6M' },
    { id: '1y', label: '1A' },
    { id: '5y', label: '5A' },
    { id: 'max', label: 'Histórico' }
];

export default function ChartModal({ isOpen, onClose, ticker, nombre }) {
    const [range, setRange] = useState('5y');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !ticker) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&range=${range}`)
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar datos');
                return res.json();
            })
            .then(json => {
                if (isMounted) {
                    if (json.error) throw new Error(json.error);
                    setData(json.data || []);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [isOpen, ticker, range]);

    if (!isOpen) return null;

    // Calcular min/max para el dominio del YAxis dando un margen
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            {ticker}
                        </h2>
                        {nombre && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{nombre}</p>}
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: 'var(--text-muted)',
                        fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem'
                    }}>
                        ✕
                    </button>
                </div>

                {/* Selectores de rango */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {RANGOS.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setRange(r.id)}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '100px',
                                border: '1px solid',
                                borderColor: range === r.id ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                                background: range === r.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                                color: range === r.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* El Gráfico */}
                <div style={{ width: '100%', height: 400, position: 'relative' }}>
                    {loading && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.5)', zIndex: 10
                        }}>
                            <div className="loading-spinner" style={{ width: 30, height: 30, borderWidth: 3 }}></div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)'
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && data.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => {
                                        if (range === '1mo' || range === '3mo') return val.slice(8, 10) + '/' + val.slice(5, 7);
                                        return val.slice(0, 4);
                                    }}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    domain={[minPrice, maxPrice]}
                                    tickFormatter={(val) => '$' + val.toFixed(0)}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                    itemStyle={{ color: 'var(--accent-cyan)' }}
                                    labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                                    formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Precio']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="close"
                                    stroke="var(--accent-cyan)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    animationDuration={500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
