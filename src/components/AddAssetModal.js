'use client';

import { useState, useEffect, useRef } from 'react';

export default function AddAssetModal({ isOpen, onClose, onAdd }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
            setSelectedAsset(null);
            setDescripcion('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query || selectedAsset) {
            setResults([]);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            setLoading(true);
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
                    setLoading(false);
                });
        }, 500);

        return () => clearTimeout(debounceTimeout.current);
    }, [query, selectedAsset]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedAsset) {
            setLoading(true);
            await onAdd({
                ticker: selectedAsset.ticker,
                nombre: selectedAsset.nombre,
                descripcion: descripcion
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        ➕ Añadir Activo a Monitorear
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: 'var(--text-muted)',
                        fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem'
                    }}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="purchase-form">
                    {!selectedAsset ? (
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Buscar Activo (Ticker o Nombre)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Ej: AAPL, Tesla, SPY..."
                                autoFocus
                            />
                            {loading && (
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
                                            onClick={() => { setSelectedAsset(r); setResults([]); }}
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
                        </div>
                    ) : (
                        <>
                            <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{selectedAsset.ticker}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedAsset.nombre}</div>
                                </div>
                                <button type="button" onClick={() => { setSelectedAsset(null); setQuery(''); }} style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                                    padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem'
                                }}>Cambiar</button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción / Motivo (Opcional)</label>
                                <textarea
                                    className="form-input"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    placeholder="¿Por qué quieres monitorear este activo?"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Añadir al Panel General
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
