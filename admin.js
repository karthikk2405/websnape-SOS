/* ===== ADMIN INTERFACE ===== */
const AdminView = (() => {
  let currentTab = 'orders';
  let refreshInterval = null;
  let menuSearchQuery = '';
  let menuCategoryFilter = 'all';

  function render() {
    if (!DataStore.isAdminLoggedIn()) {
      renderLogin();
    } else {
      renderDashboard();
    }
  }

  // ── Login ──
  function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="admin-login-container">
        <div class="login-card">
          <div class="login-logo">🔐</div>
          <h1>Admin Portal</h1>
          <p class="login-subtitle">SOS Dine Management System</p>
          <form id="loginForm">
            <div class="form-group">
              <label for="adminUsername">Username</label>
              <input type="text" id="adminUsername" placeholder="Enter username" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="adminPassword">Password</label>
              <input type="password" id="adminPassword" placeholder="Enter password" required autocomplete="current-password">
            </div>
            <div class="login-error" id="loginError" style="display:none;">Invalid username or password</div>
            <button type="submit" class="btn-primary login-btn">Login to Dashboard</button>
          </form>
          <p class="login-hint">Default credentials: websnape@admin.com / PNM@2026</p>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUsername').value;
      const p = document.getElementById('adminPassword').value;
      if (DataStore.validateAdmin(u, p)) {
        DataStore.loginAdmin();
        renderDashboard();
      } else {
        const err = document.getElementById('loginError');
        err.style.display = 'block';
        err.classList.add('shake');
        setTimeout(() => err.classList.remove('shake'), 500);
      }
    });
  }

  // ── Dashboard ──
  function renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="admin-container">
        <header class="admin-header">
          <div class="admin-header-content">
            <div class="admin-brand">
              <div class="brand-badge">SOS</div>
              <div class="brand-text">
                <h1>SOS Dine</h1>
                <span class="admin-tag">Management Console</span>
              </div>
            </div>
            <div class="header-actions">
              <a href="#/" class="btn-secondary btn-sm" target="_blank" title="View Customer Home">Customer View ↗</a>
              <button class="btn-secondary btn-sm" id="logoutBtn">Logout</button>
            </div>
          </div>
        </header>

        <nav class="admin-tabs-bar">
          <div class="admin-tabs-container">
            <button class="admin-tab active" data-tab="orders">
              <span class="tab-label">Orders</span>
              <span class="tab-badge" id="orderCountBadge">0</span>
            </button>
            <button class="admin-tab" data-tab="menu">
              <span class="tab-label">Menu Management</span>
            </button>
            <button class="admin-tab" data-tab="qrcodes">
              <span class="tab-label">Table QR Codes</span>
            </button>
            <button class="admin-tab" data-tab="settings">
              <span class="tab-label">Settings</span>
            </button>
          </div>
        </nav>

        <main class="admin-main" id="adminMain"></main>
      </div>
    `;

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        renderTab();
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      DataStore.logoutAdmin();
      cleanup();
      renderLogin();
    });

    renderTab();
    updateOrderBadgeOnly();
    startAutoRefresh();
    setupLiveListeners();
  }

  function updateOrderBadgeOnly() {
    const badge = document.getElementById('orderCountBadge');
    if (badge) {
      const activeOrders = DataStore.getActiveOrders();
      badge.textContent = activeOrders.length;
      badge.style.display = activeOrders.length > 0 ? 'inline-flex' : 'none';
    }
  }

  let liveChannel = null;
  let liveStorageHandler = null;
  let liveCustomHandler = null;

  function handleLiveUpdate() {
    updateOrderBadgeOnly();
    const main = document.getElementById('adminMain');
    if (main && currentTab === 'orders') {
      renderOrdersTab();
    }
  }

  function setupLiveListeners() {
    // Teardown any previous listeners
    teardownLiveListeners();

    // 1. BroadcastChannel (fastest across same-origin tabs/windows)
    if (typeof BroadcastChannel !== 'undefined') {
      liveChannel = new BroadcastChannel('sos_order_channel');
      liveChannel.onmessage = (e) => {
        handleLiveUpdate();
      };
    }

    // 2. Storage event (fires in other tabs when localStorage changes)
    liveStorageHandler = (e) => {
      if (e.key === 'sos_orders' || e.key === null) {
        handleLiveUpdate();
      }
    };
    window.addEventListener('storage', liveStorageHandler);

    // 3. Custom event (fires in the same tab / window)
    liveCustomHandler = (e) => {
      handleLiveUpdate();
    };
    window.addEventListener('sos_order_update', liveCustomHandler);
  }

  function teardownLiveListeners() {
    if (liveChannel) {
      try { liveChannel.close(); } catch (e) {}
      liveChannel = null;
    }
    if (liveStorageHandler) {
      window.removeEventListener('storage', liveStorageHandler);
      liveStorageHandler = null;
    }
    if (liveCustomHandler) {
      window.removeEventListener('sos_order_update', liveCustomHandler);
      liveCustomHandler = null;
    }
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
      // Sync from remote store
      await DataStore.syncOrdersFromRemote();
      
      const main = document.getElementById('adminMain');
      if (main && currentTab === 'orders') {
        renderOrdersTab();
      } else if (main) {
        updateOrderBadgeOnly();
      } else if (!main) {
        cleanup();
      }
    }, 3000);
  }

  function cleanup() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    teardownLiveListeners();
  }

  function renderTab() {
    switch (currentTab) {
      case 'orders': renderOrdersTab(); break;
      case 'menu': renderMenuTab(); break;
      case 'qrcodes': renderQRTab(); break;
      case 'settings': renderSettingsTab(); break;
    }
  }

  // ── Orders Tab ──
  function renderOrdersTab() {
    const main = document.getElementById('adminMain');
    if (!main) return;
    const orders = DataStore.getOrders();
    const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
    
    // Update badge
    const badge = document.getElementById('orderCountBadge');
    if (badge) {
      badge.textContent = activeOrders.length;
      badge.style.display = activeOrders.length > 0 ? 'inline-flex' : 'none';
    }

    // Group by table
    const byTable = {};
    activeOrders.forEach(o => {
      if (!byTable[o.tableNumber]) byTable[o.tableNumber] = [];
      byTable[o.tableNumber].push(o);
    });

    const statusColors = {
      'new': 'status-new',
      'preparing': 'status-preparing',
      'ready': 'status-ready',
      'served': 'status-served',
      'cancelled': 'status-cancelled',
    };

    const statusNext = {
      'new': 'preparing',
      'preparing': 'ready',
      'ready': 'served',
    };

    const statusLabels = {
      'new': 'New Order',
      'preparing': 'Preparing',
      'ready': 'Ready to Serve',
      'served': 'Served',
      'cancelled': 'Cancelled',
    };

    if (activeOrders.length === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <h3>All Caught Up</h3>
          <p>There are no active orders right now. New customer orders will appear here automatically.</p>
          <button class="btn-secondary btn-sm" id="clearServedBtn">Clear Past Served Orders</button>
        </div>
      `;
      const clearBtn = document.getElementById('clearServedBtn');
      if (clearBtn) clearBtn.addEventListener('click', () => { DataStore.clearServedOrders(); renderOrdersTab(); });
      return;
    }

    main.innerHTML = `
      <div class="section-header">
        <div class="section-title-group">
          <h2>Active Orders</h2>
          <span class="section-subtitle">${activeOrders.length} order(s) across ${Object.keys(byTable).length} table(s)</span>
        </div>
        <div class="section-actions">
          <button class="btn-secondary btn-sm" id="clearServedBtn">Clear Served</button>
        </div>
      </div>
      <div class="orders-grid">
        ${Object.keys(byTable).sort((a,b) => a - b).map(tableNum => `
          <div class="table-orders-card">
            <div class="table-card-header">
              <span class="table-number-badge">Table ${tableNum}</span>
              <span class="order-count">${byTable[tableNum].length} order(s)</span>
            </div>
            <div class="table-orders-list">
              ${byTable[tableNum].map(order => `
                <div class="order-item">
                  <div class="order-item-header">
                    <span class="order-id">#${order.id.split('_')[1]}</span>
                    <span class="order-status ${statusColors[order.status]}">${statusLabels[order.status]}</span>
                  </div>
                  <div class="order-items-list">
                    ${order.items.map(i => `
                      <div class="order-line">
                        <img src="${i.image}" alt="" class="order-item-thumb" onerror="this.style.display='none'">
                        <span class="order-line-name">${i.name} × ${i.quantity}</span>
                        <span class="order-line-price">₹${i.price * i.quantity}</span>
                      </div>
                    `).join('')}
                  </div>
                  ${order.notes ? `<div class="order-notes-display">Note: ${order.notes}</div>` : ''}
                  <div class="order-item-footer">
                    <span class="order-total">Total: ₹${order.total}</span>
                    <span class="order-time">${formatTime(order.createdAt)}</span>
                  </div>
                  <div class="order-actions">
                    ${statusNext[order.status] ? `
                      <button class="btn-primary btn-sm status-btn" data-order-id="${order.id}" data-next-status="${statusNext[order.status]}">
                        Mark as ${statusNext[order.status].charAt(0).toUpperCase() + statusNext[order.status].slice(1)}
                      </button>
                    ` : ''}
                    ${order.status === 'new' ? `
                      <button class="btn-danger btn-sm cancel-btn" data-order-id="${order.id}">Cancel</button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Status change buttons
    main.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DataStore.updateOrderStatus(btn.dataset.orderId, btn.dataset.nextStatus);
        renderOrdersTab();
      });
    });

    main.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DataStore.updateOrderStatus(btn.dataset.orderId, 'cancelled');
        renderOrdersTab();
      });
    });

    const clearBtn = document.getElementById('clearServedBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => { DataStore.clearServedOrders(); renderOrdersTab(); });
  }

  function formatTime(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Menu Tab ──
  function renderMenuTab() {
    const main = document.getElementById('adminMain');
    if (!main) return;
    const allItems = DataStore.getMenu();
    const categories = [...new Set(allItems.map(i => i.category))];

    let filtered = allItems;
    if (menuCategoryFilter !== 'all') {
      filtered = filtered.filter(i => i.category === menuCategoryFilter);
    }
    if (menuSearchQuery.trim() !== '') {
      const q = menuSearchQuery.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    main.innerHTML = `
      <div class="menu-management">
        <div class="section-header">
          <div class="section-title-group">
            <h2>Menu Management</h2>
            <span class="section-subtitle">${allItems.length} total dishes listed</span>
          </div>
          <div class="section-actions">
            <button class="btn-primary btn-sm" id="addMenuItemBtn">+ Add New Item</button>
          </div>
        </div>

        <div class="menu-filter-bar">
          <div class="search-input-wrapper">
            <input type="text" id="menuSearchInput" placeholder="Search menu items..." value="${menuSearchQuery}" class="search-input">
          </div>
          <div class="category-select-wrapper">
            <select id="menuCategorySelect" class="filter-select">
              <option value="all" ${menuCategoryFilter === 'all' ? 'selected' : ''}>All Categories (${allItems.length})</option>
              ${categories.map(c => `
                <option value="${c}" ${menuCategoryFilter === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="menu-table-wrapper">
          <table class="menu-table">
            <thead>
              <tr>
                <th style="width: 60px;">Image</th>
                <th>Item Details</th>
                <th style="width: 160px;">Category</th>
                <th style="width: 100px;">Price</th>
                <th style="width: 110px; text-align: center;">Available</th>
                <th style="width: 120px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No items match your filter criteria.
                  </td>
                </tr>
              ` : filtered.map(item => `
                <tr>
                  <td class="menu-table-image">
                    <img src="${item.image}" alt="${item.name}" class="menu-row-thumb" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'">
                  </td>
                  <td>
                    <div class="menu-table-name">${item.name}</div>
                    <div class="menu-table-desc">${item.description}</div>
                  </td>
                  <td><span class="category-badge">${item.category}</span></td>
                  <td class="menu-table-price">₹${item.price}</td>
                  <td style="text-align: center;">
                    <label class="toggle-switch">
                      <input type="checkbox" ${item.available ? 'checked' : ''} data-id="${item.id}" class="toggle-avail">
                      <span class="toggle-slider"></span>
                    </label>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn-secondary btn-sm edit-item-btn" data-id="${item.id}" title="Edit Item">Edit</button>
                    <button class="btn-danger btn-sm delete-item-btn" data-id="${item.id}" title="Delete Item">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" id="menuItemModal" style="display:none;">
        <div class="modal-content">
          <h2 id="modalTitle">Add Menu Item</h2>
          <form id="menuItemForm">
            <input type="hidden" id="editItemId">
            <div class="form-row">
              <div class="form-group">
                <label>Item Name</label>
                <input type="text" id="itemName" required placeholder="e.g. Truffle Fries">
              </div>
              <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" id="itemPrice" required step="1" min="0" placeholder="e.g. 249">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select id="itemCategory">
                  <option>Salads & Soups</option>
                  <option>Starters & Appetizers</option>
                  <option>Pizza & Pasta</option>
                  <option>Mains</option>
                  <option>Beverages</option>
                  <option>Desserts</option>
                </select>
              </div>
              <div class="form-group">
                <label>Image URL</label>
                <input type="url" id="itemImage" placeholder="https://images.unsplash.com/..." required>
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea id="itemDescription" placeholder="Brief description of ingredients or taste..." rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="cancelModalBtn">Cancel</button>
              <button type="submit" class="btn-primary">Save Item</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Search and filter listeners
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        menuSearchQuery = e.target.value;
        renderMenuTab();
        const el = document.getElementById('menuSearchInput');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      });
    }

    const catSelect = document.getElementById('menuCategorySelect');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        menuCategoryFilter = e.target.value;
        renderMenuTab();
      });
    }

    // Toggle availability
    main.querySelectorAll('.toggle-avail').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        DataStore.updateMenuItem(e.target.dataset.id, { available: e.target.checked });
      });
    });

    // Delete
    main.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this menu item?')) {
          DataStore.deleteMenuItem(btn.dataset.id);
          renderMenuTab();
        }
      });
    });

    // Add item
    document.getElementById('addMenuItemBtn').addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = 'Add Menu Item';
      document.getElementById('menuItemForm').reset();
      document.getElementById('editItemId').value = '';
      document.getElementById('menuItemModal').style.display = 'flex';
    });

    // Edit item
    main.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = DataStore.getMenuItem(btn.dataset.id);
        if (!item) return;
        document.getElementById('modalTitle').textContent = 'Edit Menu Item';
        document.getElementById('editItemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemImage').value = item.image;
        document.getElementById('itemDescription').value = item.description;
        document.getElementById('menuItemModal').style.display = 'flex';
      });
    });

    // Cancel modal
    document.getElementById('cancelModalBtn').addEventListener('click', () => {
      document.getElementById('menuItemModal').style.display = 'none';
    });

    // Save item
    document.getElementById('menuItemForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editItemId').value;
      const itemData = {
        name: document.getElementById('itemName').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value,
        image: document.getElementById('itemImage').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        description: document.getElementById('itemDescription').value,
        available: true,
      };

      if (id) {
        DataStore.updateMenuItem(id, itemData);
      } else {
        DataStore.addMenuItem(itemData);
      }

      document.getElementById('menuItemModal').style.display = 'none';
      renderMenuTab();
    });
  }

  // ── QR Codes Tab ──
  function renderQRTab() {
    const main = document.getElementById('adminMain');
    if (!main) return;
    const tableCount = DataStore.getTableCount();

    main.innerHTML = `
      <div class="qr-management">
        <div class="section-header">
          <div class="section-title-group">
            <h2>Table QR Codes</h2>
            <span class="section-subtitle">Printable high-resolution QR codes linking to each table</span>
          </div>
          <div class="section-actions">
            <div class="table-count-control">
              <label for="tableCountInput">Tables:</label>
              <input type="number" id="tableCountInput" value="${tableCount}" min="1" max="50" class="table-count-input">
              <button class="btn-secondary btn-sm" id="updateTablesBtn">Save Count</button>
            </div>
            <button class="btn-primary btn-sm" id="printQRBtn">Print All QR Codes</button>
          </div>
        </div>
        <p class="qr-instructions">Each card shows the dedicated QR code for that table number. Customers scan the code to view the menu and place orders directly.</p>
        <div class="qr-grid" id="qrGrid"></div>
      </div>
    `;

    QRGenerator.renderAllQRCodes(document.getElementById('qrGrid'), tableCount);

    document.getElementById('updateTablesBtn').addEventListener('click', () => {
      const count = parseInt(document.getElementById('tableCountInput').value);
      if (count > 0 && count <= 50) {
        DataStore.setTableCount(count);
        QRGenerator.renderAllQRCodes(document.getElementById('qrGrid'), count);
      }
    });

    document.getElementById('printQRBtn').addEventListener('click', () => {
      QRGenerator.printQRCodes();
    });
  }

  // ── Settings Tab ──
  function renderSettingsTab() {
    const main = document.getElementById('adminMain');
    if (!main) return;
    main.innerHTML = `
      <div class="settings-container">
        <div class="section-header">
          <div class="section-title-group">
            <h2>Settings</h2>
            <span class="section-subtitle">System credentials and maintenance</span>
          </div>
        </div>

        <div class="settings-card">
          <h3 class="settings-card-title">Change Admin Credentials</h3>
          <p class="settings-card-desc">Update the login email and password used to access this console.</p>
          <form id="credsForm">
            <div class="form-group">
              <label>Admin Username / Email</label>
              <input type="text" id="newUsername" required placeholder="New username or email">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>New Password</label>
                <input type="password" id="newPassword" required placeholder="New password">
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="confirmPassword" required placeholder="Confirm password">
              </div>
            </div>
            <div class="settings-error" id="settingsError" style="display:none;"></div>
            <button type="submit" class="btn-primary btn-sm">Update Credentials</button>
          </form>
        </div>

        <div class="settings-card danger-zone">
          <h3 class="settings-card-title danger-title">Danger Zone</h3>
          <p class="settings-card-desc">Irreversible data actions. Use with caution.</p>
          <button class="btn-danger btn-sm" id="clearAllOrdersBtn">Clear All Order History</button>
        </div>
      </div>
    `;

    document.getElementById('credsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('newUsername').value;
      const p = document.getElementById('newPassword').value;
      const c = document.getElementById('confirmPassword').value;
      const errEl = document.getElementById('settingsError');
      if (p !== c) {
        errEl.textContent = 'Passwords do not match';
        errEl.style.display = 'block';
        return;
      }
      DataStore.updateAdminCreds(u, p);
      errEl.style.display = 'none';
      alert('Credentials updated successfully!');
    });

    document.getElementById('clearAllOrdersBtn').addEventListener('click', () => {
      if (confirm('Are you sure? This will delete ALL order history permanently.')) {
        DataStore.clearServedOrders();
        localStorage.setItem('sos_orders', JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('sos_order_update', { detail: { type: 'orders_cleared' } }));
        alert('All orders cleared.');
        updateOrderBadgeOnly();
      }
    });
  }

  return { render, cleanup };
})();
