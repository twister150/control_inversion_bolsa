import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export const metadata = {
    title: 'Arbitraje del Miedo — Sistema de Monitoreo Bursátil',
    description: 'Detecta caídas extremas y anomalías estadísticas en empresas líderes mundiales. Convierte el pánico del mercado en ventaja matemática.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <AuthProvider>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </AuthProvider>
            </body>
        </html>
    );
}
