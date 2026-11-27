// Render module for Black Friday Deal Finder 2026.
// Converts deal data into sanitized HTML fragments for list, filtering, sort, and detail views.

const sanitize = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const formatCurrency = (val) => `$${val.toLocaleString('en-US')}`;
const calcDiscount = (item) => Math.round((1 - item.price / item.was) * 100);
const calcSavings = (item) => Math.round(item.was - item.price);
const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

export function rows(dealCollection, queryStr, filterOpts = {}, sortMethod = 'discount') {
  const searchTerm = queryStr.trim().toLowerCase();
  const selectedCat = filterOpts.category || '';
  const selectedStore = filterOpts.store || '';
  const minimumDiscount = Number(filterOpts.minOff) || 0;

  const filteredCollection = dealCollection.filter((item) => {
    const matchesQuery = searchTerm === '' || `${item.title} ${item.store} ${item.category} ${item.verdict || ''}`.toLowerCase().includes(searchTerm);
    const matchesCat = !selectedCat || item.category === selectedCat;
    const matchesStore = !selectedStore || item.store === selectedStore;
    const discPct = calcDiscount(item);
    const matchesDiscount = discPct >= minimumDiscount;
    return matchesQuery && matchesCat && matchesStore && matchesDiscount;
  });

  if (sortMethod === 'savings') {
    filteredCollection.sort((a, b) => calcSavings(b) - calcSavings(a));
  } else if (sortMethod === 'price') {
    filteredCollection.sort((a, b) => a.price - b.price);
  } else {
    filteredCollection.sort((a, b) => calcDiscount(b) - calcDiscount(a));
  }

  if (filteredCollection.length === 0) {
    return '<li class="empty-notice">No deals found matching your filters. Try adjusting your criteria.</li>';
  }

  return filteredCollection
    .map(
      (item) => `<li>
  <div class="card-primary">
    <a href="#/deal/${encodeURIComponent(item.id)}">${sanitize(item.title)}</a>
    <div class="tag-row">
      <span class="tag merchant">${sanitize(item.store)}</span>
      <span class="tag segment">${sanitize(item.category)}</span>
      <span class="tag reduction">${calcDiscount(item)}% off</span>
      <span class="tag cash-saved">Save ${formatCurrency(calcSavings(item))}</span>
    </div>
  </div>
  <div class="card-pricing">
    <span class="current-price">${formatCurrency(item.price)}</span>
    <span class="original-price"><s>${formatCurrency(item.was)}</s></span>
  </div>
  <p class="expert-verdict">${sanitize(item.verdict || 'Live verified deal')}</p>
</li>`,
    )
    .join('');
}

