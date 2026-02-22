// ═══════════════════════════════════════════════════════════
// PERSISTENCIA EN FIRESTORE (Multipropiedad)
// ═══════════════════════════════════════════════════════════

import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    getDoc,
    updateDoc
} from 'firebase/firestore';

// ── Compras del usuario ──────────────────────────────────

export async function obtenerCompras(uid) {
    if (!uid) return [];
    try {
        const q = query(collection(db, 'users', uid, 'purchases'), orderBy('fechaRegistro', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener compras:", error);
        return [];
    }
}

export async function agregarCompra(uid, compra) {
    if (!uid) return null;
    try {
        const docRef = await addDoc(collection(db, 'users', uid, 'purchases'), {
            ...compra,
            fechaRegistro: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error al agregar compra:", error);
        throw error;
    }
}

export async function eliminarCompra(uid, purchaseId) {
    if (!uid || !purchaseId) return;
    try {
        await deleteDoc(doc(db, 'users', uid, 'purchases', purchaseId));
    } catch (error) {
        console.error("Error al eliminar compra:", error);
        throw error;
    }
}

// ── Activos Personalizados ──────────────────────────────

export async function obtenerCustomAssets(uid) {
    if (!uid) return [];
    try {
        const querySnapshot = await getDocs(collection(db, 'users', uid, 'custom_assets'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener custom assets:", error);
        return [];
    }
}

export async function guardarCustomAsset(uid, asset) {
    if (!uid) return;
    try {
        // Usamos el ticker como ID para evitar duplicados fácilmente
        await setDoc(doc(db, 'users', uid, 'custom_assets', asset.ticker), {
            ...asset,
            estrategia: 'CUSTOM',
            fechaRegistro: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error al guardar custom asset:", error);
        throw error;
    }
}

// ── Tickers desactivados (Obsolescencia) ────────────────

export async function obtenerDesactivados(uid) {
    if (!uid) return [];
    try {
        const docSnap = await getDoc(doc(db, 'users', uid, 'settings', 'obsolescence'));
        if (docSnap.exists()) {
            return docSnap.data().tickers || [];
        }
        return [];
    } catch (error) {
        console.error("Error al obtener desactivados:", error);
        return [];
    }
}

export async function toggleDesactivado(uid, ticker) {
    if (!uid) return [];
    try {
        const current = await obtenerDesactivados(uid);
        const index = current.indexOf(ticker);
        let updated;
        if (index >= 0) {
            updated = current.filter(t => t !== ticker);
        } else {
            updated = [...current, ticker];
        }
        await setDoc(doc(db, 'users', uid, 'settings', 'obsolescence'), { tickers: updated });
        return updated;
    } catch (error) {
        console.error("Error al toggle desactivado:", error);
        throw error;
    }
}

// ── Historial de alertas ─────────────────────────────────

export async function obtenerHistorialAlertas(uid) {
    if (!uid) return [];
    try {
        const q = query(collection(db, 'users', uid, 'alerts'), orderBy('fecha', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener historial de alertas:", error);
        return [];
    }
}

export async function registrarAlerta(uid, alerta) {
    if (!uid) return;
    try {
        // En Firestore, la lógica de duplicados es opcional o se puede manejar aquí
        await addDoc(collection(db, 'users', uid, 'alerts'), {
            ...alerta,
            fecha: new Date().toISOString(),
            leida: false
        });
    } catch (error) {
        console.error("Error al registrar alerta:", error);
    }
}
