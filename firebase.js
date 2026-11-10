// Conexión con Firebase (datos y usuarios). No hace falta tocar este archivo.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const fs = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true
});

window.__fbResolve({
  onAuth: cb => onAuthStateChanged(auth, cb),
  login: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
  reset: email => sendPasswordResetEmail(auth, email),
  logout: () => signOut(auth),
  // Escucha una colección; funciona sin internet con los datos guardados en el teléfono.
  listen(col, next, err) {
    return onSnapshot(collection(fs, col), { includeMetadataChanges: true },
      snap => next(snap.docs.map(d => ({ id: d.id, ...d.data() })), { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites }),
      err);
  },
  // Guarda sin esperar a la nube: sin señal queda en el teléfono y se sube cuando vuelve internet.
  write(col, id, data, onErr) {
    const ref = id ? doc(fs, col, id) : doc(collection(fs, col));
    setDoc(ref, data).catch(onErr);
    return ref.id;
  },
  remove(col, id, onErr) { deleteDoc(doc(fs, col, id)).catch(onErr); }
});
