'use client';

import { useAuth } from '@/components/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await login();
        } catch (err) {
            setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="loading-container" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="header-brand" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
                <div className="header-logo" style={{ fontSize: '3rem' }}>📉</div>
                <div style={{ textAlign: 'left' }}>
                    <h1 className="header-title" style={{ fontSize: '2rem' }}>Arbitraje del Miedo</h1>
                    <p className="header-subtitle">Acceso Restringido</p>
                </div>
            </div>

            <div className="summary-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Iniciar Sesión</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Solo los usuarios autorizados por el administrador pueden acceder al sistema de monitoreo.
                </p>

                {error && (
                    <div style={{ color: 'var(--accent-red)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    {loading ? (
                        <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.48,16.68 6.48,13.5C6.48,10.31 9.03,7.74 12.18,7.74C13.9,7.74 15.6,8.36 16.67,9.35L18.73,7.3C17.21,5.83 15.1,5 12.18,5C7.5,5 3.68,8.81 3.68,13.5C3.68,18.19 7.5,22 12.18,22C16.88,22 21.39,18.66 21.39,13.5C21.39,12.7 21.39,11.73 21.35,11.1Z" />
                            </svg>
                            Entrar con Google
                        </>
                    )}
                </button>
            </div>

            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by Firebase & Vercel
            </p>
        </div>
    );
}
