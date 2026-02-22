import { agregarCompra, guardarCustomAsset, toggleDesactivado } from './storage';

export async function migrateFromLocalStorage(uid) {
    if (typeof window === 'undefined') return;

    const isMigrated = localStorage.getItem('fear_arbitrage_migrated');
    if (isMigrated === 'true') return;

    console.log("Iniciando migración de localStorage a Firestore...");

    try {
        // 1. Migrar Compras
        const compras = JSON.parse(localStorage.getItem('fear_arbitrage_purchases') || localStorage.getItem('fear_arbitrage_compras') || '[]');
        for (const compra of compras) {
            await agregarCompra(uid, compra);
        }

        // 2. Migrar Custom Assets
        const customAssets = JSON.parse(localStorage.getItem('fear_arbitrage_custom_assets') || '[]');
        for (const asset of customAssets) {
            await guardarCustomAsset(uid, asset);
        }

        // 3. Migrar Tickers Desactivados
        const desactivados = JSON.parse(localStorage.getItem('fear_arbitrage_desactivados') || '[]');
        for (const ticker of desactivados) {
            await toggleDesactivado(uid, ticker);
        }

        localStorage.setItem('fear_arbitrage_migrated', 'true');
        console.log("Migración completada con éxito.");
        return true;
    } catch (error) {
        console.error("Error durante la migración:", error);
        return false;
    }
}
