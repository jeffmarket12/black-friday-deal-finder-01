// Client entry point for Black Friday Deal Finder v3
// Manages reactive hash routing, filter state, event listeners, and footer store summaries.

import { getAllDeals } from './data.js';
import { renderListView, renderDetailView } from './views.js';

const allDeals = getAllDeals();

const state = {
  search: '',
  category: '',
  store: '',
  minDiscount: '',
  sort: 'percent'
};

function getRoute() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/deal/')) {
    const id = hash.replace('#/deal/', '');
    return { view: 'detail', id };
  }
  return { view: 'list' };
}

function renderApp() {
  const root = document.getElementById('app-root');
  const route = getRoute();

  if (route.view === 'detail') {
    const deal = allDeals.find(d => d.id === route.id);
    root.innerHTML = renderDetailView(deal);
  } else {
    root.innerHTML = renderListView(allDeals, state, updateFilters);
    bindListEvents();
  }

  renderFooterSummary();

  // Signal screenshot readiness to harness/puppeteer
  window.__shotReady = true;
}

function updateFilters() {
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const storeSelect = document.getElementById('store-select');
  const discountSelect = document.getElementById('discount-select');
  const sortSelect = document.getElementById('sort-select');

  if (searchInput) state.search = searchInput.value;
  if (categorySelect) state.category = categorySelect.value;
  if (storeSelect) state.store = storeSelect.value;
  if (discountSelect) state.minDiscount = discountSelect.value;
  if (sortSelect) state.sort = sortSelect.value;
}

function bindListEvents() {
  const form = document.getElementById('filters-form');
  if (!form) return;

  form.addEventListener('input', () => {
    updateFilters();
    renderApp();
  });

  form.addEventListener('change', () => {
    updateFilters();
    renderApp();
  });

  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.search = '';
      state.category = '';
      state.store = '';
      state.minDiscount = '';
      state.sort = 'percent';
      renderApp();
    });
  }
}

function renderFooterSummary() {
  const footer = document.getElementById('footer-summary');
  if (!footer) return;

  // Compute per-store counts
  const storeCounts = {};
  allDeals.forEach(d => {
    storeCounts[d.store] = (storeCounts[d.store] || 0) + 1;
  });

  const storeSummaryText = Object.entries(storeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([st, count]) => `${st}: <span>${count} deals</span>`)
    .join(' &bull; ');

  footer.innerHTML = `
    <div style="margin-bottom: 6px;">Per-store verified distribution: ${storeSummaryText}</div>
    <div>Black Friday Deal Finder v3 &bull; 56 Verified Deals &bull; Checked 28 Nov 2026</div>
  `;
}

window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', renderApp);
