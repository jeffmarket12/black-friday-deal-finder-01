// HTML for each page, built from the deal data. Every value is escaped before it goes into the page.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${n.toLocaleString('en-US')}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const dollarsSaved = (d) => Math.round(d.was - d.price);
const day = (iso) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

export function rows(deals, query, filters = {}, sortBy = 'discount') {
  const q = query.trim().toLowerCase();
  const cat = filters.category || '';
  const store = filters.store || '';
  const minOff = Number(filters.minOff) || 0;

  const shown = deals.filter((d) => {
    const textMatch = q === '' || `${d.title} ${d.store} ${d.category} ${d.verdict || ''}`.toLowerCase().includes(q);
    const catMatch = !cat || d.category === cat;
    const storeMatch = !store || d.store === store;
    const off = percentOff(d);
    const offMatch = off >= minOff;
    return textMatch && catMatch && storeMatch && offMatch;
  });

  if (sortBy === 'savings') {
    shown.sort((a, b) => dollarsSaved(b) - dollarsSaved(a));
  } else if (sortBy === 'price') {
    shown.sort((a, b) => a.price - b.price);
  } else {
    // default: discount %
    shown.sort((a, b) => percentOff(b) - percentOff(a));
  }

  if (shown.length === 0) return '<li class="no-match">No deals match your criteria. Try relaxing search or filters.</li>';

  return shown
    .map(
      (d) => `<li>
  <div class="deal-main">
    <a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
    <div class="deal-meta">
      <span class="badge store">${escape(d.store)}</span>
      <span class="badge cat">${escape(d.category)}</span>
      <span class="badge off">${percentOff(d)}% off</span>
      <span class="badge savings">Save ${usd(dollarsSaved(d))}</span>
    </div>
  </div>
  <div class="deal-pricing">
    <span class="price">${usd(d.price)}</span>
    <span class="was"><s>${usd(d.was)}</s></span>
  </div>
  <p class="verdict">${escape(d.verdict || 'Verified live')}</p>
</li>`,
    )
    .join('');
}

export function list(deals, query = '', filters = {}, sortBy = 'discount') {
  const categories = Array.from(new Set(deals.map((d) => d.category))).sort();
  const stores = Array.from(new Set(deals.map((d) => d.store))).sort();

  // Compute store counts for summary line
  const storeCounts = {};
  deals.forEach((d) => {
    storeCounts[d.store] = (storeCounts[d.store] || 0) + 1;
  });
  const storeSummaryText = Object.entries(storeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([s, c]) => `${s}: ${c} deal${c > 1 ? 's' : ''}`)
    .join(' · ');

  // Compute Best Deals (top 8 by discount %)
  const sortedByDiscount = [...deals].sort((a, b) => percentOff(b) - percentOff(a));
  const top8 = sortedByDiscount.slice(0, 8);

  // Filtered shown count
  const q = query.trim().toLowerCase();
  const cat = filters.category || '';
  const store = filters.store || '';
  const minOff = Number(filters.minOff) || 0;
  const shownCount = deals.filter((d) => {
    const textMatch = q === '' || `${d.title} ${d.store} ${d.category} ${d.verdict || ''}`.toLowerCase().includes(q);
    const catMatch = !cat || d.category === cat;
    const storeMatch = !store || d.store === store;
    return textMatch && catMatch && storeMatch && percentOff(d) >= minOff;
  }).length;

  return `
<div class="store-summary">
  <p><strong>Retailer Breakdown:</strong> ${escape(storeSummaryText)}</p>
</div>

<div class="best-deals-section">
  <h2>🌟 Top 8 Best Deals (Highest Discounts)</h2>
  <div class="best-deals-grid">
    ${top8.map((d, i) => `
      <a class="best-card" href="#/deal/${encodeURIComponent(d.id)}">
        <span class="best-rank">#${i + 1}</span>
        <div class="best-info">
          <strong>${escape(d.title)}</strong>
          <span class="best-retailer">${escape(d.store)}</span>
        </div>
        <div class="best-numbers">
          <span class="best-pct">${percentOff(d)}% off</span>
          <span class="best-save">Save ${usd(dollarsSaved(d))}</span>
          <span class="best-price">${usd(d.price)}</span>
        </div>
      </a>
    `).join('')}
  </div>
</div>

<h1>All Verified Black Friday Deals</h1>
<p class="subtitle">Showing <span id="deal-count">${shownCount}</span> of ${deals.length} deals. Verified live on 27 Nov 2026.</p>

<div class="filters-bar">
  <label class="search-label">Search <input type="search" id="search-input" value="${escape(query)}" placeholder="Search products, stores..."></label>
  <label>Category 
    <select id="filter-category">
      <option value="">All Categories</option>
      ${categories.map((c) => `<option value="${escape(c)}" ${filters.category === c ? 'selected' : ''}>${escape(c)}</option>`).join('')}
    </select>
  </label>
  <label>Store 
    <select id="filter-store">
      <option value="">All Stores</option>
      ${stores.map((s) => `<option value="${escape(s)}" ${filters.store === s ? 'selected' : ''}>${escape(s)}</option>`).join('')}
    </select>
  </label>
  <label>Min Discount 
    <select id="filter-off">
      <option value="0" ${!filters.minOff ? 'selected' : ''}>Any discount</option>
      <option value="20" ${filters.minOff === 20 ? 'selected' : ''}>20%+ off</option>
      <option value="40" ${filters.minOff === 40 ? 'selected' : ''}>40%+ off</option>
      <option value="50" ${filters.minOff === 50 ? 'selected' : ''}>50%+ off</option>
    </select>
  </label>
  <label>Sort By
    <select id="sort-by">
      <option value="discount" ${sortBy === 'discount' ? 'selected' : ''}>Biggest Discount %</option>
      <option value="savings" ${sortBy === 'savings' ? 'selected' : ''}>Biggest Dollars Saved</option>
      <option value="price" ${sortBy === 'price' ? 'selected' : ''}>Lowest Price</option>
    </select>
  </label>
</div>
<ul class="deals">${rows(deals, query, filters, sortBy)}</ul>`;
}

export function deal(d) {
  return `<div class="deal-detail">
<p><a href="#/">&larr; Back to all deals</a></p>
<h1>${escape(d.title)}</h1>
<div class="deal-meta-large">
  <span class="badge store">${escape(d.store)}</span>
  <span class="badge cat">${escape(d.category)}</span>
  <span class="badge off">${percentOff(d)}% off</span>
  <span class="badge savings">Save ${usd(dollarsSaved(d))}</span>
</div>
<div class="price-box">
  <span class="sale-price">${usd(d.price)}</span>
  <span class="usual-price">Was <s>${usd(d.was)}</s></span>
</div>
<p class="verdict-large"><strong>Deal Verification:</strong> ${escape(d.verdict || 'Verified live at store')}</p>
<dl>
  <dt>Store</dt><dd>${escape(d.store)}</dd>
  <dt>Category</dt><dd>${escape(d.category)}</dd>
  <dt>Price</dt><dd>${usd(d.price)}, usually ${usd(d.was)} (${percentOff(d)}% off, save ${usd(dollarsSaved(d))})</dd>
  <dt>Checked At</dt><dd>${day(d.checked)}</dd>
  <dt>Source</dt><dd>${escape(d.source)}</dd>
</dl>
<p class="action-row"><a class="btn-store" href="${escape(d.url)}" rel="noopener" target="_blank">Find it at ${escape(d.store)} &rarr;</a></p>
</div>`;
}

export function missing() {
  return `<div class="not-found">
<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>
</div>`;
}
