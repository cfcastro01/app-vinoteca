// Arquivo: javascript/firebase-app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeJGNcMC_IzZxnD7M3NCaIV0dIufqAbLI",
  authDomain: "app-vinoteca.firebaseapp.com",
  projectId: "app-vinoteca",
  storageBucket: "app-vinoteca.appspot.com",
  messagingSenderId: "791180809756",
  appId: "1:791180809756:web:186de6a87573a90180f1d9"
};


// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Injeta no window para o app.js acessar
window.db = db;
window.auth = auth;
window.firestoreFns = { collection, getDocs, addDoc, deleteDoc, doc, updateDoc };
window.authFns = {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
};
import('./app.js');

// Verifica autenticação após inicialização
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.userId = user.uid;
    window.winesCol = collection(db, 'users', user.uid, 'wines');
    
    // Redireciona se estiver na página de login
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'index.html';
    }
  } else {
    // Redireciona para login se não autenticado
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
  }
});