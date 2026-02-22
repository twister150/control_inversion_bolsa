'use client';

import { useAuth } from '@/components/AuthContext';

export default function UnauthorizedPage() {
    const { logout, user } = useAuth();

    return (
        <div className="loading-container" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="summary-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--accent-red)' }}>Acceso Denegado</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Tu cuenta (<strong>{user?.email}</strong>) no está autorizada para acceder a este panel.
                </p>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Por favor, contacta con el administrador para solicitar acceso o utiliza una cuenta diferente.
                </p>

                <button
                    className="btn btn-ghost"
                    onClick={logout}
                    style={{ width: '100%' }}
                >
                    Cerrar Sesión / Cambiar Cuenta
                </button>
            </div>
        </div>
    );
}
