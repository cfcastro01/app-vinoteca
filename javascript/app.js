// ELEMENTOS DOM
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

// ESTADO
// let wines = JSON.parse(localStorage.getItem('wines')) || [];

// FIRESTORE
const db = window.db;
const { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } = window.firestoreFns;
const winesCol = collection(db, 'wines');

// FUNÇÕES
function showFormScreen() {
  formScreen.style.display = 'block';
  listScreen.style.display = 'none';
  btnShowForm.classList.add('active');
  btnShowList.classList.remove('active');
}

function showListScreen() {
  formScreen.style.display = 'none';
  listScreen.style.display = 'block';
  btnShowForm.classList.remove('active');
  btnShowList.classList.add('active');
  renderWineList();
}

async function renderWineList() {
  const search = searchInput.value.toLowerCase();
  const ratingFilter = filterRating.value;

  const snapshot = await getDocs(winesCol);
  const wineDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // console.log('wineDocs:', wineDocs);

const filteredWines = wineDocs.filter(wine => {
  const name = wine.name?.toLowerCase() || '';
  const type = wine.type?.toLowerCase() || '';
  const matchesText = name.includes(search) || type.includes(search);
  const matchesRating = ratingFilter === 'all' || wine.rating === ratingFilter;
  return matchesText && matchesRating;
});

  wineList.innerHTML = filteredWines.length
    ? filteredWines.map((w) => `
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
}

// EXCLUIR VINHO //
async function deleteWine(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este vinho?");
  if (confirmDelete) {
    await deleteDoc(doc(db, 'wines', id));
    renderWineList();
  }
}

// EDITAR VINHO //
function editWine(id, name, type, rating) {
  wineName.value = name;
  wineType.value = type;
  wineRating.value = rating;
  wineForm.setAttribute('data-editing-id', id);
  showFormScreen();
}

// Exibir feedback visual após salvar ou excluir
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


async function handleFormSubmit(event) {
  event.preventDefault();

  const newWine = {
    name: wineName.value.trim(),
    type: wineType.value.trim(),
    rating: wineRating.value
  };

  const editingId = wineForm.getAttribute('data-editing-id');

  if (editingId) {
    // Atualizar vinho existente
    const wineRef = doc(db, 'wines', editingId);
    await updateDoc(wineRef, newWine);
    wineForm.removeAttribute('data-editing-id');
  } else {
    // Adicionar novo vinho
    if (!newWine.name || !newWine.type) return;
    await addDoc(winesCol, newWine);
  }

  wineForm.reset();
  showListScreen();
  showToast(editingId ? 'Vinho atualizado com sucesso!' : 'Vinho adicionado com sucesso!');
}

// EVENTOS
btnShowForm.addEventListener('click', showFormScreen);
btnShowList.addEventListener('click', showListScreen);
wineForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', renderWineList);
filterRating.addEventListener('change', renderWineList);

// INICIALIZAÇÃO
// showListScreen(); // Começa na tela de lista
showFormScreen(); // Começa na tela de cadastro

wineList.addEventListener('click', function (event) {
  const target = event.target.closest('button');

  if (!target) return;

  // Botão Editar
  if (target.classList.contains('btn-edit')) {
    const id = target.dataset.id;
    const name = target.dataset.name;
    const type = target.dataset.type;
    const rating = target.dataset.rating;

    editWine(id, name, type, rating);
  }

  // Botão Excluir
  if (target.classList.contains('btn-delete')) {
    const id = target.dataset.id;
    deleteWine(id);
  }
});

// localStorage.clear();
