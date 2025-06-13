// Arquivo: javascript/login.js

/*
  -----------------------------------------------------------------------------
  Importações de Módulos Firebase
  -----------------------------------------------------------------------------
  Este bloco importa as funções e serviços necessários do Firebase SDK,
  expostos a partir do seu arquivo de configuração 'firebase-app.js'.
*/
import {
  auth,                   // Instância do Firebase Authentication
  db,                     // Instância do Firestore Database
  collection,             // Função para criar referências de coleções Firestore
  setDoc,                 // Função para criar ou sobrescrever documentos no Firestore
  doc,                    // Função para criar referências de documentos Firestore
  createUserWithEmailAndPassword, // Função para registrar novos usuários com e-mail e senha
  signInWithEmailAndPassword,     // Função para autenticar usuários com e-mail e senha
  GoogleAuthProvider,     // Provedor de autenticação Google
  signInWithPopup,        // Função para autenticar com provedores de popup (ex: Google)
  onAuthStateChanged,     // Listener para monitorar mudanças no estado de autenticação
  getDoc                  // IMPORTANTE: Função para obter um ÚNICO documento do Firestore
} from "./firebase-app.js";

/*
  -----------------------------------------------------------------------------
  Execução do Script ao Carregar o DOM
  -----------------------------------------------------------------------------
  Garante que todo o HTML da página esteja carregado antes de tentar acessar
  os elementos do DOM e anexar listeners de eventos.
*/
document.addEventListener('DOMContentLoaded', () => {

  /*
    -----------------------------------------------------------------------------
    Seleção de Elementos DOM
    -----------------------------------------------------------------------------
    Obtém referências para os elementos HTML com os quais o script irá interagir.
    As classes e IDs chamadas aqui correspondem diretamente aos elementos em 'login.html'.
  */
  const loginForm = document.getElementById('login-form');       // Formulário de login
  const registerForm = document.getElementById('register-form'); // Formulário de cadastro
  const googleBtn = document.querySelector('.google-button');    // Botão de login com Google
  const showRegisterLink = document.getElementById('show-register'); // Link para alternar para cadastro
  const showLoginLink = document.getElementById('show-login');     // Link para alternar para login

  /*
    -----------------------------------------------------------------------------
    Monitoramento do Estado de Autenticação (Redirecionamento)
    -----------------------------------------------------------------------------
    Verifica o estado de autenticação do usuário. Se já estiver logado,
    redireciona automaticamente para a página principal (index.html).
  */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuário logado, redireciona para a página principal
      window.location.href = 'index.html';
    }
  });

  /*
    -----------------------------------------------------------------------------
    Handler para o Formulário de Login (Event Listener)
    -----------------------------------------------------------------------------
    Lida com o envio do formulário de login para autenticar o usuário.
  */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Sucesso: o redirecionamento é tratado pelo onAuthStateChanged acima.
    } catch (error) {
      // Exibe uma mensagem de erro amigável ao usuário
      alert('Erro ao fazer login: ' + error.message);
      console.error('Erro de login:', error); // Log detalhado para depuração
    }
  });

  /*
    -----------------------------------------------------------------------------
    Handler para o Formulário de Registro (Event Listener)
    -----------------------------------------------------------------------------
    Lida com o envio do formulário de registro para criar uma nova conta
    e persistir dados básicos do usuário no Firestore.
  */
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    const name = registerForm.querySelector('[name="register-name"]').value;
    const email = registerForm.querySelector('[name="register-email"]').value;
    const password = registerForm.querySelector('[name="register-password"]').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // O objeto user contém o UID

      // Adiciona o nome e e-mail do novo usuário ao Firestore na coleção 'users'.
      // O ID do documento é definido como o UID do usuário para fácil recuperação.
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email // Armazenar o email aqui é opcional, pois já está no Authentication
      });

      // Sucesso: o redirecionamento é tratado pelo onAuthStateChanged.
    } catch (error) {
      // Exibe uma mensagem de erro amigável ao usuário
      alert('Erro ao criar conta: ' + error.message);
      console.error('Erro de registro:', error); // Log detalhado para depuração
    }
  });

  /*
    -----------------------------------------------------------------------------
    Handler para o Botão de Login com Google (Event Listener)
    -----------------------------------------------------------------------------
    Lida com a autenticação via Google e persiste dados do usuário no Firestore
    se for o primeiro login com Google.
  */
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider(); // Instancia o provedor de autenticação Google

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // O objeto user contém as informações do perfil Google

      // Cria uma referência para o documento do usuário no Firestore usando o UID
      const userDocRef = doc(db, 'users', user.uid);
      // Tenta obter o documento para verificar se ele já existe no Firestore.
      // CORREÇÃO: Usado 'getDoc' em vez de 'getDocs' para um único documento.
      const userDocSnap = await getDoc(userDocRef);

      // Se o documento do usuário não existe (primeiro login Google), cria-o no Firestore
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName, // Nome obtido diretamente do perfil Google
          email: user.email       // E-mail obtido diretamente do perfil Google
        });
      }

      // Sucesso: o redirecionamento é tratado pelo onAuthStateChanged.
    } catch (error) {
      // Exibe uma mensagem de erro amigável ao usuário
      alert('Erro ao entrar com Google: ' + error.message);
      console.error('Erro Google Auth:', error); // Log detalhado para depuração
    }
  });

  /*
    -----------------------------------------------------------------------------
    Alternância entre Formulários (Login e Cadastro)
    -----------------------------------------------------------------------------
    Controla a visibilidade dos formulários de login e registro, permitindo ao
    usuário alternar entre as duas telas.
    As IDs 'show-register' e 'show-login' correspondem aos links no HTML.
  */
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    loginForm.style.display = 'none';    // Esconde o formulário de login
    registerForm.style.display = 'block'; // Mostra o formulário de cadastro
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    registerForm.style.display = 'none'; // Esconde o formulário de cadastro
    loginForm.style.display = 'block';   // Mostra o formulário de login
  });
});