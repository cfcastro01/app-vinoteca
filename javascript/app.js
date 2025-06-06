// Arquivo: javascript/app.js
import {
  db,
  auth,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onAuthStateChanged,
  signOut
} from "./firebase-app.js"; // Importe do seu firebase-app.js

// ELEMENTOS DOM (só obter referências, sem listeners ainda)
const btnShowForm = document.getElementById('btn-show-form');
const btnShowList = document.getElementById('btn-show-list');
const formScreen = document.getElementById('form-screen');
const listScreen = document.getElementById('list-screen');
const wineForm = document.getElementById('wine-form');
const wineName = document.getElementById('wine-name');
const wineType = document.getElementById('wine-type');
const wineRating = document.getElementById('wine-rating');
const wineList = document.getElementById('wine-list');
const searchInput = document.getElementById('search');
const filterRating = document.getElementById('filter-rating');
const logoutBtn = document.getElementById('logout-btn'); // Obtenha a referência aqui

let userId = null;
let winesCol = null;

/**
 * Exibe a tela de cadastro de vinho
 */
function showFormScreen() {
  formScreen.style.display = 'block';
  listScreen.style.display = 'none';
  btnShowForm.classList.add('active');
  btnShowList.classList.remove('active');
}

/**
 * Exibe a tela de lista de vinhos
 */
function showListScreen() {
  formScreen.style.display = 'none';
  listScreen.style.display = 'block';
  btnShowForm.classList.remove('active');
  btnShowList.classList.add('active');
  renderWineList(); // Garante que a lista seja renderizada ao alternar para ela
}

/**
 * Busca, filtra e renderiza os vinhos do Firestore
 */
async function renderWineList() {
  try {
    if (!winesCol) {
      // Se winesCol ainda não estiver definido (usuário não autenticado ou inicialização),
      // aguarde e tente novamente, ou exiba uma mensagem.
      // O ideal é que esta função só seja chamada quando userId e winesCol estiverem garantidos.
      wineList.innerHTML = `<p>Carregando vinhos...</p>`;
      return;
    }

    const search = searchInput.value.toLowerCase();
    const ratingFilter = filterRating.value;
    const snapshot = await getDocs(winesCol);
    const wineDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filteredWines = wineDocs.filter(wine => {
      const name = wine.name?.toLowerCase() || '';
      const type = wine.type?.toLowerCase() || '';
      const matchesText = name.includes(search) || type.includes(search);
      const matchesRating = ratingFilter === 'all' || wine.rating === ratingFilter;
      return matchesText && matchesRating;
    });

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
  }
}

/**
 * Exclui um vinho do Firestore
 */
async function deleteWine(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este vinho?");
  if (confirmDelete) {
    if (!userId) {
      console.warn("Usuário não autenticado, não é possível excluir o vinho.");
      return;
    }
    await deleteDoc(doc(db, 'users', userId, 'wines', id));
    showToast('Vinho excluído com sucesso!');
    renderWineList();
  }
}

/**
 * Preenche o formulário para editar um vinho
 */
function editWine(id, name, type, rating) {
  wineName.value = name;
  wineType.value = type;
  wineRating.value = rating;
  wineForm.setAttribute('data-editing-id', id);
  showFormScreen();
}

/**
 * Exibe um toast de sucesso/erro
 */
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Trata o envio do formulário (adicionar ou atualizar vinho)
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (!userId) {
    console.warn("Usuário não autenticado, não é possível salvar o vinho.");
    showToast('Erro: Usuário não autenticado.');
    return;
  }

  const newWine = {
    name: wineName.value.trim(),
    type: wineType.value.trim(),
    rating: wineRating.value
  };

  if (!newWine.name || !newWine.type) {
    showToast('Por favor, preencha o nome e o tipo do vinho.');
    return;
  }

  const editingId = wineForm.getAttribute('data-editing-id');

  try {
    if (editingId) {
      // Atualiza o vinho existente
      const wineRef = doc(db, 'users', userId, 'wines', editingId);
      await updateDoc(wineRef, newWine);
      wineForm.removeAttribute('data-editing-id');
      showToast('Vinho atualizado com sucesso!');
    } else {
      // Adiciona um novo vinho
      await addDoc(winesCol, newWine);
      showToast('Vinho adicionado com sucesso!');
    }
    wineForm.reset();
    showListScreen();
  } catch (error) {
    console.error("Erro ao salvar vinho:", error);
    showToast('Erro ao salvar vinho: ' + error.message);
  }
}

/**
 * Esse bloco só roda quando o DOM estiver totalmente carregado
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1) Configura os event listeners dos botões fixos (Form / Lista / Formulário)
  btnShowForm.addEventListener('click', showFormScreen);
  btnShowList.addEventListener('click', showListScreen);
  wineForm.addEventListener('submit', handleFormSubmit);
  searchInput.addEventListener('input', renderWineList);
  filterRating.addEventListener('change', renderWineList);

  // 2) Listener para os botões "Editar" e "Excluir" dentro da lista
  wineList.addEventListener('click', function (event) {
    const target = event.target.closest('button');
    if (!target) return;

    if (target.classList.contains('btn-edit')) {
      const id = target.dataset.id;
      const name = target.dataset.name;
      const type = target.dataset.type;
      const rating = target.dataset.rating;
      editWine(id, name, type, rating);
    }
    if (target.classList.contains('btn-delete')) {
      const id = target.dataset.id;
      deleteWine(id);
    }
  });

  // 3) Listener para o botão "Sair" (logout)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      console.log("Clicou em Sair → tentando deslogar...");
      try {
        await signOut(auth); // Use a função signOut importada
        console.log("SignOut realizado com sucesso, redirecionando para login.html");
        // O onAuthStateChanged abaixo cuidará do redirecionamento
      } catch (err) {
        console.error("Erro ao sair:", err);
        alert('Erro ao sair: ' + err.message);
      }
    });
  }

  // 4) Observa mudanças no estado de autenticação APENAS nesta página (index.html)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      winesCol = collection(db, 'users', userId, 'wines');
      // Uma vez que o usuário está logado e a coleção está definida,
      // renderize a lista de vinhos ou mostre a tela de cadastro
      if (listScreen.style.display === 'block') { // Se a lista já estiver visível ou configurada para ser
        renderWineList();
      } else {
        showFormScreen(); // Ou a tela padrão ao entrar
      }
    } else {
      // Se não estiver logado, redireciona para login
      window.location.href = 'login.html';
    }
  });

}); // Fim do DOMContentLoaded

// localStorage.clear();
