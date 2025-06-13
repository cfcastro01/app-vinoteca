// Arquivo: javascript/app.js

/*
  -----------------------------------------------------------------------------
  Importações de Módulos Firebase
  -----------------------------------------------------------------------------
  Importa as funções e instâncias do Firebase necessárias para interagir com
  Autenticação e Firestore, definidas em 'firebase-app.js'.
*/
import {
  db,             // Instância do Firestore Database
  auth,           // Instância do Firebase Authentication
  collection,     // Função para criar referências de coleções Firestore
  getDocs,        // Função para buscar múltiplos documentos de uma coleção
  addDoc,         // Função para adicionar um novo documento a uma coleção
  deleteDoc,      // Função para deletar um documento específico
  doc,            // Função para criar referências de documentos Firestore
  updateDoc,      // Função para atualizar campos de um documento existente
  onAuthStateChanged, // Listener para monitorar o estado de autenticação
  signOut         // Função para realizar o logout do usuário
} from "./firebase-app.js";

/*
  -----------------------------------------------------------------------------
  Seleção de Elementos DOM
  -----------------------------------------------------------------------------
  Obtém e armazena referências para os elementos HTML com os quais o script
  irá interagir. Isso garante que os elementos sejam acessíveis após o DOM ser
  totalmente carregado. Todas as IDs e classes correspondem aos elementos em 'index.html'.
*/
const btnShowForm = document.getElementById('btn-show-form');     // Botão "Cadastrar vinho"
const btnShowList = document.getElementById('btn-show-list');     // Botão "Minha adega"
const formScreen = document.getElementById('form-screen');       // Seção do formulário de vinho
const listScreen = document.getElementById('list-screen');       // Seção da lista de vinhos
const wineForm = document.getElementById('wine-form');           // Formulário de cadastro/edição de vinho
const wineName = document.getElementById('wine-name');           // Campo de nome do vinho
const wineType = document.getElementById('wine-type');           // Campo de tipo/uva do vinho
const wineRating = document.getElementById('wine-rating');       // Campo de avaliação do vinho
const wineList = document.getElementById('wine-list');           // Contêiner para a lista de vinhos
const searchInput = document.getElementById('search');           // Campo de busca da lista
const filterRating = document.getElementById('filter-rating');     // Seletor de filtro por avaliação
const logoutBtn = document.getElementById('logout-btn');         // Botão de logout

// Variáveis de estado global para o usuário autenticado e a coleção de vinhos
let userId = null;      // Armazena o UID do usuário autenticado
let winesCol = null;    // Referência à coleção de vinhos do usuário no Firestore

/*
  -----------------------------------------------------------------------------
  Funções de Gerenciamento de UI (Interface do Usuário)
  -----------------------------------------------------------------------------
  Funções que controlam a visibilidade das telas e a aparência dos botões de navegação.
*/

/**
 * Exibe a tela de cadastro de vinho e atualiza o estado dos botões de navegação.
 */
function showFormScreen() {
  formScreen.style.display = 'block';
  listScreen.style.display = 'none';
  btnShowForm.classList.add('active');
  btnShowList.classList.remove('active');
  wineForm.reset(); // Limpa o formulário ao alternar para a tela de cadastro
  wineForm.removeAttribute('data-editing-id'); // Garante que não esteja em modo de edição
}

/**
 * Exibe a tela de lista de vinhos e atualiza o estado dos botões de navegação.
 * Aciona a renderização da lista de vinhos.
 */
function showListScreen() {
  formScreen.style.display = 'none';
  listScreen.style.display = 'block';
  btnShowForm.classList.remove('active');
  btnShowList.classList.add('active');
  renderWineList(); // Garante que a lista seja renderizada ao alternar para ela
}

/**
 * Exibe um toast (notificação temporária) na tela.
 * @param {string} msg - A mensagem a ser exibida no toast.
 */
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000); // Remove o toast após 3 segundos
}

/*
  -----------------------------------------------------------------------------
  Funções de Interação com Firestore (CRUD de Vinhos)
  -----------------------------------------------------------------------------
  Funções assíncronas que interagem diretamente com o Firestore para buscar,
  adicionar, atualizar e excluir vinhos.
*/

/**
 * Busca, filtra e renderiza os vinhos do Firestore na interface.
 */
