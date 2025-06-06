// Arquivo: javascript/login.js
import {
  auth,
  db, // Importe db para interagir com Firestore
  collection, // Importe collection
  setDoc, // Importe setDoc para adicionar dados do usuário
  doc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged // Para redirecionar se já estiver logado
} from "./firebase-app.js"; // Importe do seu firebase-app.js

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const googleBtn = document.querySelector('.google-button');

  // Verifica o estado de autenticação ao carregar a página de login
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Se o usuário já estiver logado, redireciona para a página principal
      window.location.href = 'index.html';
    }
  });

  // LOGIN
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirecionamento será tratado pelo onAuthStateChanged acima.
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
      console.error('Erro de login:', error);
    }
  });

  // REGISTRO
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('[name="register-name"]').value;
    const email = registerForm.querySelector('[name="register-email"]').value;
    const password = registerForm.querySelector('[name="register-password"]').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Adiciona o nome do usuário ao Firestore na coleção 'users'
      // O ID do documento será o UID do usuário
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email // Opcional: pode armazenar o email também, mas já está no auth
      });

      // Redirecionamento será tratado pelo onAuthStateChanged
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
      console.error('Erro de registro:', error);
    }
  });

  // GOOGLE
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica se o usuário já existe no Firestore, se não, adiciona
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDocs(userDocRef); // Usando getDocs para verificar a existência do doc

      if (!userDocSnap.exists()) { // Se o documento do usuário não existe
        await setDoc(userDocRef, {
          name: user.displayName, // Nome do Google
          email: user.email
        });
      }

      // Redirecionamento será tratado pelo onAuthStateChanged
    } catch (error) {
      alert('Erro ao entrar com Google: ' + error.message);
      console.error('Erro Google Auth:', error);
    }
  });

  // Alternância entre formulários
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
});

// localStorage.clear();