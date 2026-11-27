// A deal list: every deal and a page for each, on hash routes. The deals are in data.js, so the site needs no
// network to show them; each deal links out to its store.
//
//   #/            the list, with a search box and filters
//   #/deal/<id>   one deal
//
// window.__shotReady is false while a page renders and true once it is on screen, so a screenshot script knows when
// to capture.

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
    app.innerHTML = list(deals, currentQuery, currentFilters);

    const searchInput = document.getElementById('search-input');
    const catSelect = document.getElementById('filter-category');
    const storeSelect = document.getElementById('filter-store');
    const offSelect = document.getElementById('filter-off');
    const dealsList = app.querySelector('.deals');

    function updateList() {
      currentQuery = searchInput.value;
      currentFilters = {
        category: catSelect.value,
        store: storeSelect.value,
        minOff: Number(offSelect.value) || 0,
      };
      dealsList.innerHTML = rows(deals, currentQuery, currentFilters);
    }

    if (searchInput) searchInput.addEventListener('input', updateList);
    if (catSelect) catSelect.addEventListener('change', updateList);
    if (storeSelect) storeSelect.addEventListener('change', updateList);
    if (offSelect) offSelect.addEventListener('change', updateList);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
