/* ===== ROUTER ===== */
const Router = (() => {
  function getRoute() {
    const hash = window.location.hash || '';
    // /#/table/5  → { view: 'customer', table: 5 }
    // /#/admin    → { view: 'admin' }
    // /           → { view: 'home' }
    const tableMatch = hash.match(/^#\/table\/(\d+)$/);
    if (tableMatch) {
      return { view: 'customer', table: parseInt(tableMatch[1]) };
    }
    if (hash === '#/admin' || hash.startsWith('#/admin')) {
      return { view: 'admin' };
    }
    return { view: 'home' };
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function renderHome() {
    const app = document.getElementById('app');
    const tableCount = DataStore.getTableCount();
    
    app.innerHTML = `
      <div class="home-container">
        <div class="home-content">
          <div class="home-logo">🍽️</div>
          <h1 class="home-title">SOS Dine</h1>
          <p class="home-subtitle">Smart Ordering System</p>
          <div class="home-divider"></div>
          
          <div id="homeInitialState">
            <p class="home-desc">Welcome to SOS Dine. Tap below to select your table and order.</p>
            <button class="btn-primary" id="homeOrderBtn" style="font-size: 1.2rem; padding: 12px 32px;">Order</button>
          </div>

          <div id="homeTableSelection" style="display:none; margin-top: 24px;">
            <p class="home-desc">Select your table number to view menu</p>
            <div class="table-grid">
              ${Array.from({length: tableCount}, (_, i) => i + 1).map(num => `
                <button class="table-select-btn" data-table="${num}">${num}</button>
              `).join('')}
            </div>
          </div>

          <div class="home-admin-link">
            <a href="#/admin" class="btn-secondary home-btn">Admin Panel</a>
          </div>
        </div>
      </div>

      <!-- QR Modal -->
      <div class="modal-overlay" id="homeQrModal" style="display:none; z-index: 9999;">
        <div class="modal-content" style="text-align: center;">
          <h2 id="homeQrTitle">Table X</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Scan with phone camera to order</p>
          <div id="homeQrContainer" style="display: flex; justify-content: center; margin: 20px 0;"></div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <a href="#" id="homeQrDirectBtn" class="btn-primary" style="text-decoration: none;">Open Menu Directly</a>
            <button class="btn-secondary" id="closeHomeQrBtn">Close</button>
          </div>
        </div>
      </div>
    `;

    const orderBtn = document.getElementById('homeOrderBtn');
    const tableSelection = document.getElementById('homeTableSelection');
    const initialState = document.getElementById('homeInitialState');
    const qrModal = document.getElementById('homeQrModal');
    const qrContainer = document.getElementById('homeQrContainer');
    const qrTitle = document.getElementById('homeQrTitle');

    if (orderBtn) {
      orderBtn.addEventListener('click', () => {
        initialState.style.display = 'none';
        tableSelection.style.display = 'block';
      });
    }

    app.querySelectorAll('.table-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tableNum = e.currentTarget.dataset.table;
        qrTitle.textContent = `Table ${tableNum}`;
        qrContainer.innerHTML = '';
        
        const url = QRGenerator.getTableUrl(tableNum);
        const qrEl = document.createElement('div');
        qrEl.innerHTML = QRGenerator.generateQR(url, 7);
        
        qrContainer.appendChild(qrEl);
        document.getElementById('homeQrDirectBtn').href = `#/table/${tableNum}`;
        qrModal.style.display = 'flex';
      });
    });

    document.getElementById('closeHomeQrBtn').addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
  }

  function handleRoute() {
    AdminView.cleanup();
    const route = getRoute();
    switch (route.view) {
      case 'customer':
        CustomerView.render(route.table);
        break;
      case 'admin':
        AdminView.render();
        break;
      default:
        renderHome();
    }
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  return { init, navigate };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});
