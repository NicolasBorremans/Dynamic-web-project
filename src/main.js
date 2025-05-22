import './style.css';
import { fetchCharacters } from './api.js';


const container = document.getElementById('characters-container');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterLocation = document.getElementById('filterLocation');
const sortSelect = document.getElementById('sortSelect');
const showFavoritesOnlyCheckbox = document.getElementById('showFavoritesOnly');

let allCharacters = [];
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));


function renderCharacters(characters) {
  container.innerHTML = '';

  if (characters.length === 0) {
    container.innerHTML = '<p>Geen resultaten gevonden.</p>';
    return;
  }

  characters.forEach(character => {
    const card = document.createElement('div');
    card.className = 'character-card';

    const fav = favorites.has(character.id);

    /* HTML-inhoud van de karakterkaart */
    card.innerHTML = `
      <h3>${character.name}</h3>
      <img src="${character.image}" alt="${character.name}" />
      <button class="favorite-btn" data-id="${character.id}">
        ${fav ? '★ Favoriet' : '☆ Voeg toe aan favorieten'}
      </button>
      <p>Status: ${character.status}</p>
      <p>Soort: ${character.species}</p>
      <p>Geslacht: ${character.gender}</p>
      <p>Oorsprong: ${character.origin.name}</p>
      <p>Locatie: ${character.location.name}</p>
    `;

    container.appendChild(card);

    /* Observer activeert animatie zodra kaart zichtbaar wordt */
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(card);
  });

  /* Favorietenknop functionaliteit */
  const favButtons = container.querySelectorAll('.favorite-btn'); /*knop voor favos*/ 
  favButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      if (favorites.has(id)) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }
      localStorage.setItem('favorites', JSON.stringify([...favorites]));
      applyFiltersAndSort();
    });
  });
}

/* Vult dropdown met locaties */
function fillLocationDropdown(characters) {
  let foundLocations = [];
  characters.forEach(c => {
    if (c.location && c.location.name && !foundLocations.includes(c.location.name)) {
      foundLocations.push(c.location.name);
    }
  });

  filterLocation.innerHTML = `<option value="">Filter op locatie</option>`;
  foundLocations.sort().forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    filterLocation.appendChild(opt);
  });
}

/*Voert filters sortering en zoekterm toe op de karakterlijst */
function applyFiltersAndSort() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = filterStatus.value.toLowerCase();
  const locationValue = filterLocation.value;
  const sort = sortSelect.value;
  const onlyFavs = showFavoritesOnlyCheckbox.checked;

  let result = allCharacters.filter(c => {
    const matchName = c.name.toLowerCase().includes(searchTerm);
    const matchStatus = !statusValue || c.status.toLowerCase() === statusValue;
    const matchLocation = !locationValue || c.location.name === locationValue;
    const matchFav = !onlyFavs || favorites.has(c.id);
    return matchName && matchStatus && matchLocation && matchFav;
  });

  /*Sorteren op naam (A-Z of Z-A) */
  if (sort === 'az') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'za') {
    result.sort((a, b) => b.name.localeCompare(a.name));
  }

  renderCharacters(result);
}


fetchCharacters().then(characters => {
  allCharacters = characters;
  fillLocationDropdown(characters);
  applyFiltersAndSort();
});

/* Event listeners voor zoek/filter/sorteer/favorieten */
searchInput.addEventListener('input', applyFiltersAndSort);
filterStatus.addEventListener('change', applyFiltersAndSort);
filterLocation.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);
showFavoritesOnlyCheckbox.addEventListener('change', applyFiltersAndSort);

/* Thema-toggle functionaliteit */
const themeToggle = document.getElementById('themeToggle');
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

themeToggle.addEventListener('click', () => {
  const current = document.body.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('theme', next);
});
