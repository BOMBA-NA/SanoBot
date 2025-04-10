// Admin Panel JS
document.addEventListener('DOMContentLoaded', function() {
  // Create admin panel button
  const adminButton = document.createElement('div');
  adminButton.id = 'admin-panel-button';
  adminButton.innerHTML = '<i class="fas fa-user-shield"></i>';
  adminButton.title = 'Admin Panel';
  document.body.appendChild(adminButton);

  // Create admin panel container
  const adminPanel = document.createElement('div');
  adminPanel.id = 'admin-panel';
  adminPanel.style.display = 'none';
  adminPanel.innerHTML = `
    <div class="admin-panel-header">
      <h3>Admin Panel</h3>
      <span id="admin-panel-close"><i class="fas fa-times"></i></span>
    </div>
    <div id="admin-login" style="display: block;">
      <h4>Login</h4>
      <input type="text" id="admin-username" placeholder="Username" />
      <input type="password" id="admin-password" placeholder="Password" />
      <button id="admin-login-btn">Login</button>
      <div id="admin-error" style="color: red; font-size: 12px; margin-top: 5px; display: none;"></div>
    </div>
    <div id="admin-content" style="display: none;">
      <div class="admin-tabs">
        <button class="admin-tab-btn active" data-tab="dashboard">Dashboard</button>
        <button class="admin-tab-btn" data-tab="bots">Bots</button>
        <button class="admin-tab-btn" data-tab="users">Users</button>
        <button class="admin-tab-btn" data-tab="settings">Settings</button>
      </div>
      <div id="admin-dashboard" class="admin-tab-content active">
        <h4>Dashboard</h4>
        <div class="admin-stats">
          <div class="admin-stat-item">
            <span class="stat-value" id="total-bots">0</span>
            <span class="stat-label">Total Bots</span>
          </div>
          <div class="admin-stat-item">
            <span class="stat-value" id="active-bots">0</span>
            <span class="stat-label">Active Bots</span>
          </div>
          <div class="admin-stat-item">
            <span class="stat-value" id="total-users">0</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
        <div class="admin-actions">
          <button id="refresh-stats">Refresh Stats</button>
          <button id="restart-server">Restart Server</button>
        </div>
      </div>
      <div id="admin-bots" class="admin-tab-content">
        <h4>Bot Management</h4>
        <div id="bot-list" class="admin-list">
          <div class="admin-loading">Loading bots...</div>
        </div>
      </div>
      <div id="admin-users" class="admin-tab-content">
        <h4>User Management</h4>
        <div id="user-list" class="admin-list">
          <div class="admin-loading">Loading users...</div>
        </div>
      </div>
      <div id="admin-settings" class="admin-tab-content">
        <h4>System Settings</h4>
        <div class="admin-setting-item">
          <label>Bot Prefix:</label>
          <input type="text" id="default-prefix" placeholder="Default prefix" />
        </div>
        <div class="admin-setting-item">
          <label>Auto Restart:</label>
          <select id="auto-restart">
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div class="admin-setting-item">
          <label>Language:</label>
          <select id="default-language">
            <option value="english">English</option>
            <option value="tagalog">Tagalog</option>
            <option value="bangla">Bangla</option>
          </select>
        </div>
        <button id="save-settings">Save Settings</button>
      </div>
    </div>
  `;
  document.body.appendChild(adminPanel);

  // Add CSS for admin panel
  const adminCSS = document.createElement('style');
  adminCSS.textContent = `
    #admin-panel-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #4267B2;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      z-index: 999;
      transition: all 0.3s ease;
    }
    
    #admin-panel-button:hover {
      transform: scale(1.1);
      background-color: #365899;
    }
    
    #admin-panel-button:active {
      transform: scale(0.95);
    }
    
    #admin-panel-button i {
      font-size: 24px;
    }
    
    #admin-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 85%;
      max-width: 800px;
      max-height: 85vh;
      overflow-y: auto;
      background-color: #1e1e1e;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 20px;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      opacity: 0;
      transition: all 0.3s ease;
      scrollbar-width: thin;
      scrollbar-color: #4267B2 #2d2d2d;
    }
    
    #admin-panel::-webkit-scrollbar {
      width: 8px;
    }
    
    #admin-panel::-webkit-scrollbar-track {
      background: #2d2d2d;
      border-radius: 10px;
    }
    
    #admin-panel::-webkit-scrollbar-thumb {
      background-color: #4267B2;
      border-radius: 10px;
    }
    
    .admin-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid gray;
    }
    
    .admin-panel-header h3 {
      margin: 0;
      color: #fff;
    }
    
    #admin-panel-close {
      cursor: pointer;
      color: gray;
      font-size: 20px;
    }
    
    #admin-panel-close:hover {
      color: white;
    }
    
    #admin-login input, #admin-content input, #admin-content select {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 5px;
      border: 1px solid gray;
      background-color: #333;
      color: white;
      font-size: 14px;
    }
    
    #admin-login button, #admin-content button {
      padding: 10px 20px;
      border-radius: 5px;
      background-color: #4267B2;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    
    #admin-login button:hover, #admin-content button:hover {
      background-color: #365899;
    }
    
    .admin-tabs {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 20px;
      border-bottom: 1px solid gray;
    }
    
    .admin-tab-btn {
      background-color: transparent;
      color: gray;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 5px;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
    }
    
    .admin-tab-btn.active {
      color: white;
      border-bottom: 2px solid #4267B2;
    }
    
    .admin-tab-content {
      display: none;
    }
    
    .admin-tab-content.active {
      display: block;
    }
    
    .admin-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .admin-stat-item {
      background-color: #333;
      border-radius: 5px;
      padding: 15px;
      text-align: center;
      flex: 1;
      margin-right: 10px;
    }
    
    .admin-stat-item:last-child {
      margin-right: 0;
    }
    
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #4267B2;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 12px;
      color: gray;
    }
    
    .admin-actions {
      margin-top: 20px;
    }
    
    .admin-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #333;
      border-radius: 5px;
      padding: 10px;
    }
    
    .admin-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #333;
    }
    
    .admin-list-item:last-child {
      border-bottom: none;
    }
    
    .admin-list-info {
      flex: 1;
    }
    
    .admin-list-title {
      font-size: 16px;
      color: white;
      margin-bottom: 5px;
    }
    
    .admin-list-subtitle {
      font-size: 12px;
      color: gray;
    }
    
    .admin-list-actions button {
      padding: 5px 10px;
      font-size: 12px;
      margin-right: 5px;
    }
    
    .admin-setting-item {
      margin-bottom: 15px;
    }
    
    .admin-setting-item label {
      display: block;
      margin-bottom: 5px;
      color: white;
    }
    
    .admin-loading {
      text-align: center;
      padding: 20px;
      color: gray;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .admin-loading:before {
      content: '';
      width: 30px;
      height: 30px;
      border: 3px solid #333;
      border-top-color: #4267B2;
      border-radius: 50%;
      animation: spin 1s infinite linear;
      display: block;
      margin-bottom: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .login-success {
      text-align: center;
      padding: 20px;
      color: #4BB543;
      font-size: 16px;
    }
    
    .login-success i {
      font-size: 48px;
      margin-bottom: 10px;
      animation: success-pulse 1s ease;
    }
    
    @keyframes success-pulse {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .shake {
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
    }
    
    .status-active {
      background-color: #4BB543;
      box-shadow: 0 0 5px #4BB543;
    }
    
    .status-inactive {
      background-color: #FF3333;
      box-shadow: 0 0 5px #FF3333;
    }
    
    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
    }
    
    .role-admin {
      background-color: #FF5733;
      color: white;
    }
    
    .role-operator {
      background-color: #33A1FF;
      color: white;
    }
    
    .role-user {
      background-color: #33FF57;
      color: #333;
    }
    
    .admin-empty {
      text-align: center;
      padding: 20px;
      color: gray;
      font-style: italic;
    }
    
    .admin-chart {
      margin: 20px 0;
      padding: 15px;
      background-color: #2d2d2d;
      border-radius: 5px;
    }
    
    .admin-chart h5 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #fff;
    }
    
    .chart-container {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 150px;
    }
    
    .chart-bar {
      width: 40px;
      background: linear-gradient(to top, #4267B2, #33A1FF);
      border-radius: 5px 5px 0 0;
      position: relative;
      transition: height 1s ease;
    }
    
    .chart-bar span {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #ccc;
    }
    
    .admin-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: #2d2d2d;
      color: white;
      border-left: 4px solid #4267B2;
      border-radius: 4px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.3s ease;
    }
    
    .admin-notification.success {
      border-left-color: #4BB543;
    }
    
    .admin-notification.warning {
      border-left-color: #FFC107;
    }
    
    .admin-notification.error {
      border-left-color: #FF3333;
    }
    
    .admin-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .admin-dialog-content {
      background-color: #1e1e1e;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
      transform: translateY(-20px);
      transition: transform 0.3s ease;
    }
    
    .admin-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #333;
    }
    
    .admin-dialog-header h4 {
      margin: 0;
      color: white;
    }
    
    .admin-dialog-close {
      cursor: pointer;
      color: gray;
    }
    
    .admin-dialog-body {
      padding: 20px;
      color: #ccc;
    }
    
    .admin-dialog-footer {
      padding: 15px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #333;
    }
    
    .admin-dialog-footer button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    }
    
    .admin-dialog-cancel {
      background-color: #333;
      color: white;
    }
    
    .admin-dialog-confirm {
      background-color: #4267B2;
      color: white;
    }
    
    .admin-error {
      text-align: center;
      padding: 30px;
      color: #FF3333;
    }
    
    .admin-error i {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    .admin-error button {
      margin-top: 15px;
      padding: 8px 16px;
      background-color: #333;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(adminCSS);

  // Event listeners
  document.getElementById('admin-panel-button').addEventListener('click', function() {
    document.getElementById('admin-panel').style.display = 'block';
    // Add animation effect
    setTimeout(() => {
      document.getElementById('admin-panel').style.opacity = '1';
      document.getElementById('admin-panel').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  });

  document.getElementById('admin-panel-close').addEventListener('click', function() {
    // Add animation effect
    document.getElementById('admin-panel').style.opacity = '0';
    document.getElementById('admin-panel').style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      document.getElementById('admin-panel').style.display = 'none';
    }, 300);
  });

  // Add keyboard shortcut to toggle admin panel (Ctrl+Shift+A)
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      const panel = document.getElementById('admin-panel');
      if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        setTimeout(() => {
          panel.style.opacity = '1';
          panel.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
      } else {
        panel.style.opacity = '0';
        panel.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
          panel.style.display = 'none';
        }, 300);
      }
    }
  });

  // Login functionality
  document.getElementById('admin-login-btn').addEventListener('click', function() {
    performLogin();
  });
  
  // Also allow login on Enter key press
  document.getElementById('admin-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performLogin();
    }
  });
  
  function performLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Show loading state
    const loginBtn = document.getElementById('admin-login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Reset button state
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
      
      if(username === 'admin' && password === 'admin') {
        // Show success animation
        document.getElementById('admin-login').innerHTML = '<div class="login-success"><i class="fas fa-check-circle"></i><p>Login successful!</p></div>';
        
        setTimeout(() => {
          document.getElementById('admin-login').style.display = 'none';
          document.getElementById('admin-content').style.display = 'block';
          loadAdminData();
        }, 1000);
      } else {
        const error = document.getElementById('admin-error');
        error.style.display = 'block';
        error.textContent = 'Invalid username or password';
        
        // Shake animation for error
        document.getElementById('admin-login').classList.add('shake');
        setTimeout(() => {
          document.getElementById('admin-login').classList.remove('shake');
          error.style.display = 'none';
        }, 1000);
      }
    }, 800);
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update active tab content
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById('admin-' + tabName).classList.add('active');
    });
  });

  // Admin functionality
  async function loadAdminData() {
    // Show loading state
    document.getElementById('admin-dashboard').innerHTML = '<div class="admin-loading">Loading dashboard data...</div>';
    document.getElementById('bot-list').innerHTML = '<div class="admin-loading">Loading bot data...</div>';
    document.getElementById('user-list').innerHTML = '<div class="admin-loading">Loading user data...</div>';
    
    try {
      // In a real application, these would be API calls
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load dashboard stats
      const stats = await fetchDashboardStats();
      document.getElementById('total-bots').textContent = stats.totalBots;
      document.getElementById('active-bots').textContent = stats.activeBots;
      document.getElementById('total-users').textContent = stats.totalUsers;
      
      // Add more dashboard content
      document.getElementById('admin-dashboard').innerHTML = `
        <h4>Dashboard</h4>
        <div class="admin-stats">
          <div class="admin-stat-item">
            <span class="stat-value" id="total-bots">${stats.totalBots}</span>
            <span class="stat-label">Total Bots</span>
          </div>
          <div class="admin-stat-item">
            <span class="stat-value" id="active-bots">${stats.activeBots}</span>
            <span class="stat-label">Active Bots</span>
          </div>
          <div class="admin-stat-item">
            <span class="stat-value" id="total-users">${stats.totalUsers}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
        
        <div class="admin-chart">
          <h5>System Performance</h5>
          <div class="chart-container">
            <div class="chart-bar" style="height: 60%;" title="CPU: 60%">
              <span>CPU</span>
            </div>
            <div class="chart-bar" style="height: 75%;" title="RAM: 75%">
              <span>RAM</span>
            </div>
            <div class="chart-bar" style="height: 45%;" title="Disk: 45%">
              <span>Disk</span>
            </div>
            <div class="chart-bar" style="height: 80%;" title="Network: 80%">
              <span>Net</span>
            </div>
          </div>
        </div>
        
        <div class="admin-actions">
          <button id="refresh-stats"><i class="fas fa-sync-alt"></i> Refresh Stats</button>
          <button id="restart-server"><i class="fas fa-power-off"></i> Restart Server</button>
          <button id="export-logs"><i class="fas fa-file-download"></i> Export Logs</button>
        </div>
      `;
      
      // Load bot list
      const bots = await fetchBotList();
      const botList = document.getElementById('bot-list');
      botList.innerHTML = '';
      
      if (bots.length === 0) {
        botList.innerHTML = '<div class="admin-empty">No bots available</div>';
      } else {
        bots.forEach(bot => {
          const botItem = document.createElement('div');
          botItem.className = 'admin-list-item';
          const statusClass = bot.status === 'active' ? 'status-active' : 'status-inactive';
          botItem.innerHTML = `
            <div class="admin-list-info">
              <div class="admin-list-title">
                <span class="status-indicator ${statusClass}"></span>
                ${bot.name}
              </div>
              <div class="admin-list-subtitle">Prefix: ${bot.prefix} | Users: ${bot.users} | Uptime: ${bot.uptime || 'N/A'}</div>
            </div>
            <div class="admin-list-actions">
              <button class="bot-action-btn" data-action="start" data-id="${bot.id}">
                <i class="fas fa-${bot.status === 'active' ? 'sync-alt' : 'play'}"></i> ${bot.status === 'active' ? 'Restart' : 'Start'}
              </button>
              <button class="bot-action-btn" data-action="stop" data-id="${bot.id}" ${bot.status === 'inactive' ? 'disabled' : ''}>
                <i class="fas fa-stop"></i> Stop
              </button>
              <button class="bot-action-btn" data-action="edit" data-id="${bot.id}">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
          `;
          botList.appendChild(botItem);
        });
      }
      
      // Load user list
      const users = await fetchUserList();
      const userList = document.getElementById('user-list');
      userList.innerHTML = '';
      
      if (users.length === 0) {
        userList.innerHTML = '<div class="admin-empty">No users available</div>';
      } else {
        users.forEach(user => {
          const userItem = document.createElement('div');
          userItem.className = 'admin-list-item';
          
          // Set role badge color
          let roleBadgeClass = '';
          switch(user.role.toLowerCase()) {
            case 'admin':
              roleBadgeClass = 'role-admin';
              break;
            case 'operator':
              roleBadgeClass = 'role-operator';
              break;
            default:
              roleBadgeClass = 'role-user';
          }
          
          userItem.innerHTML = `
            <div class="admin-list-info">
              <div class="admin-list-title">${user.name}</div>
              <div class="admin-list-subtitle">
                <span class="role-badge ${roleBadgeClass}">${user.role}</span> | 
                Last active: ${user.lastActive}
              </div>
            </div>
            <div class="admin-list-actions">
              <button class="user-action-btn" data-action="view" data-id="${user.id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="user-action-btn" data-action="edit" data-id="${user.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="user-action-btn" data-action="delete" data-id="${user.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
          userList.appendChild(userItem);
        });
      }
      
      // Load settings
      document.getElementById('default-prefix').value = '!';
      document.getElementById('auto-restart').value = 'enabled';
      document.getElementById('default-language').value = 'english';
      
      // Add event listeners for buttons
      attachEventListeners();
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      document.getElementById('admin-dashboard').innerHTML = `
        <div class="admin-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load dashboard data. Please try again.</p>
          <button id="retry-load-dashboard">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-load-dashboard')?.addEventListener('click', loadAdminData);
    }
  }
  
  // Mock data functions - in a real application these would be API calls
  async function fetchDashboardStats() {
    return {
      totalBots: '5',
      activeBots: '3',
      totalUsers: '42',
      cpuUsage: '60%',
      memoryUsage: '75%',
      diskUsage: '45%'
    };
  }
  
  async function fetchBotList() {
    return [
      { id: 'bot1', name: 'Main Bot', status: 'active', prefix: '!', users: 25, uptime: '5 days' },
      { id: 'bot2', name: 'Entertainment Bot', status: 'active', prefix: '#', users: 12, uptime: '2 days' },
      { id: 'bot3', name: 'Utility Bot', status: 'inactive', prefix: '/', users: 5, uptime: '0' }
    ];
  }
  
  async function fetchUserList() {
    return [
      { id: 'user1', name: 'John Doe', role: 'admin', lastActive: '2 hours ago' },
      { id: 'user2', name: 'Jane Smith', role: 'operator', lastActive: '5 minutes ago' },
      { id: 'user3', name: 'Bob Johnson', role: 'user', lastActive: '1 day ago' }
    ];
  }
  
  function attachEventListeners() {
    // Bot action buttons
    document.querySelectorAll('.bot-action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const botId = this.getAttribute('data-id');
        
        // Show loading state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Simulate API request
        setTimeout(() => {
          this.disabled = false;
          this.innerHTML = originalText;
          
          switch(action) {
            case 'start':
              showNotification('Bot starting...', 'success');
              break;
            case 'stop':
              showNotification('Bot stopped successfully', 'success');
              break;
            case 'edit':
              openBotEditor(botId);
              break;
          }
        }, 1000);
      });
    });
    
    // User action buttons
    document.querySelectorAll('.user-action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const userId = this.getAttribute('data-id');
        
        switch(action) {
          case 'view':
            openUserProfile(userId);
            break;
          case 'edit':
            openUserEditor(userId);
            break;
          case 'delete':
            confirmUserDelete(userId);
            break;
        }
      });
    });
    
    // Dashboard buttons
    document.getElementById('refresh-stats')?.addEventListener('click', function() {
      showNotification('Refreshing stats...', 'info');
      loadAdminData();
    });
    
    document.getElementById('restart-server')?.addEventListener('click', function() {
      openConfirmDialog('Restart Server', 'Are you sure you want to restart the server? All active connections will be closed.', () => {
        showNotification('Server restart initiated', 'warning');
      });
    });
    
    document.getElementById('export-logs')?.addEventListener('click', function() {
      showNotification('Logs exported successfully', 'success');
    });
    
    // Settings
    document.getElementById('save-settings')?.addEventListener('click', function() {
      const saveBtn = this;
      const originalText = saveBtn.textContent;
      
      // Show loading state
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      // Simulate API request
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        showNotification('Settings saved successfully', 'success');
      }, 1000);
    });
  }
  
  // Helper functions
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Animate out after delay
    setTimeout(() => {
      notification.style.transform = 'translateY(-20px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  function openConfirmDialog(title, message, confirmCallback) {
    const dialog = document.createElement('div');
    dialog.className = 'admin-dialog';
    dialog.innerHTML = `
      <div class="admin-dialog-content">
        <div class="admin-dialog-header">
          <h4>${title}</h4>
          <span class="admin-dialog-close"><i class="fas fa-times"></i></span>
        </div>
        <div class="admin-dialog-body">
          <p>${message}</p>
        </div>
        <div class="admin-dialog-footer">
          <button class="admin-dialog-cancel">Cancel</button>
          <button class="admin-dialog-confirm">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Animate in
    setTimeout(() => {
      dialog.style.opacity = '1';
      dialog.querySelector('.admin-dialog-content').style.transform = 'translateY(0)';
    }, 10);
    
    // Add event listeners
    dialog.querySelector('.admin-dialog-close').addEventListener('click', () => closeDialog(dialog));
    dialog.querySelector('.admin-dialog-cancel').addEventListener('click', () => closeDialog(dialog));
    dialog.querySelector('.admin-dialog-confirm').addEventListener('click', () => {
      closeDialog(dialog);
      if (confirmCallback) confirmCallback();
    });
    
    function closeDialog(dialog) {
      dialog.style.opacity = '0';
      dialog.querySelector('.admin-dialog-content').style.transform = 'translateY(-20px)';
      setTimeout(() => {
        dialog.remove();
      }, 300);
    }
  }
  
  function openBotEditor(botId) {
    // Implementation would depend on your bot editing UI
    showNotification('Bot editor opened', 'info');
  }
  
  function openUserProfile(userId) {
    // Implementation would depend on your user profile UI
    showNotification('User profile opened', 'info');
  }
  
  function openUserEditor(userId) {
    // Implementation would depend on your user editor UI
    showNotification('User editor opened', 'info');
  }
  
  function confirmUserDelete(userId) {
    openConfirmDialog('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', () => {
      showNotification('User deleted successfully', 'success');
    });
  }
});