/* ===== CUSTOMER INTERFACE ===== */
const CustomerView = (() => {
  let cart = [];
  let currentTable = null;

  function render(tableNumber) {
    currentTable = parseInt(tableNumber);
    cart = [];
    const app = document.getElementById('app');
    app.innerHTML = getCustomerHTML();
    renderMenu();
    bindEvents();
    updateCartBadge();
  }

  function getCustomerHTML() {
    return `
      <div class="customer-container">
        <!-- Header -->
        <header class="customer-header">
          <div class="header-content">
            <div class="header-left">
              <div class="logo-icon">🍽️</div>
              <div>
                <h1 class="restaurant-name">SOS Dine</h1>
                <p class="table-badge">Table ${currentTable}</p>
              </div>
            </div>
            <button class="cart-btn" id="cartToggleBtn">
              <span class="cart-icon">🛒</span>
              <span class="cart-badge" id="cartBadge">0</span>
            </button>
          </div>
        </header>

        <!-- Category Tabs -->
        <nav class="category-tabs" id="categoryTabs"></nav>

        <!-- Menu Grid -->
        <main class="menu-grid" id="menuGrid"></main>

        <!-- Cart Overlay -->
        <div class="cart-overlay" id="cartOverlay">
          <div class="cart-panel" id="cartPanel">
            <div class="cart-header">
              <h2>Your Order</h2>
              <button class="close-cart-btn" id="closeCartBtn">✕</button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-notes">
              <textarea id="orderNotes" placeholder="Any special requests or notes..."></textarea>
            </div>
            <div class="cart-footer">
              <div class="cart-total">
                <span>Total</span>
                <span id="cartTotal">₹0</span>
              </div>
              <button class="place-order-btn" id="placeOrderBtn">Place Order</button>
            </div>
          </div>
        </div>

        <!-- Order Confirmation Modal -->
        <div class="modal-overlay" id="orderConfirmModal" style="display:none;">
          <div class="modal-content confirm-modal">
            <div class="confirm-icon">✅</div>
            <h2>Order Placed!</h2>
            <p class="confirm-order-id" id="confirmOrderId"></p>
            <p class="confirm-msg">Your order has been sent to the kitchen.<br>Estimated time: <strong>15-25 minutes</strong></p>
            <button class="btn-primary" id="newOrderBtn">Browse Menu Again</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderMenu() {
    const menuByCategory = DataStore.getMenuByCategory();
    const categories = Object.keys(menuByCategory);
    const tabsEl = document.getElementById('categoryTabs');
    const gridEl = document.getElementById('menuGrid');

    // Category tabs
    tabsEl.innerHTML = `
      <button class="cat-tab active" data-category="all">All</button>
      ${categories.map(c => `<button class="cat-tab" data-category="${c}">${c}</button>`).join('')}
    `;

    // Menu items
    renderMenuItems(menuByCategory, 'all');

    // Tab click events
    tabsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('cat-tab')) {
        tabsEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderMenuItems(menuByCategory, e.target.dataset.category);
      }
    });
  }

  function renderMenuItems(menuByCategory, activeCategory) {
    const gridEl = document.getElementById('menuGrid');
    let items = [];

    if (activeCategory === 'all') {
      Object.values(menuByCategory).forEach(catItems => items.push(...catItems));
    } else {
      items = menuByCategory[activeCategory] || [];
    }

    gridEl.innerHTML = items.map(item => `
      <div class="menu-card" data-id="${item.id}">
        <div class="menu-card-emoji">${item.image}</div>
        <div class="menu-card-body">
          <h3 class="menu-item-name">${item.name}</h3>
          <p class="menu-item-desc">${item.description}</p>
          <div class="menu-card-footer">
            <span class="menu-item-price">₹${item.price}</span>
            <div class="qty-controls">
              <button class="qty-btn minus" data-id="${item.id}">−</button>
              <span class="qty-value" id="qty_${item.id}">0</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Update displayed quantities from cart
    cart.forEach(ci => {
      const qtyEl = document.getElementById('qty_' + ci.id);
      if (qtyEl) qtyEl.textContent = ci.quantity;
    });

    // Bind quantity buttons
    gridEl.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('plus')) {
          addToCart(id);
        } else {
          removeFromCart(id);
        }
      });
    });
  }

  function addToCart(itemId) {
    const menuItem = DataStore.getMenuItem(itemId);
    if (!menuItem) return;
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...menuItem, quantity: 1 });
    }
    updateQtyDisplay(itemId);
    updateCartBadge();
  }

  function removeFromCart(itemId) {
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity--;
      if (existing.quantity <= 0) {
        cart = cart.filter(c => c.id !== itemId);
      }
    }
    updateQtyDisplay(itemId);
    updateCartBadge();
  }

  function updateQtyDisplay(itemId) {
    const qtyEl = document.getElementById('qty_' + itemId);
    if (qtyEl) {
      const ci = cart.find(c => c.id === itemId);
      qtyEl.textContent = ci ? ci.quantity : 0;
    }
  }

  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  function renderCartPanel() {
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>';
      totalEl.textContent = '₹0';
      return;
    }

    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-emoji">${item.image}</span>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
          </div>
        </div>
        <div class="cart-item-subtotal">₹${item.price * item.quantity}</div>
      </div>
    `).join('');

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    totalEl.textContent = '₹' + total;
  }

  function bindEvents() {
    // Cart toggle
    document.getElementById('cartToggleBtn').addEventListener('click', () => {
      renderCartPanel();
      document.getElementById('cartOverlay').classList.add('open');
    });

    document.getElementById('closeCartBtn').addEventListener('click', () => {
      document.getElementById('cartOverlay').classList.remove('open');
    });

    document.getElementById('cartOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'cartOverlay') {
        document.getElementById('cartOverlay').classList.remove('open');
      }
    });

    // Place order
    document.getElementById('placeOrderBtn').addEventListener('click', () => {
      if (cart.length === 0) return;
      const notes = document.getElementById('orderNotes').value;
      const order = DataStore.placeOrder(currentTable, cart, notes);
      document.getElementById('cartOverlay').classList.remove('open');
      document.getElementById('confirmOrderId').textContent = 'Order #' + order.id.split('_')[1];
      document.getElementById('orderConfirmModal').style.display = 'flex';
      cart = [];
      updateCartBadge();
    });

    // New order after confirm
    document.getElementById('newOrderBtn').addEventListener('click', () => {
      document.getElementById('orderConfirmModal').style.display = 'none';
      render(currentTable);
    });
  }

  return { render };
})();
