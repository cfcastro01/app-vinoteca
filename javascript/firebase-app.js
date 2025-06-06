// Arquivo: javascript/firebase-app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
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

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exporta as instâncias e funções para serem usadas por outros módulos
export {
  db,
  auth,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc, // Adicionado para criar documentos de usuário
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
};

// Não há mais importação de 'app.js' aqui para evitar o ciclo.
// A lógica de redirecionamento baseada no estado de autenticação será movida ou ajustada nos arquivos app.js e login.js.