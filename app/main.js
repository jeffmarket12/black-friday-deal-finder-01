import { deals } from './data.js';
import { deal, list, missing, rows } from './views.js';

const app = document.getElementById('app');

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder 2026`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    document.title = 'Black Friday Deal Finder 2026';
    let currentQuery = '';
    let currentFilters = { category: '', store: '', minOff: 0 };
    let currentSort = 'discount';

    app.innerHTML = list(deals, currentQuery, currentFilters, currentSort);

    const searchInput = document.getElementById('search-input');
    const catSelect = document.getElementById('filter-category');
    const storeSelect = document.getElementById('filter-store');
    const offSelect = document.getElementById('filter-off');
    const sortSelect = document.getElementById('sort-by');
    const dealsList = app.querySelector('.deals');
    const dealCountEl = document.getElementById('deal-count');

    function updateList() {
      currentQuery = searchInput.value;
      currentFilters = {
        category: catSelect.value,
        store: storeSelect.value,
        minOff: Number(offSelect.value) || 0,
      };
      currentSort = sortSelect.value;
      dealsList.innerHTML = rows(deals, currentQuery, currentFilters, currentSort);

      if (dealCountEl) {
        const q = currentQuery.trim().toLowerCase();
        const cat = currentFilters.category;
        const store = currentFilters.store;
        const minOff = currentFilters.minOff;
        const shown = deals.filter((d) => {
          const textMatch = q === '' || `${d.title} ${d.store} ${d.category} ${d.verdict || ''}`.toLowerCase().includes(q);
          const catMatch = !cat || d.category === cat;
          const storeMatch = !store || d.store === store;
          const off = Math.round((1 - d.price / d.was) * 100);
          return textMatch && catMatch && storeMatch && off >= minOff;
        });
        dealCountEl.textContent = shown.length;
      }
    }

    if (searchInput) searchInput.addEventListener('input', updateList);
    if (catSelect) catSelect.addEventListener('change', updateList);
    if (storeSelect) storeSelect.addEventListener('change', updateList);
    if (offSelect) offSelect.addEventListener('change', updateList);
    if (sortSelect) sortSelect.addEventListener('change', updateList);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
