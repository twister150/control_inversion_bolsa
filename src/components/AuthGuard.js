'use client';

import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }) {
    const { user, loading, isAuthorized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                if (pathname !== '/login') {
                    router.push('/login');
                }
            } else if (!isAuthorized) {
                // User is logged in but not authorized (whitelist)
                if (pathname !== '/unauthorized' && pathname !== '/login') {
                    router.push('/unauthorized');
                }
            } else {
                // User is authorized, if they are on login or unauthorized, send to dashboard
                if (pathname === '/login' || pathname === '/unauthorized') {
                    router.push('/');
                }
            }
        }
    }, [user, loading, isAuthorized, router, pathname]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Verificando sesión…</p>
            </div>
        );
    }

    return children;
}