async function renderWineList() {
  try {
    // Verifica se o usuário está autenticado e a coleção de vinhos está definida
    if (!winesCol) {
      // Se não, exibe uma mensagem de carregamento ou de erro.
      // Esta condição idealmente não deve ser atingida se onAuthStateChanged
      // estiver funcionando como esperado.
      wineList.innerHTML = `<p>Carregando vinhos...</p>`;
      return;
    }

    const search = searchInput.value.toLowerCase();
    const ratingFilter = filterRating.value;
    const snapshot = await getDocs(winesCol); // Obtém todos os documentos da coleção de vinhos
    const wineDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtra os vinhos com base nos critérios de busca e filtro de avaliação
    const filteredWines = wineDocs.filter(wine => {
      const name = wine.name?.toLowerCase() || ''; // Usa optional chaining para segurança
      const type = wine.type?.toLowerCase() || ''; // Usa optional chaining para segurança
      const matchesText = name.includes(search) || type.includes(search);
      const matchesRating = ratingFilter === 'all' || wine.rating === ratingFilter;
      return matchesText && matchesRating;
    });

    // Renderiza os vinhos filtrados ou uma mensagem de "nenhum encontrado"
    wineList.innerHTML = filteredWines.length
      ? filteredWines.map(w => `
          <div class="wine-card">
            <div class="wine-header">
              <h2>${w.name}</h2>
              <div class="card-actions">
                <button class="icon-button btn-edit"
                        data-id="${w.id}"
                        data-name="${w.name}"
                        data-type="${w.type}"
                        data-rating="${w.rating}"
                        title="Editar">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="icon-button btn-delete"
                        data-id="${w.id}"
                        title="Excluir">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            <p>${w.type}</p>
            <span>${w.rating === 'liked' ? '✔️ Gostei' : '❌ Não gostei'}</span>
          </div>
        `).join('')
      : `<p>Nenhum vinho encontrado.</p>`;

  } catch (error) {
    console.error("Erro ao carregar vinhos:", error);
    wineList.innerHTML = `<p class="error">Erro ao carregar lista de vinhos</p>`;
    showToast('Erro ao carregar vinhos. Tente novamente.');
  }
}

/**
 * Exclui um vinho do Firestore e atualiza a lista.
 * @param {string} id - O ID do documento do vinho a ser excluído.
 */
