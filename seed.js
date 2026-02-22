import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function seed() {
    try {
        console.log("Intentando crear whitelist...");
        await setDoc(doc(db, 'authorized_users', 'david.gomez.robledo@gmail.com'), {
            active: true,
            role: 'admin'
        });
        console.log("✅ Whitelist creada con éxito.");
    } catch (e) {
        console.error("❌ Error al crear whitelist:", e);
    }
}

seed();