export function list(dealCollection, queryStr = '', filterOpts = {}, sortMethod = 'discount') {
  const allCategories = Array.from(new Set(dealCollection.map((item) => item.category))).sort();
  const allStores = Array.from(new Set(dealCollection.map((item) => item.store))).sort();

  const countsByStore = {};
  dealCollection.forEach((item) => {
    countsByStore[item.store] = (countsByStore[item.store] || 0) + 1;
  });
  const storeSummaryString = Object.entries(countsByStore)
    .sort((a, b) => b[1] - a[1])
    .map(([storeName, count]) => `${storeName}: ${count} deal${count > 1 ? 's' : ''}`)
    .join(' · ');

  const bestDealsSorted = [...dealCollection].sort((a, b) => calcDiscount(b) - calcDiscount(a));
  const topEight = bestDealsSorted.slice(0, 8);

  const searchTerm = queryStr.trim().toLowerCase();
  const selectedCat = filterOpts.category || '';
  const selectedStore = filterOpts.store || '';
  const minimumDiscount = Number(filterOpts.minOff) || 0;

  const currentShownCount = dealCollection.filter((item) => {
    const matchesQuery = searchTerm === '' || `${item.title} ${item.store} ${item.category} ${item.verdict || ''}`.toLowerCase().includes(searchTerm);
    const matchesCat = !selectedCat || item.category === selectedCat;
    const matchesStore = !selectedStore || item.store === selectedStore;
    return matchesQuery && matchesCat && matchesStore && calcDiscount(item) >= minimumDiscount;
  }).length;

  return `
<div class="merchant-overview">
  <p><strong>Retailer Inventory:</strong> ${sanitize(storeSummaryString)}</p>
</div>

<div class="featured-strip">
  <h2>🔥 Top 8 Premier Discounts</h2>
  <div class="featured-grid">
    ${topEight.map((item, index) => `
      <a class="featured-item" href="#/deal/${encodeURIComponent(item.id)}">
        <span class="rank-badge">Rank #${index + 1}</span>
        <div class="featured-details">
          <strong>${sanitize(item.title)}</strong>
          <span class="featured-store">${sanitize(item.store)}</span>
        </div>
        <div class="featured-numbers">
          <span class="featured-pct">${calcDiscount(item)}% off</span>
          <span class="featured-savings">Save ${formatCurrency(calcSavings(item))}</span>
          <span class="featured-cost">${formatCurrency(item.price)}</span>
        </div>
      </a>
    `).join('')}
  </div>
</div>

<h1>Black Friday Verified Deal Collection</h1>
<p class="intro-note">Displaying <span id="deal-count">${currentShownCount}</span> of ${dealCollection.length} verified live deals. Checked November 27, 2026.</p>

<div class="control-panel">
  <label class="control-search">Search Deals <input type="search" id="search-input" value="${sanitize(queryStr)}" placeholder="Search items, stores..."></label>
  <label>Category 
    <select id="filter-category">
      <option value="">All Categories</option>
      ${allCategories.map((cat) => `<option value="${sanitize(cat)}" ${filterOpts.category === cat ? 'selected' : ''}>${sanitize(cat)}</option>`).join('')}
    </select>
  </label>
  <label>Store 
    <select id="filter-store">
      <option value="">All Retailers</option>
      ${allStores.map((st) => `<option value="${sanitize(st)}" ${filterOpts.store === st ? 'selected' : ''}>${sanitize(st)}</option>`).join('')}
    </select>
  </label>
  <label>Minimum Discount 
    <select id="filter-off">
      <option value="0" ${!filterOpts.minOff ? 'selected' : ''}>Any discount</option>
      <option value="20" ${filterOpts.minOff === 20 ? 'selected' : ''}>20%+ off</option>
      <option value="40" ${filterOpts.minOff === 40 ? 'selected' : ''}>40%+ off</option>
      <option value="50" ${filterOpts.minOff === 50 ? 'selected' : ''}>50%+ off</option>
    </select>
  </label>
  <label>Sort Order
    <select id="sort-by">
      <option value="discount" ${sortMethod === 'discount' ? 'selected' : ''}>Biggest Discount %</option>
      <option value="savings" ${sortMethod === 'savings' ? 'selected' : ''}>Biggest Dollars Saved</option>
      <option value="price" ${sortMethod === 'price' ? 'selected' : ''}>Lowest Price</option>
    </select>
  </label>
</div>
<ul class="deals">${rows(dealCollection, queryStr, filterOpts, sortMethod)}</ul>`;
}

export function deal(item) {
  return `<div class="detail-container">
<p><a href="#/">&larr; Return to complete deal list</a></p>
<h1>${sanitize(item.title)}</h1>
<div class="tag-row-large">
  <span class="tag merchant">${sanitize(item.store)}</span>
  <span class="tag segment">${sanitize(item.category)}</span>
  <span class="tag reduction">${calcDiscount(item)}% off</span>
  <span class="tag cash-saved">Save ${formatCurrency(calcSavings(item))}</span>
</div>
<div class="cost-display-box">
  <span class="promo-price">${formatCurrency(item.price)}</span>
  <span class="standard-price">Regular <s>${formatCurrency(item.was)}</s></span>
</div>
<p class="verdict-banner"><strong>Verification Report:</strong> ${sanitize(item.verdict || 'Verified live at retailer')}</p>
<dl class="specs-list">
  <dt>Retailer</dt><dd>${sanitize(item.store)}</dd>
  <dt>Category</dt><dd>${sanitize(item.category)}</dd>
  <dt>Pricing</dt><dd>${formatCurrency(item.price)} (normally ${formatCurrency(item.was)} — ${calcDiscount(item)}% discount, saving ${formatCurrency(calcSavings(item))})</dd>
  <dt>Verification Timestamp</dt><dd>${formatTimestamp(item.checked)}</dd>
  <dt>Source Reference</dt><dd>${sanitize(item.source)}</dd>
</dl>
<p class="cta-row"><a class="store-link-btn" href="${sanitize(item.url)}" rel="noopener" target="_blank">Shop this deal at ${sanitize(item.store)} &rarr;</a></p>
</div>`;
}

export function missing() {
  return `<div class="error-container">
<h1>Deal Not Found</h1>
<p>The requested deal does not exist or has expired. <a href="#/">Browse all active deals</a>.</p>
</div>`;
}
