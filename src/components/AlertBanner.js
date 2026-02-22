'use client';

export default function AlertBanner({ alerta, onDismiss }) {
    if (!alerta) return null;

    const iconos = {
        ALERT_A: '⚡',
        ALERT_B_1: '🔶',
        ALERT_B_2: '🔴',
        ALERT_B_3: '🚨',
        WATCH_A: '👁️',
        WATCH_B: '👁️',
    };

    const titulos = {
        ALERT_A: 'ZONA BNF DETECTADA',
        ALERT_B_1: 'TRAMO 1 ACTIVO',
        ALERT_B_2: 'TRAMO 2 ACTIVO',
        ALERT_B_3: 'ZONA CHANDLER ACTIVA',
        WATCH_A: 'EN VIGILANCIA BNF',
        WATCH_B: 'EN VIGILANCIA CHANDLER',
    };

    return (
        <div className={`alert-banner ${alerta.severidad}`}>
            <span className="alert-icon">{iconos[alerta.tipo] || '📢'}</span>
            <div className="alert-content">
                <div className="alert-title" style={{ color: alerta.severidad === 'critica' ? 'var(--accent-red)' : alerta.severidad === 'alta' ? 'var(--accent-orange)' : 'var(--accent-cyan)' }}>
                    {titulos[alerta.tipo] || alerta.tipo}
                </div>
                <div className="alert-message">{alerta.mensaje}</div>
                {alerta.capitalSugerido && (
                    <div className="alert-message" style={{ marginTop: 4, color: 'var(--accent-orange)' }}>
                        Capital sugerido: {alerta.capitalSugerido}
                    </div>
                )}
            </div>
            <button className="alert-dismiss" onClick={onDismiss} title="Descartar">
                ✕
            </button>
        </div>
    );
}
