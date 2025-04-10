// ryuko

console.clear();
const { spawn } = require("child_process");
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Create Express app for admin panel API
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize global variables
global.countRestart = 0;
global.botProcess = null;

// ===== ADMIN API ROUTES =====

// Authentication route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // In production, use config values and proper auth
  const config = require('./config.json');
  const validUsername = 'admin'; // Replace with config.adminUsername
  const validPassword = 'admin'; // Replace with config.adminPassword
  
  if (username === validUsername && password === validPassword) {
    res.json({
      success: true,
      message: 'Authentication successful',
      token: 'mock-jwt-token' // In production, generate a proper JWT
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Dashboard stats route
app.get('/api/admin/stats', (req, res) => {
  try {
    // In a real implementation, get actual data from your database
    const bots = require('./bots.json');
    const activeBots = bots.filter(bot => bot.active).length;
    
    res.json({
      success: true,
      data: {
        totalBots: bots.length,
        activeBots: activeBots,
        totalUsers: 42, // Replace with actual data
        cpuUsage: '60%',
        memoryUsage: '75%',
        diskUsage: '45%'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// Bots list route
app.get('/api/admin/bots', (req, res) => {
  try {
    const bots = require('./bots.json');
    
    // Transform data for frontend
    const formattedBots = bots.map(bot => ({
      id: bot.uid || 'unknown',
      name: bot.name || 'Unnamed Bot',
      status: bot.active ? 'active' : 'inactive',
      prefix: bot.prefix || '!',
      users: bot.users || 0,
      uptime: '0'
    }));
    
    res.json({
      success: true,
      data: formattedBots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bots',
      error: error.message
    });
  }
});

// Bot control routes
app.post('/api/admin/bots/:id/start', (req, res) => {
  const botId = req.params.id;
  
  // Implementation would depend on how your bot starting logic works
  res.json({
    success: true,
    message: `Bot ${botId} started successfully`
  });
});

app.post('/api/admin/bots/:id/stop', (req, res) => {
  const botId = req.params.id;
  
  // Implementation would depend on how your bot stopping logic works
  res.json({
    success: true,
    message: `Bot ${botId} stopped successfully`
  });
});

// Commands list route
app.get('/api/admin/commands', (req, res) => {
  try {
    const commandsPath = path.join(__dirname, 'script', 'commands');
    const files = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.js') && !file.startsWith('.'));
    
    const commands = [];
    for (const file of files) {
      try {
        const command = require(path.join(commandsPath, file));
        if (command.config) {
          commands.push({
            name: command.config.name || file.replace('.js', ''),
            description: command.config.description || 'No description',
            category: command.config.category || 'Uncategorized',
            permission: command.config.permission || 0,
            cooldown: command.config.cooldowns || 0,
            usage: command.config.usages || '',
            premium: command.config.premium || false,
            author: command.config.credits || 'Unknown'
          });
        }
      } catch (err) {
        console.error(`Error loading command ${file}:`, err);
      }
    }
    
    res.json({
      success: true,
      data: commands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching commands',
      error: error.message
    });
  }
});

// Server restart route
app.post('/api/admin/restart', (req, res) => {
  res.json({
    success: true,
    message: 'Server restart initiated'
  });
  
  // Actually restart the bot after sending response
  setTimeout(() => {
    restartBot();
  }, 1000);
});

// Main page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main', 'index.html'));
});

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin panel running on port ${PORT}`);
});

// ===== BOT MANAGEMENT FUNCTIONS =====

function startBot(message) {
  if (message) {
    console.info(message.toUpperCase());
  }

  global.botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", "--no-warnings", "main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });
  
  global.botProcess.on("close", (codeExit) => {
    if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
      startBot("restarting server");
      global.countRestart += 1;
      return;
    } else return;
  });

  global.botProcess.on("error", function(error) {
    console.error("an error occurred : " + JSON.stringify(error));
  });
}

function restartBot() {
  if (global.botProcess) {
    console.info("STOPPING BOT PROCESS");
    // On Windows, this would be: 'taskkill', ['/pid', global.botProcess.pid, '/f', '/t']
    spawn('kill', ['-9', global.botProcess.pid]);
    global.botProcess = null;
  }
  
  setTimeout(() => {
    console.info("STARTING NEW BOT PROCESS");
    global.countRestart = 0;
    startBot("manual restart initiated");
  }, 2000);
}

// Start the bot
startBot();