async function deleteWine(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este vinho?");
  if (confirmDelete) {
    if (!userId) {
      console.warn("Usuário não autenticado, não é possível excluir o vinho.");
      showToast('Erro: Usuário não autenticado.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId, 'wines', id));
      showToast('Vinho excluído com sucesso!');
      renderWineList(); // Renderiza a lista novamente após a exclusão
    } catch (error) {
      console.error("Erro ao excluir vinho:", error);
      showToast('Erro ao excluir vinho: ' + error.message);
    }
  }
}

/**
 * Preenche o formulário de vinho com os dados para edição.
 * @param {string} id - O ID do vinho a ser editado.
 * @param {string} name - O nome do vinho.
 * @param {string} type - O tipo/uva do vinho.
 * @param {string} rating - A avaliação do vinho.
 */
function editWine(id, name, type, rating) {
  wineName.value = name;
  wineType.value = type;
  wineRating.value = rating;
  wineForm.setAttribute('data-editing-id', id); // Armazena o ID do vinho que está sendo editado
  showFormScreen(); // Exibe a tela do formulário
}

/**
 * Trata o envio do formulário de vinho, adicionando um novo ou atualizando um existente.
 * @param {Event} event - O evento de envio do formulário.
 */
async function handleFormSubmit(event) {
  event.preventDefault(); // Previne o comportamento padrão de recarregar a página

  if (!userId) {
    console.warn("Usuário não autenticado, não é possível salvar o vinho.");
    showToast('Erro: Usuário não autenticado. Faça login novamente.');
    return;
  }

  const newWine = {
    name: wineName.value.trim(),
    type: wineType.value.trim(),
    rating: wineRating.value
  };

  // Validação básica dos campos
  if (!newWine.name || !newWine.type) {
    showToast('Por favor, preencha o nome e o tipo do vinho.');
    return;
  }

  const editingId = wineForm.getAttribute('data-editing-id'); // Verifica se estamos editando

  try {
    if (editingId) {
      // Caso esteja editando: atualiza o vinho existente no Firestore
      const wineRef = doc(db, 'users', userId, 'wines', editingId);
      await updateDoc(wineRef, newWine);
      wineForm.removeAttribute('data-editing-id'); // Remove o atributo de edição
      showToast('Vinho atualizado com sucesso!');
    } else {
      // Caso esteja adicionando: adiciona um novo vinho ao Firestore
      await addDoc(winesCol, newWine);
      showToast('Vinho adicionado com sucesso!');
    }
    wineForm.reset(); // Limpa os campos do formulário
    showListScreen(); // Volta para a tela da lista após salvar
  } catch (error) {
    console.error("Erro ao salvar vinho:", error);
    showToast('Erro ao salvar vinho: ' + error.message);
  }
}

/*
  -----------------------------------------------------------------------------
  Inicialização e Event Listeners
  -----------------------------------------------------------------------------
  Este bloco é executado quando o DOM estiver completamente carregado.
  Aqui são configurados todos os listeners de eventos principais da aplicação.
*/
document.addEventListener('DOMContentLoaded', () => {

  // 1. Listeners para os botões de alternância de tela (Menu)
  btnShowForm.addEventListener('click', showFormScreen);
  btnShowList.addEventListener('click', showListScreen);

  // 2. Listener para o envio do formulário de vinho (adicionar/editar)
  wineForm.addEventListener('submit', handleFormSubmit);

  // 3. Listeners para os filtros de busca e avaliação
  searchInput.addEventListener('input', renderWineList);    // Busca em tempo real
  filterRating.addEventListener('change', renderWineList); // Filtra ao mudar a seleção

  // 4. Listener delegado para os botões "Editar" e "Excluir" dentro da lista de vinhos
  // Usa delegação de eventos para capturar cliques em botões dinamicamente criados.
  wineList.addEventListener('click', function (event) {
    // 'closest' garante que o target seja o botão em si ou um ancestral que seja um botão
    const target = event.target.closest('button');
    if (!target) return; // Se o clique não foi em um botão, sai da função

    // Verifica se é o botão de edição
    if (target.classList.contains('btn-edit')) {
      const id = target.dataset.id;
      const name = target.dataset.name;
      const type = target.dataset.type;
      const rating = target.dataset.rating;
      editWine(id, name, type, rating); // Chama a função para preencher e exibir o formulário de edição
    }
    // Verifica se é o botão de exclusão
    if (target.classList.contains('btn-delete')) {
      const id = target.dataset.id;
      deleteWine(id); // Chama a função para excluir o vinho
    }
  });

  // 5. Listener para o botão "Sair" (logout)
  // O 'if (logoutBtn)' garante que o listener só seja adicionado se o botão existir.
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      console.log("Clicou em Sair → tentando deslogar...");
      try {
        await signOut(auth); // Chama a função de logout do Firebase
        console.log("SignOut realizado com sucesso, redirecionando para login.html");
        // O onAuthStateChanged abaixo cuidará do redirecionamento após o logout.
      } catch (err) {
        console.error("Erro ao sair:", err);
        alert('Erro ao sair: ' + err.message); // Exibe erro ao usuário
      }
    });
  }

  // 6. Observador de Estado de Autenticação para a Página Principal
  // Este listener é crucial para gerenciar o acesso e inicializar dados do usuário.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuário autenticado: define o UID e a referência da coleção de vinhos
      userId = user.uid;
      winesCol = collection(db, 'users', userId, 'wines');
      console.log("Usuário logado:", userId);

      // Garante que a lista de vinhos seja carregada ou o formulário seja exibido
      // dependendo do estado inicial ou da navegação do usuário.
      if (listScreen.style.display === 'block') {
        renderWineList(); // Se a tela de lista já está ativa, carrega os vinhos
      } else {
        showFormScreen(); // Caso contrário, mostra o formulário como tela padrão
      }
    } else {
      // Usuário não autenticado: redireciona para a página de login
      console.log("Usuário deslogado ou não autenticado, redirecionando para login.html");
      window.location.href = 'login.html';
    }
  });

}); // Fim do 'DOMContentLoaded'