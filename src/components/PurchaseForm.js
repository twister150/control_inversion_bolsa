'use client';

import { useState, useEffect, useRef } from 'react';
import { TODOS_LOS_TICKERS, INFO_EMPRESAS, ESTRATEGIA_A, ESTRATEGIA_B } from '@/lib/constants';

export default function PurchaseForm({ onSubmit, onCancel }) {
    const [form, setForm] = useState({
        ticker: '',
        nombre: '',
        fechaCompra: new Date().toISOString().split('T')[0],
        precioCompra: '',
        divisa: 'USD',
        cantidad: '',
        estrategia: '',
        tramo: '',
        notas: '',
    });

    const [errors, setErrors] = useState({});

    // Búsqueda de Activos
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimeout = useRef(null);

    // Búsqueda de autocompletado para Ticker
    useEffect(() => {
        if (!query || form.ticker === query) {
            setResults([]);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            setIsSearching(true);
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    setResults(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error('Search error', err);
                    setResults([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 500);

        return () => clearTimeout(debounceTimeout.current);
    }, [query, form.ticker]);

    // Obtener precio histórico automáticamente
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);
    useEffect(() => {
        if (form.ticker && form.fechaCompra) {
            setIsFetchingPrice(true);
            fetch(`/api/price-at-date?ticker=${encodeURIComponent(form.ticker)}&date=${form.fechaCompra}`)
                .then(res => res.json())
                .then(data => {
                    if (data.precio != null) {
                        setForm(prev => ({
                            ...prev,
                            precioCompra: data.precio.toFixed(2),
                            divisa: data.currency || prev.divisa
                        }));
                        setErrors(prev => ({ ...prev, precioCompra: null }));
                    }
                })
                .catch(console.error)
                .finally(() => setIsFetchingPrice(false));
        }
    }, [form.ticker, form.fechaCompra]);

    const handleSelectAsset = (asset) => {
        setQuery(asset.ticker);
        setResults([]);

        let estrategia = 'CUSTOM';
        let tramo = '';

        // Auto-detectar si es parte de estrategia A o B
        const match = TODOS_LOS_TICKERS.find(t => t.ticker === asset.ticker);
        if (match) {
            estrategia = match.estrategia;
            if (match.estrategia === 'A') tramo = '';
        }

        setForm(prev => ({
            ...prev,
            ticker: asset.ticker,
            nombre: asset.nombre,
            estrategia,
            tramo
        }));

        if (errors.ticker) setErrors(prev => ({ ...prev, ticker: null }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.ticker) errs.ticker = 'Selecciona un activo';
        if (!form.fechaCompra) errs.fechaCompra = 'Fecha requerida';
        if (!form.precioCompra || Number(form.precioCompra) <= 0) errs.precioCompra = 'Precio inválido';
        if (!form.cantidad || Number(form.cantidad) <= 0) errs.cantidad = 'Cantidad inválida';
        if (!form.estrategia) errs.estrategia = 'Selecciona estrategia';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...form,
                precioCompra: Number(form.precioCompra),
                cantidad: Number(form.cantidad),
                tramo: form.tramo ? Number(form.tramo) : null,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="form-container" style={{ position: 'relative' }} onSubmit={handleSubmit}>
            <h3 className="form-title">📝 Registrar Nueva Compra</h3>

            <div className="form-grid">
                {/* Ticker (Searchable) */}
                <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Buscar Activo *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            if (form.ticker) setForm(prev => ({ ...prev, ticker: '' })); // clear ticker if typing
                        }}
                        placeholder="Ej: AAPL, BTC-USD, SAN.MC..."
                    />
                    {isSearching && (
                        <div style={{ position: 'absolute', right: 10, top: 40 }}>
                            <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        </div>
                    )}
                    {results.length > 0 && (
                        <div style={{
                            position: 'absolute', top: 75, left: 0, right: 0,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                            borderRadius: 6, zIndex: 50, maxHeight: 250, overflowY: 'auto',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}>
                            {results.map((r, idx) => (
                                <div
                                    key={`${r.ticker}-${idx}`}
                                    onClick={() => handleSelectAsset(r)}
                                    style={{
                                        padding: '10px 12px', cursor: 'pointer',
                                        borderBottom: idx < results.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{r.ticker}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.nombre} • {r.exchange}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {form.nombre && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                            ✅ Seleccionado: {form.nombre}
                        </div>
                    )}
                    {errors.ticker && <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{errors.ticker}</span>}
                </div>

                {/* Fecha */}
                <div className="form-group">
                    <label className="form-label">Fecha de Compra *</label>
                    <input
                        type="date"
                        name="fechaCompra"
                        value={form.fechaCompra}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.fechaCompra && <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{errors.fechaCompra}</span>}
                </div>

                {/* Precio y Divisa agrupados */}
                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Precio de Compra *</span>
                        {isFetchingPrice && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>Buscando...</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            name="divisa"
                            value={form.divisa}
                            onChange={handleChange}
                            className="form-select"
                            style={{ flex: '0 0 80px' }}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                        <input
                            type="number"
                            name="precioCompra"
                            value={form.precioCompra}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="form-input"
                            style={{ flex: 1 }}
                        />
                    </div>
                    {errors.precioCompra && <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{errors.precioCompra}</span>}
                </div>

                {/* Cantidad */}
                <div className="form-group">
                    <label className="form-label">Cantidad (acciones/unidades) *</label>
                    <input
                        type="number"
                        name="cantidad"
                        value={form.cantidad}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.0001"
                        min="0"
                        className="form-input"
                    />
                    {errors.cantidad && <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{errors.cantidad}</span>}
                </div>

                {/* Estrategia */}
                <div className="form-group">
                    <label className="form-label">Estrategia *</label>
                    <select
                        name="estrategia"
                        value={form.estrategia}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">Seleccionar…</option>
                        <option value="A">⚡ Estrategia A — Cazador de Pánico</option>
                        <option value="B">🏛️ Estrategia B — Bóveda Chandler</option>
                        <option value="CUSTOM">👤 Activo Personal / Fuera de Sistema</option>
                    </select>
                    {errors.estrategia && <span style={{ color: 'var(--accent-red)', fontSize: '0.7rem' }}>{errors.estrategia}</span>}
                </div>

                {/* Tramo (solo para B) */}
                {form.estrategia === 'B' && (
                    <div className="form-group">
                        <label className="form-label">Tramo</label>
                        <select
                            name="tramo"
                            value={form.tramo}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Sin tramo</option>
                            <option value="1">Tramo 1 — Caída ≥ 30%</option>
                            <option value="2">Tramo 2 — Caída ≥ 50%</option>
                            <option value="3">Zona Chandler — Caída ≥ 65%</option>
                        </select>
                    </div>
                )}

                {/* Notas */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Notas (opcional)</label>
                    <input
                        type="text"
                        name="notas"
                        value={form.notas}
                        onChange={handleChange}
                        placeholder="Motivo de la compra, contexto de mercado…"
                        className="form-input"
                    />
                </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando…' : '✅ Registrar Compra'}
                </button>
            </div>
        </form>
    );
}
