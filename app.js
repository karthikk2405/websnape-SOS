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
    app.innerHTML = `
      <div class="home-container">
        <div class="home-content">
          <div class="home-logo">🍽️</div>
          <h1 class="home-title">SOS Dine</h1>
          <p class="home-subtitle">Smart Ordering System</p>
          <div class="home-divider"></div>
          <div class="home-qr-prompt">
            <div class="scan-icon">📱</div>
            <p class="home-desc">Please scan the <strong>QR code</strong> on your table to view our menu and place your order.</p>
          </div>
          <div class="home-admin-link">
            <a href="#/admin" class="btn-secondary home-btn">Admin Panel</a>
          </div>
        </div>
        <div class="home-particles">
          ${Array.from({length: 20}, (_, i) => `<div class="particle" style="--i:${i}"></div>`).join('')}
        </div>
      </div>
    `;
  }

  function handleRoute() {
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
