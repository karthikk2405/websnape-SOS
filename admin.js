/* ===== ADMIN INTERFACE ===== */
const AdminView = (() => {
  let currentTab = 'orders';
  let refreshInterval = null;

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
          <h1>Admin Login</h1>
          <p class="login-subtitle">SOS Dine Management</p>
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
            <button type="submit" class="btn-primary login-btn">Login</button>
          </form>
          <p class="login-hint">Default: websnape@admin.com / PNM@2026</p>
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
          <div class="header-content">
            <div class="header-left">
              <div class="logo-icon">🍽️</div>
              <h1>SOS Dine <span class="admin-tag">Admin</span></h1>
            </div>
            <div class="header-right">
              <button class="btn-secondary" id="logoutBtn">Logout</button>
            </div>
          </div>
        </header>

        <nav class="admin-tabs">
          <button class="admin-tab active" data-tab="orders">
            <span class="tab-icon">📋</span> Orders
            <span class="tab-badge" id="orderCountBadge">0</span>
          </button>
          <button class="admin-tab" data-tab="menu">
            <span class="tab-icon">📖</span> Menu
          </button>
          <button class="admin-tab" data-tab="qrcodes">
            <span class="tab-icon">📱</span> QR Codes
          </button>
          <button class="admin-tab" data-tab="settings">
            <span class="tab-icon">⚙️</span> Settings
          </button>
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
      if (refreshInterval) clearInterval(refreshInterval);
      renderLogin();
    });

    renderTab();
    startAutoRefresh();
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
      if (currentTab === 'orders') {
        renderOrdersTab();
      }
    }, 5000);
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
      'new': '🆕 New',
      'preparing': '👨‍🍳 Preparing',
      'ready': '✅ Ready',
      'served': '🍽️ Served',
      'cancelled': '❌ Cancelled',
    };

    if (activeOrders.length === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Active Orders</h3>
          <p>When customers place orders via QR code, they'll appear here.</p>
          <button class="btn-secondary" id="clearServedBtn">Clear Served Orders</button>
        </div>
      `;
      const clearBtn = document.getElementById('clearServedBtn');
      if (clearBtn) clearBtn.addEventListener('click', () => { DataStore.clearServedOrders(); renderOrdersTab(); });
      return;
    }

    main.innerHTML = `
      <div class="orders-header">
        <h2>Active Orders</h2>
        <button class="btn-secondary btn-sm" id="clearServedBtn">Clear Served</button>
      </div>
      <div class="orders-grid">
        ${Object.keys(byTable).sort((a,b) => a - b).map(tableNum => `
          <div class="table-orders-card">
            <div class="table-card-header">
              <span class="table-number-badge">Table ${tableNum}</span>
              <span class="order-count">${byTable[tableNum].length} order(s)</span>
            </div>
            ${byTable[tableNum].map(order => `
              <div class="order-item">
                <div class="order-item-header">
                  <span class="order-id">#${order.id.split('_')[1]}</span>
                  <span class="order-status ${statusColors[order.status]}">${statusLabels[order.status]}</span>
                </div>
                <div class="order-items-list">
                  ${order.items.map(i => `
                    <div class="order-line">${i.image} ${i.name} × ${i.quantity} <span class="order-line-price">₹${i.price * i.quantity}</span></div>
                  `).join('')}
                </div>
                ${order.notes ? `<div class="order-notes-display">📝 ${order.notes}</div>` : ''}
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
    const menu = DataStore.getMenu();
    const categories = [...new Set(menu.map(i => i.category))];

    main.innerHTML = `
      <div class="menu-management">
        <div class="menu-mgmt-header">
          <h2>Menu Management</h2>
          <button class="btn-primary" id="addMenuItemBtn">+ Add Item</button>
        </div>
        <div class="menu-table-wrapper">
          <table class="menu-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${menu.map(item => `
                <tr>
                  <td class="menu-table-emoji">${item.image}</td>
                  <td>
                    <div class="menu-table-name">${item.name}</div>
                    <div class="menu-table-desc">${item.description}</div>
                  </td>
                  <td><span class="category-badge">${item.category}</span></td>
                  <td class="menu-table-price">₹${item.price}</td>
                  <td>
                    <label class="toggle-switch">
                      <input type="checkbox" ${item.available ? 'checked' : ''} data-id="${item.id}" class="toggle-avail">
                      <span class="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <button class="btn-icon edit-item-btn" data-id="${item.id}" title="Edit">✏️</button>
                    <button class="btn-icon delete-item-btn" data-id="${item.id}" title="Delete">🗑️</button>
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
                <label>Name</label>
                <input type="text" id="itemName" required placeholder="Item name">
              </div>
              <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" id="itemPrice" required step="0.01" min="0" placeholder="0.00">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select id="itemCategory">
                  <option>Starters</option>
                  <option>Mains</option>
                  <option>Desserts</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div class="form-group">
                <label>Emoji Icon</label>
                <input type="text" id="itemEmoji" placeholder="🍔" maxlength="4">
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea id="itemDescription" placeholder="Brief description..." rows="2"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="cancelModalBtn">Cancel</button>
              <button type="submit" class="btn-primary">Save Item</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Toggle availability
    main.querySelectorAll('.toggle-avail').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        DataStore.updateMenuItem(e.target.dataset.id, { available: e.target.checked });
      });
    });

    // Delete
    main.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this menu item?')) {
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
        document.getElementById('itemEmoji').value = item.image;
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
        image: document.getElementById('itemEmoji').value || '🍽️',
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
    const tableCount = DataStore.getTableCount();

    main.innerHTML = `
      <div class="qr-management">
        <div class="qr-mgmt-header">
          <h2>QR Codes</h2>
          <div class="qr-controls">
            <div class="table-count-control">
              <label>Tables:</label>
              <input type="number" id="tableCountInput" value="${tableCount}" min="1" max="100" class="table-count-input">
              <button class="btn-secondary btn-sm" id="updateTablesBtn">Update</button>
            </div>
            <button class="btn-primary" id="printQRBtn">🖨️ Print All</button>
          </div>
        </div>
        <p class="qr-instructions">Each QR code links directly to your restaurant menu for that specific table. Print and place on tables for customers to scan.</p>
        <div class="qr-grid" id="qrGrid"></div>
      </div>
    `;

    QRGenerator.renderAllQRCodes(document.getElementById('qrGrid'), tableCount);

    document.getElementById('updateTablesBtn').addEventListener('click', () => {
      const count = parseInt(document.getElementById('tableCountInput').value);
      if (count > 0 && count <= 100) {
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
    main.innerHTML = `
      <div class="settings-container">
        <h2>Settings</h2>
        <div class="settings-card">
          <h3>Change Admin Credentials</h3>
          <form id="credsForm">
            <div class="form-group">
              <label>New Username</label>
              <input type="text" id="newUsername" required placeholder="New username">
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" id="newPassword" required placeholder="New password">
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input type="password" id="confirmPassword" required placeholder="Confirm password">
            </div>
            <div class="settings-error" id="settingsError" style="display:none;"></div>
            <button type="submit" class="btn-primary">Update Credentials</button>
          </form>
        </div>
        <div class="settings-card danger-zone">
          <h3>Danger Zone</h3>
          <p>Clear all order history from the system.</p>
          <button class="btn-danger" id="clearAllOrdersBtn">Clear All Orders</button>
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
      if (confirm('Are you sure? This will delete ALL order history.')) {
        localStorage.setItem('sos_orders', JSON.stringify([]));
        alert('All orders cleared.');
      }
    });
  }

  return { render };
})();
