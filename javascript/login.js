const auth = window.auth;

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

import { signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";


document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const googleBtn = document.querySelector('.google-button');

  
  // LOGIN
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  });

  // REGISTRO
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('[name="register-name"]').value;
    const email = registerForm.querySelector('[name="register-email"]').value;
    const password = registerForm.querySelector('[name="register-password"]').value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
    }
  });

  // GOOGLE
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      window.location.href = 'index.html';
    } catch (error) {
      alert('Erro ao entrar com Google: ' + error.message);
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