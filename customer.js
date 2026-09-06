/* ===== CUSTOMER INTERFACE ===== */
const CustomerView = (() => {
  let cart = [];
  let currentTable = null;

  function render(tableNumber) {
    currentTable = parseInt(tableNumber);
    // Restore cart from localStorage on page load or reload
    cart = DataStore.getCart(currentTable);
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
            <button class="cart-btn" id="cartToggleBtn" aria-label="Open Cart">
              <span class="cart-icon">🛒</span>
              <span class="cart-btn-text">Cart</span>
              <span class="cart-badge" id="cartBadge">0</span>
            </button>
          </div>
        </header>

        <!-- Category Tabs -->
        <nav class="category-tabs" id="categoryTabs"></nav>

        <!-- Menu Grid -->
        <main class="menu-grid" id="menuGrid"></main>

        <!-- Bottom Sticky Cart Bar for Mobile -->
        <div class="mobile-cart-bar" id="mobileCartBar">
          <button class="mobile-cart-bar-btn" id="mobileCartBarBtn">
            <div class="mobile-cart-bar-left">
              <span>🛒</span>
              <span id="mobileCartCount">0 items</span>
            </div>
            <div class="mobile-cart-bar-right">
              <span id="mobileCartTotal">View Cart (₹0)</span> →
            </div>
          </button>
        </div>

        <!-- Cart Overlay & Panel -->
        <div class="cart-overlay" id="cartOverlay">
          <div class="cart-panel" id="cartPanel">
            <div class="cart-header">
              <h2>Your Order</h2>
              <button class="close-cart-btn" id="closeCartBtn" aria-label="Close Cart">✕</button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-notes">
              <textarea id="orderNotes" placeholder="Special cooking instructions or requests..."></textarea>
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
        <div class="modal-overlay" id="orderConfirmModal" style="display:none; z-index: 1100;">
          <div class="modal-content confirm-modal" style="text-align: center;">
            <div class="confirm-icon" style="font-size: 3rem; margin-bottom: 12px;">✅</div>
            <h2>Order Placed!</h2>
            <p class="confirm-order-id" id="confirmOrderId" style="font-weight: 700; font-size: 1.1rem; margin: 8px 0; color: var(--primary);"></p>
            <p class="confirm-msg" style="color: var(--text-secondary); margin-bottom: 24px;">Your order has been sent to the kitchen.<br>Estimated time: <strong>15-25 minutes</strong></p>
            <button class="btn-primary" id="newOrderBtn" style="width: 100%; padding: 12px;">Browse Menu Again</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderMenu() {
    const menuByCategory = DataStore.getMenuByCategory();
    const categories = Object.keys(menuByCategory);
    const tabsEl = document.getElementById('categoryTabs');
    if (!tabsEl) return;

    // Category tabs
    tabsEl.innerHTML = `
      <button class="cat-tab active" data-category="all">All</button>
      ${categories.map(c => `<button class="cat-tab" data-category="${c}">${c}</button>`).join('')}
    `;

    // Menu items
    renderMenuItems(menuByCategory, 'all');

    // Tab click events
    tabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.cat-tab');
      if (tab) {
        tabsEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderMenuItems(menuByCategory, tab.dataset.category);
      }
    });
  }

  function renderMenuItems(menuByCategory, activeCategory) {
    const gridEl = document.getElementById('menuGrid');
    if (!gridEl) return;
    let items = [];

    if (activeCategory === 'all') {
      Object.values(menuByCategory).forEach(catItems => items.push(...catItems));
    } else {
      items = menuByCategory[activeCategory] || [];
    }

    gridEl.innerHTML = items.map(item => `
      <div class="menu-card" data-id="${item.id}">
        <div class="menu-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'">
        </div>
        <div class="menu-card-body">
          <h3 class="menu-item-name">${item.name}</h3>
          <p class="menu-item-desc">${item.description}</p>
          <div class="menu-card-footer">
            <span class="menu-item-price">₹${item.price}</span>
            <div class="qty-controls">
              <button class="qty-btn minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value" id="qty_${item.id}">0</span>
              <button class="qty-btn plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Update displayed quantities from restored cart
    cart.forEach(ci => {
      const qtyEl = document.getElementById('qty_' + ci.id);
      if (qtyEl) qtyEl.textContent = ci.quantity;
    });

    // Bind quantity buttons
    gridEl.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (e.currentTarget.classList.contains('plus')) {
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
    persistCart();
    updateQtyDisplay(itemId);
    updateCartBadge();
    renderCartPanel();
  }

  function removeFromCart(itemId) {
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity--;
      if (existing.quantity <= 0) {
        cart = cart.filter(c => c.id !== itemId);
      }
    }
    persistCart();
    updateQtyDisplay(itemId);
    updateCartBadge();
    renderCartPanel();
  }

  function persistCart() {
    if (currentTable) {
      DataStore.saveCart(currentTable, cart);
    }
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
    const totalCount = cart.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }

    // Update bottom mobile floating bar
    const mobileBar = document.getElementById('mobileCartBar');
    const mobileCount = document.getElementById('mobileCartCount');
    const mobileTotal = document.getElementById('mobileCartTotal');
    if (mobileBar && mobileCount && mobileTotal) {
      if (totalCount > 0) {
        mobileBar.style.display = 'block';
        mobileCount.textContent = `${totalCount} item${totalCount > 1 ? 's' : ''}`;
        mobileTotal.textContent = `View Cart (₹${totalPrice})`;
      } else {
        mobileBar.style.display = 'none';
      }
    }
  }

  function renderCartPanel() {
    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!itemsEl || !totalEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="cart-empty"><span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🛒</span><p>Your cart is empty.<br>Add dishes from the menu to order.</p></div>';
      totalEl.textContent = '₹0';
      return;
    }

    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price} each</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="qty-controls">
            <button class="qty-btn minus cart-qty-btn" data-id="${item.id}" aria-label="Decrease">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn plus cart-qty-btn" data-id="${item.id}" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-subtotal">₹${item.price * item.quantity}</div>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    totalEl.textContent = '₹' + total;

    // Attach quantity event handlers inside cart panel
    itemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (e.currentTarget.classList.contains('plus')) {
          addToCart(id);
        } else {
          removeFromCart(id);
        }
      });
    });
  }

  function openCart() {
    renderCartPanel();
    const overlay = document.getElementById('cartOverlay');
    const panel = document.getElementById('cartPanel');
    if (overlay) overlay.classList.add('open');
    if (panel) panel.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling on mobile
  }

  function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const panel = document.getElementById('cartPanel');
    if (overlay) overlay.classList.remove('open');
    if (panel) panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindEvents() {
    // Header cart button
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    if (cartToggleBtn) {
      cartToggleBtn.addEventListener('click', openCart);
    }

    // Mobile floating cart bar
    const mobileCartBarBtn = document.getElementById('mobileCartBarBtn');
    if (mobileCartBarBtn) {
      mobileCartBarBtn.addEventListener('click', openCart);
    }

    // Close button
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', closeCart);
    }

    // Click outside on overlay
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
          closeCart();
        }
      });
    }

    // Place order
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        const notes = document.getElementById('orderNotes').value;
        const order = DataStore.placeOrder(currentTable, cart, notes);
        closeCart();
        document.getElementById('confirmOrderId').textContent = 'Order #' + order.id.split('_')[1];
        document.getElementById('orderConfirmModal').style.display = 'flex';
        // Clear cart for this table after order is confirmed
        cart = [];
        DataStore.clearCart(currentTable);
        updateCartBadge();
        // Update menu quantities to 0
        document.querySelectorAll('.qty-value').forEach(el => el.textContent = '0');
      });
    }

    // New order after confirm
    const newOrderBtn = document.getElementById('newOrderBtn');
    if (newOrderBtn) {
      newOrderBtn.addEventListener('click', () => {
        document.getElementById('orderConfirmModal').style.display = 'none';
        render(currentTable);
      });
    }
  }

  return { render };
})();
