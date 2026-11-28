// Dynamic View Generators for Black Friday Deal Finder v3
// Renders the Hero Deal, Top-10 Best Deals ranked by percent discount,
// Computed Savings Summary, Filterable Deal List, and Deal Detail View.

export function renderListView(deals, filters, onFilterChange) {
  // 1. Compute Hero Deal (single biggest dollar saving)
  const heroDeal = [...deals].sort((a, b) => b.save - a.save)[0];

  // 2. Compute Top 10 Best Deals ranked by percent discount (then dollar save)
  const top10Deals = [...deals]
    .sort((a, b) => b.percent - a.percent || b.save - a.save)
    .slice(0, 10);

  // 3. Compute Savings Summary Bar metrics across all deals
  const totalSaved = deals.reduce((acc, d) => acc + d.save, 0);
  const avgPercent = Math.round(deals.reduce((acc, d) => acc + d.percent, 0) / deals.length);

  // 4. Filter and sort deals for the main list view
  const filteredDeals = deals.filter(deal => {
    if (filters.search && !deal.title.toLowerCase().includes(filters.search.toLowerCase()) && !deal.store.toLowerCase().includes(filters.search.toLowerCase()) && !deal.category.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && deal.category !== filters.category) return false;
    if (filters.store && deal.store !== filters.store) return false;
    if (filters.minDiscount && deal.percent < Number(filters.minDiscount)) return false;
    return true;
  });

  // Sort deals
  filteredDeals.sort((a, b) => {
    if (filters.sort === 'percent') return b.percent - a.percent || b.save - a.save;
    if (filters.sort === 'savings') return b.save - a.save || b.percent - a.percent;
    if (filters.sort === 'price-asc') return a.price - b.price;
    return b.percent - a.percent;
  });

  const categories = [...new Set(deals.map(d => d.category))].sort();
  const stores = [...new Set(deals.map(d => d.store))].sort();

  return `
    ${heroDeal ? `
      <section class="hero-deal-card">
        <div class="hero-tag">🔥 Deal of the Day — Biggest Dollar Saving</div>
        <div class="hero-grid">
          <div class="hero-content">
            <h2>${escapeHtml(heroDeal.title)}</h2>
            <div class="store-meta">Retailer: <strong>${escapeHtml(heroDeal.store)}</strong> &bull; Category: <strong>${escapeHtml(heroDeal.category)}</strong></div>
            <p class="verdict">"${escapeHtml(heroDeal.verdict)}"</p>
            <div class="hero-pricing">
              <span class="hero-price">$${heroDeal.price.toFixed(2)}</span>
              <span class="hero-was">$${heroDeal.was.toFixed(2)}</span>
              <span class="hero-savings">Save $${heroDeal.save.toFixed(2)} (${heroDeal.percent}%)</span>
            </div>
          </div>
          <div class="hero-action">
            <a href="#/deal/${heroDeal.id}" class="btn btn-secondary">View Verification</a>
            <a href="${escapeHtml(heroDeal.url)}" target="_blank" rel="noopener noreferrer" class="btn">Shop at ${escapeHtml(heroDeal.store)} &rarr;</a>
          </div>
        </div>
      </section>
    ` : ''}

    <section>
      <div class="section-title">
        <span>🏆 Top 10 Best Deals (Ranked by Discount)</span>
      </div>
      <div class="best-deals-grid">
        ${top10Deals.map((deal, idx) => `
          <a href="#/deal/${deal.id}" class="best-card">
            <div class="rank-badge">#${idx + 1} &bull; ${deal.percent}% OFF</div>
            <h3>${escapeHtml(deal.title)}</h3>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">${escapeHtml(deal.store)}</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 1.15rem; font-weight: 800; color: var(--accent-green);">$${deal.price.toFixed(2)}</span>
                <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 700;">Save $${deal.save.toFixed(2)}</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>

    <section class="summary-bar">
      <div class="summary-metric">
        <div class="val">$${totalSaved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div class="lbl">Total Dollars Saved across 56 Deals</div>
      </div>
      <div class="summary-metric">
        <div class="val">${avgPercent}%</div>
        <div class="lbl">Average Discount Percent</div>
      </div>
      <div class="summary-metric">
        <div class="val">${deals.length}</div>
        <div class="lbl">Verified Live Deals</div>
      </div>
    </section>

    <div class="filters-panel" id="filters-form">
      <div class="filter-group">
        <label for="search-input">Search Deals</label>
        <input type="text" id="search-input" placeholder="Search product, store..." value="${escapeHtml(filters.search)}">
      </div>
      <div class="filter-group">
        <label for="category-select">Category</label>
        <select id="category-select">
          <option value="">All Categories (${categories.length})</option>
          ${categories.map(cat => `<option value="${cat}" ${filters.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="store-select">Retailer</label>
        <select id="store-select">
          <option value="">All Retailers (${stores.length})</option>
          ${stores.map(st => `<option value="${st}" ${filters.store === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="discount-select">Minimum Discount</label>
        <select id="discount-select">
          <option value="">Any Discount</option>
          <option value="20" ${filters.minDiscount === '20' ? 'selected' : ''}>20%+ Off</option>
          <option value="40" ${filters.minDiscount === '40' ? 'selected' : ''}>40%+ Off</option>
          <option value="50" ${filters.minDiscount === '50' ? 'selected' : ''}>50%+ Off</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="sort-select">Sort By</label>
        <select id="sort-select">
          <option value="percent" ${filters.sort === 'percent' ? 'selected' : ''}>Biggest Discount %</option>
          <option value="savings" ${filters.sort === 'savings' ? 'selected' : ''}>Biggest Dollars Saved</option>
          <option value="price-asc" ${filters.sort === 'price-asc' ? 'selected' : ''}>Lowest Price</option>
        </select>
      </div>
    </div>

    <div class="results-status">
      <span>Showing <strong>${filteredDeals.length}</strong> of ${deals.length} verified Black Friday deals</span>
      <button id="reset-filters" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">Reset Filters</button>
    </div>

    <div class="deals-table">
      ${filteredDeals.length === 0 ? `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-secondary); border-radius: 12px;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No matching deals found.</p>
          <p style="font-size: 0.9rem;">Try adjusting your search terms or filter criteria.</p>
        </div>
      ` : filteredDeals.map(deal => `
        <a href="#/deal/${deal.id}" class="deal-row">
          <div class="deal-info">
            <h4>${escapeHtml(deal.title)}</h4>
            <div class="deal-meta-tags">
              <span class="badge-store">${escapeHtml(deal.store)}</span>
              <span class="badge-cat">${escapeHtml(deal.category)}</span>
            </div>
          </div>
          <div class="deal-price-box">
            <div class="sale">$${deal.price.toFixed(2)}</div>
            <div class="was">Was $${deal.was.toFixed(2)}</div>
          </div>
          <div class="deal-saving-box">
            <div class="percent">${deal.percent}% OFF</div>
            <div class="dollars">Save $${deal.save.toFixed(2)}</div>
          </div>
          <div class="deal-verdict">
            <p>"${escapeHtml(deal.verdict)}"</p>
          </div>
          <div>
            <span class="btn btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;">Inspect &rarr;</span>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

export function renderDetailView(deal) {
  if (!deal) {
    return `
      <div style="text-align: center; padding: 4rem;">
        <h2>Deal Not Found</h2>
        <p style="color: var(--text-muted); margin: 1rem 0;">The requested deal ID could not be located in our catalog.</p>
        <a href="#/" class="btn">&larr; Back to All Deals</a>
      </div>
    `;
  }

  return `
    <div style="margin-bottom: 1.5rem;">
      <a href="#/" class="btn btn-secondary">&larr; Back to All Deals</a>
    </div>

    <div class="deal-detail-view">
      <div class="deal-detail-header">
        <div class="deal-meta-tags" style="margin-bottom: 1rem;">
          <span class="badge-store" style="font-size: 0.9rem; padding: 4px 10px;">${escapeHtml(deal.store)}</span>
          <span class="badge-cat" style="font-size: 0.9rem; padding: 4px 10px;">${escapeHtml(deal.category)}</span>
        </div>
        <h2>${escapeHtml(deal.title)}</h2>
        <p class="verdict" style="font-size: 1.1rem; color: var(--accent-cyan);">"${escapeHtml(deal.verdict)}"</p>
      </div>

      <div style="display: flex; gap: 20px; align-items: baseline; margin-bottom: 2rem; background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Sale Price</div>
          <div style="font-size: 2.5rem; font-weight: 900; color: var(--accent-green);">$${deal.price.toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Usual Price</div>
          <div style="font-size: 1.25rem; text-decoration: line-through; color: var(--text-muted);">$${deal.was.toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total Savings</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-gold);">$${deal.save.toFixed(2)} (${deal.percent}% off)</div>
        </div>
      </div>

      <div class="verification-box">
        <h3>Live Price Verification & Source</h3>
        <ul>
          <li>Retailer Source: <strong>${escapeHtml(deal.source)}</strong></li>
          <li>Verified Check Time: <strong>${escapeHtml(deal.checked)}</strong></li>
          <li>Live Deal Price: <strong>$${deal.price.toFixed(2)}</strong> (Compared against usual price of <strong>$${deal.was.toFixed(2)}</strong>)</li>
          <li>Store Search URL: <a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); word-break: break-all;">${escapeHtml(deal.url)}</a></li>
        </ul>
      </div>

      <div style="display: flex; gap: 16px; margin-top: 2rem;">
        <a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer" class="btn" style="flex: 1; justify-content: center; padding: 16px;">Open ${escapeHtml(deal.store)} Live Deal &rarr;</a>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
