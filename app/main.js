import { deals } from './data.js';
import { deal as renderDealDetail, list as renderDealList, missing as renderNotFound, rows as renderDealRows } from './views.js';

const rootElement = document.getElementById('app');

function handleRouting() {
  window.__shotReady = false;
  const dealRouteMatch = location.hash.match(/^#\/deal\/([^/?]+)/);

  if (dealRouteMatch) {
    const matchedDealId = decodeURIComponent(dealRouteMatch[1]);
    const currentDeal = deals.find((entry) => entry.id === matchedDealId);
    document.title = `${currentDeal ? currentDeal.title : 'Deal Not Found'} | Black Friday Deal Finder 2026`;
    rootElement.innerHTML = currentDeal ? renderDealDetail(currentDeal) : renderNotFound();
  } else {
    document.title = 'Black Friday Deal Finder 2026';
    let searchQuery = '';
    let filterCriteria = { category: '', store: '', minOff: 0 };
    let activeSortOrder = 'discount';

    rootElement.innerHTML = renderDealList(deals, searchQuery, filterCriteria, activeSortOrder);

    const searchBox = document.getElementById('search-input');
    const categorySelector = document.getElementById('filter-category');
    const storeSelector = document.getElementById('filter-store');
    const discountSelector = document.getElementById('filter-off');
    const sortSelector = document.getElementById('sort-by');
    const dealListContainer = rootElement.querySelector('.deals');
    const counterBadge = document.getElementById('deal-count');

    function refreshView() {
      searchQuery = searchBox.value;
      filterCriteria = {
        category: categorySelector.value,
        store: storeSelector.value,
        minOff: Number(discountSelector.value) || 0,
      };
      activeSortOrder = sortSelector.value;
      dealListContainer.innerHTML = renderDealRows(deals, searchQuery, filterCriteria, activeSortOrder);

      if (counterBadge) {
        const queryClean = searchQuery.trim().toLowerCase();
        const catFilter = filterCriteria.category;
        const storeFilter = filterCriteria.store;
        const minDiscountFilter = filterCriteria.minOff;
        
        const visibleCount = deals.filter((entry) => {
          const matchesText = queryClean === '' || `${entry.title} ${entry.store} ${entry.category} ${entry.verdict || ''}`.toLowerCase().includes(queryClean);
          const matchesCategory = !catFilter || entry.category === catFilter;
          const matchesStore = !storeFilter || entry.store === storeFilter;
          const discountPercentage = Math.round((1 - entry.price / entry.was) * 100);
          return matchesText && matchesCategory && matchesStore && discountPercentage >= minDiscountFilter;
        }).length;

        counterBadge.textContent = visibleCount;
      }
    }

    if (searchBox) searchBox.addEventListener('input', refreshView);
    if (categorySelector) categorySelector.addEventListener('change', refreshView);
    if (storeSelector) storeSelector.addEventListener('change', refreshView);
    if (discountSelector) discountSelector.addEventListener('change', refreshView);
    if (sortSelector) sortSelector.addEventListener('change', refreshView);
  }

  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', handleRouting);
handleRouting();
