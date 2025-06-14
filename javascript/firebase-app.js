// Arquivo: javascript/firebase-app.js

/*
  -----------------------------------------------------------------------------
  Importações de Módulos Firebase
  -----------------------------------------------------------------------------
  Este bloco importa as funções e serviços necessários do Firebase SDK.
*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc // <--- ESSA LINHA PRECISA SER IMPORTADA AQUI
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

/*
  -----------------------------------------------------------------------------
  Configuração do Projeto Firebase
  -----------------------------------------------------------------------------
  Obtenha estas credenciais do seu console do Firebase.
*/
const firebaseConfig = {
  apiKey: "AIzaSyBeJGNcMC_IzZxnD7M3NCaIV0dIufqAbLI",
  authDomain: "app-vinoteca.firebaseapp.com",
  projectId: "app-vinoteca",
  storageBucket: "app-vinoteca.appspot.com",
  messagingSenderId: "791180809756",
  appId: "1:791180809756:web:186de6a87573a90180f1d9"
};

/*
  -----------------------------------------------------------------------------
  Inicialização dos Serviços Firebase
  -----------------------------------------------------------------------------
  Aqui, as instâncias do aplicativo Firebase, Firestore e Authentication são criadas.
*/
const app = initializeApp(firebaseConfig); // Inicializa o app Firebase principal
const db = getFirestore(app); // Obtém a instância do Firestore Database
const auth = getAuth(app); // Obtém a instância do Firebase Authentication

/*
  -----------------------------------------------------------------------------
  Exportação de Módulos e Funções
  -----------------------------------------------------------------------------
  Estas exportações tornam as instâncias e funções do Firebase disponíveis
  para outros arquivos JavaScript no projeto (ex: app.js, login.js).
*/
export {
  db, // Instância do Firestore
  auth, // Instância do Authentication
  collection, // Função para referenciar coleções no Firestore
  getDocs, // Função para buscar múltiplos documentos de uma coleção
  addDoc, // Função para adicionar um novo documento a uma coleção
  deleteDoc, // Função para deletar um documento específico
  doc, // Função para referenciar um documento específico
  updateDoc, // Função para atualizar campos de um documento existente
  setDoc, // Função para criar ou sobrescrever um documento
  getDoc, // <--- NOVA EXPORTAÇÃO: getDoc para buscar um único documento
  onAuthStateChanged, // Listener para mudanças no estado de autenticação
  signInWithEmailAndPassword, // Função para login com e-mail e senha
  createUserWithEmailAndPassword, // Função para criar conta com e-mail e senha
  signOut, // Função para fazer logout
  signInWithPopup, // Função para login com provedores de popup (ex: Google)
  GoogleAuthProvider // Provedor de autenticação Google
};

/*
  -----------------------------------------------------------------------------
  Observações Finais
  -----------------------------------------------------------------------------
  Não há mais importação de 'app.js' aqui para evitar o ciclo de dependências.
  A lógica de redirecionamento baseada no estado de autenticação será tratada
  diretamente em 'app.js' e 'login.js', utilizando 'onAuthStateChanged'.
*/
