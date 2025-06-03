// Arquivo: javascript/firebase-app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

// Injeta no window para o app.js acessar
window.db = db;
window.firestoreFns = { collection, getDocs, addDoc, deleteDoc, doc, updateDoc };

// Torna o db e funções acessíveis para app.js
import('./app.js'); // importa o app depois que Firebase estiver pronto