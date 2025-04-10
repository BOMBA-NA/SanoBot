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
    }
    
    #admin-panel-button i {
      font-size: 24px;
    }
    
    #admin-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      background-color: #1e1e1e;
      border: 1px solid gray;
      border-radius: 10px;
      padding: 20px;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
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
    }
  `;
  document.head.appendChild(adminCSS);

  // Event listeners
  document.getElementById('admin-panel-button').addEventListener('click', function() {
    document.getElementById('admin-panel').style.display = 'block';
  });

  document.getElementById('admin-panel-close').addEventListener('click', function() {
    document.getElementById('admin-panel').style.display = 'none';
  });

  document.getElementById('admin-login-btn').addEventListener('click', function() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if(username === 'admin' && password === 'admin') {
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-content').style.display = 'block';
      loadAdminData();
    } else {
      const error = document.getElementById('admin-error');
      error.style.display = 'block';
      error.textContent = 'Invalid username or password';
      setTimeout(() => {
        error.style.display = 'none';
      }, 3000);
    }
  });

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
  function loadAdminData() {
    // Mock data - in a real application this would come from the server
    document.getElementById('total-bots').textContent = '5';
    document.getElementById('active-bots').textContent = '3';
    document.getElementById('total-users').textContent = '42';
    
    // Load bot list
    const botList = document.getElementById('bot-list');
    botList.innerHTML = '';
    
    const mockBots = [
      { id: 'bot1', name: 'Main Bot', status: 'active', prefix: '!', users: 25 },
      { id: 'bot2', name: 'Entertainment Bot', status: 'active', prefix: '#', users: 12 },
      { id: 'bot3', name: 'Utility Bot', status: 'inactive', prefix: '/', users: 5 }
    ];
    
    mockBots.forEach(bot => {
      const botItem = document.createElement('div');
      botItem.className = 'admin-list-item';
      botItem.innerHTML = `
        <div class="admin-list-info">
          <div class="admin-list-title">${bot.name}</div>
          <div class="admin-list-subtitle">Status: ${bot.status} | Prefix: ${bot.prefix} | Users: ${bot.users}</div>
        </div>
        <div class="admin-list-actions">
          <button class="bot-action-btn" data-action="start" data-id="${bot.id}">${bot.status === 'active' ? 'Restart' : 'Start'}</button>
          <button class="bot-action-btn" data-action="stop" data-id="${bot.id}" ${bot.status === 'inactive' ? 'disabled' : ''}>Stop</button>
          <button class="bot-action-btn" data-action="edit" data-id="${bot.id}">Edit</button>
        </div>
      `;
      botList.appendChild(botItem);
    });
    
    // Load user list
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    const mockUsers = [
      { id: 'user1', name: 'John Doe', role: 'admin', lastActive: '2 hours ago' },
      { id: 'user2', name: 'Jane Smith', role: 'operator', lastActive: '5 minutes ago' },
      { id: 'user3', name: 'Bob Johnson', role: 'user', lastActive: '1 day ago' }
    ];
    
    mockUsers.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'admin-list-item';
      userItem.innerHTML = `
        <div class="admin-list-info">
          <div class="admin-list-title">${user.name}</div>
          <div class="admin-list-subtitle">Role: ${user.role} | Last active: ${user.lastActive}</div>
        </div>
        <div class="admin-list-actions">
          <button class="user-action-btn" data-action="edit" data-id="${user.id}">Edit</button>
          <button class="user-action-btn" data-action="delete" data-id="${user.id}">Delete</button>
        </div>
      `;
      userList.appendChild(userItem);
    });
    
    // Load settings
    document.getElementById('default-prefix').value = '!';
    document.getElementById('auto-restart').value = 'enabled';
    document.getElementById('default-language').value = 'english';
    
    // Add event listeners for buttons
    document.querySelectorAll('.bot-action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const botId = this.getAttribute('data-id');
        alert(`${action} action for bot ${botId}`);
      });
    });
    
    document.querySelectorAll('.user-action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const userId = this.getAttribute('data-id');
        alert(`${action} action for user ${userId}`);
      });
    });
    
    document.getElementById('refresh-stats').addEventListener('click', function() {
      alert('Refreshing stats...');
      // This would normally fetch fresh data from the server
    });
    
    document.getElementById('restart-server').addEventListener('click', function() {
      if(confirm('Are you sure you want to restart the server?')) {
        alert('Server restart initiated');
      }
    });
    
    document.getElementById('save-settings').addEventListener('click', function() {
      alert('Settings saved');
    });
  }
});