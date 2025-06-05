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

// FIRESTORE (injetado pelo firebase-app.js)
const db = window.db;
const { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } = window.firestoreFns;

// AUTH (injetado pelo firebase-app.js)
const auth = window.auth;
const { onAuthStateChanged } = window.authFns;

// Importamos signOut diretamente do SDK, para termos certeza de que a função existe
import { signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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
  renderWineList();
}

/**
 * Busca, filtra e renderiza os vinhos do Firestore
 */
async function renderWineList() {
  try {
    if (!winesCol) {
      console.log("Aguardando inicialização da coleção...");
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
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'wines', id));
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

  const newWine = {
    name: wineName.value.trim(),
    type: wineType.value.trim(),
    rating: wineRating.value
  };
  const editingId = wineForm.getAttribute('data-editing-id');

  if (editingId) {
    // Atualiza o vinho existente
    const wineRef = doc(db, 'users', userId, 'wines', editingId);
    await updateDoc(wineRef, newWine);
    wineForm.removeAttribute('data-editing-id');
  } else {
    // Adiciona um novo vinho
    if (!newWine.name || !newWine.type) return;
    await addDoc(winesCol, newWine);
  }

  wineForm.reset();
  showListScreen();
  showToast(editingId ? 'Vinho atualizado com sucesso!' : 'Vinho adicionado com sucesso!');
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
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      console.log("Clicou em Sair → tentando deslogar...");
      try {
        await signOut(auth);
        console.log("SignOut realizado com sucesso, redirecionando para login.html");
        window.location.href = 'login.html';
      } catch (err) {
        console.error("Erro ao sair:", err);
        alert('Erro ao sair: ' + err.message);
      }
    });
  }
});

/**
 * Observa mudanças no estado de autenticação
 */
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    winesCol = collection(db, 'users', userId, 'wines');
    // Se estivermos na página de vinhos, já renderiza a lista
    renderWineList();
  } else {
    // Se não estiver logado, redireciona para login
    window.location.href = 'login.html';
  }
});
