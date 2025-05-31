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
let wines = JSON.parse(localStorage.getItem('wines')) || [];

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

function saveWinesToStorage() {
  localStorage.setItem('wines', JSON.stringify(wines));
}

function renderWineList() {
  const search = searchInput.value.toLowerCase();
  const ratingFilter = filterRating.value;

  const filteredWines = wines.filter(wine => {
    const matchesText = wine.name.toLowerCase().includes(search) || wine.type.toLowerCase().includes(search);
    const matchesRating = ratingFilter === 'all' || wine.rating === ratingFilter;
    return matchesText && matchesRating;
  });

wineList.innerHTML = filteredWines.length
  ? filteredWines.map((w, index) => `
      <div class="wine-card">
        <div class="wine-header">
          <h2>${w.name}</h2>
          <div class="card-actions">
            <button onclick="deleteWine(${index})" class="icon-button" title="Excluir">
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
function deleteWine(index) {
  // Confirmação para evitar exclusões acidentais
  const confirmDelete = confirm("Tem certeza que deseja excluir este vinho?");
  
  if (confirmDelete) {
    // Remove 1 vinho da lista, a partir da posição index
    wines.splice(index, 1);
    
    // Atualiza os dados no localStorage
    saveWinesToStorage();
    
    // Reexibe a lista atualizada
    renderWineList();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const newWine = {
    name: wineName.value.trim(),
    type: wineType.value.trim(),
    rating: wineRating.value
  };

  if (newWine.name && newWine.type) {
    wines.push(newWine);
    saveWinesToStorage();
    wineForm.reset();
    showListScreen();
  }
}

// EVENTOS
btnShowForm.addEventListener('click', showFormScreen);
btnShowList.addEventListener('click', showListScreen);
wineForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', renderWineList);
filterRating.addEventListener('change', renderWineList);

// INICIALIZAÇÃO
showFormScreen(); // Começa no formulário por padrão


// localStorage.clear();
