'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { obtenerCustomAssets, guardarCustomAsset, obtenerCompras } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import AlertBanner from '@/components/AlertBanner';
import StrategyPanel from '@/components/StrategyPanel';
import Portfolio from '@/components/Portfolio';
import Instrucciones from '@/components/Instrucciones';
import AddAssetModal from '@/components/AddAssetModal';
import { ESTRATEGIA_A, ESTRATEGIA_B } from '@/lib/constants';

const TABS = [
    { id: 'general', label: 'Panel General', emoji: '📊' },
    { id: 'estrategia_a', label: 'Cazador de Pánico', emoji: '⚡' },
    { id: 'estrategia_b', label: 'Bóveda Chandler', emoji: '🏛️' },
    { id: 'portfolio', label: 'Mi Portfolio', emoji: '💼' },
    { id: 'instrucciones', label: 'Instrucciones', emoji: '📖' },
];

export default function Home() {
    const { user } = useAuth();
    const [tab, setTab] = useState('general');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertasDismissed, setAlertasDismissed] = useState([]);
    const [customAssets, setCustomAssets] = useState([]);
    const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);

    const fetchData = useCallback(async (assetsToFetch) => {
        try {
            setLoading(true);
            setError(null);
            let url = '/api/stocks';
            if (assetsToFetch && assetsToFetch.length > 0) {
                url += `?custom=${encodeURIComponent(JSON.stringify(assetsToFetch))}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCustomData = useCallback(async () => {
        if (!user?.uid) return;

        const savedCustom = await obtenerCustomAssets(user.uid);
        const compras = await obtenerCompras(user.uid);

        const allCustomMap = new Map();
        savedCustom.forEach(c => allCustomMap.set(c.ticker, c));

        compras.forEach(c => {
            if (c.estrategia === 'CUSTOM' && !allCustomMap.has(c.ticker)) {
                allCustomMap.set(c.ticker, { ticker: c.ticker, nombre: c.nombre || c.ticker, estrategia: 'CUSTOM' });
            }
        });

        const combinedCustom = Array.from(allCustomMap.values());
        setCustomAssets(combinedCustom);
        fetchData(combinedCustom);
    }, [user?.uid, fetchData]);

    useEffect(() => {
        loadCustomData();

        window.addEventListener('purchase_added', loadCustomData);
        const interval = setInterval(loadCustomData, 15 * 60 * 1000);

        return () => {
            window.removeEventListener('purchase_added', loadCustomData);
            clearInterval(interval);
        };
    }, [loadCustomData]);

    const handleAddCustomAsset = async (asset) => {
        if (!user?.uid) return;

        await guardarCustomAsset(user.uid, asset);
        await loadCustomData();
    };

    const stocksA = data?.stocks?.filter(s => s.estrategia === 'A') || [];
    const stocksB = data?.stocks?.filter(s => s.estrategia === 'B') || [];
    const alertasActivas = (data?.alertasActivas || []).filter(
        a => !alertasDismissed.includes(`${a.tipo}_${a.ticker}`)
    );

    const handleDismissAlert = (alerta) => {
        setAlertasDismissed(prev => [...prev, `${alerta.tipo}_${alerta.ticker}`]);
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="app-container">
            {/* ── Header ──────────────────────────────── */}
            <header className="app-header">
                <div className="header-brand">
                    <div className="header-logo">📉</div>
                    <div>
                        <h1 className="header-title">Arbitraje del Miedo</h1>
                        <p className="header-subtitle">Sistema de Monitoreo Bursátil</p>
                    </div>
                </div>
                <div className="header-meta">
                    <div className="header-status">
                        <span className="status-dot"></span>
                        {loading ? 'CARGANDO DATOS…' : 'MERCADO ACTIVO'}
                    </div>
                    {data?.ultimaActualizacion && (
                        <span className="header-update">
                            V2 • {formatDate(data.ultimaActualizacion)}
                        </span>
                    )}
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            if (window.confirm('¿Cerrar sesión?')) {
                                logout();
                            }
                        }}
                        style={{ padding: '4px 12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}
                    >
                        Salir 🚪
                    </button>
                </div>
            </header>

            {/* ── Alertas Activas ─────────────────────── */}
            {alertasActivas.map((alerta, i) => (
                <AlertBanner
                    key={`${alerta.tipo}_${alerta.ticker}_${i}`}
                    alerta={alerta}
                    onDismiss={() => handleDismissAlert(alerta)}
                />
            ))}

            {/* ── Tabs ────────────────────────────────── */}
            <nav className="tabs-container">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`tab-button ${tab === t.id ? 'active' : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.emoji} {t.label}
                        {t.id === 'general' && alertasActivas.length > 0 && (
                            <span className="tab-badge">{alertasActivas.length}</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Content ─────────────────────────────── */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Cargando datos del mercado…</p>
                    <p className="loading-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Calculando indicadores para {ESTRATEGIA_A.tickers.length + ESTRATEGIA_B.tickers.length} activos
                    </p>
                </div>
            ) : error ? (
                <div className="loading-container">
                    <p style={{ fontSize: '2rem' }}>⚠️</p>
                    <p className="loading-text">Error al cargar datos: {error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>
                        🔄 Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {tab === 'general' && (
                        <>
                            {/* Resumen */}
                            <div className="summary-grid">
                                <div className="summary-card">
                                    <div className="summary-label">Activos Monitoreados</div>
                                    <div className="summary-value text-cyan">{data.totalActivos}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Alertas Activas</div>
                                    <div className={`summary-value ${alertasActivas.length > 0 ? 'text-red' : 'text-green'}`}>
                                        {alertasActivas.length}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Estrategia A (BNF)</div>
                                    <div className="summary-value text-cyan">{stocksA.length}</div>
                                    <div className="summary-change text-muted">Rebotes rápidos</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Estrategia B (Chandler)</div>
                                    <div className="summary-value text-purple">{stocksB.length}</div>
                                    <div className="summary-change text-muted">Largo plazo</div>
                                </div>
                            </div>

                            {/* Tabla General */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '2rem' }}>
                                <h2 className="table-title" style={{ margin: 0 }}>
                                    📊 Todos los Activos
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                                        ({data.stocks.length} activos)
                                    </span>
                                </h2>
                                <button className="btn btn-primary" onClick={() => setIsAddAssetOpen(true)}>
                                    ➕ Añadir Activo
                                </button>
                            </div>
                            <StockTable stocks={data.stocks} titulo="Todos los Activos" />
                        </>
                    )}

                    {tab === 'estrategia_a' && (
                        <StrategyPanel
                            estrategia={ESTRATEGIA_A}
                            stocks={stocksA}
                            tipo="A"
                        />
                    )}

                    {tab === 'estrategia_b' && (
                        <StrategyPanel
                            estrategia={ESTRATEGIA_B}
                            stocks={stocksB}
                            tipo="B"
                        />
                    )}

                    {tab === 'portfolio' && (
                        <Portfolio stocks={data.stocks} />
                    )}

                    {tab === 'instrucciones' && (
                        <Instrucciones />
                    )}

                    <AddAssetModal
                        isOpen={isAddAssetOpen}
                        onClose={() => setIsAddAssetOpen(false)}
                        onAdd={handleAddCustomAsset}
                    />
                </>
            )}
        </div>
    );
}
