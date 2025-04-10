const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "load",
  version: "1.0.0",
  hasPermssion: 2, // Admin permission only
  credits: "Ryuko Developer",
  description: "Load/Reload/Unload command files",
  commandCategory: "system",
  usages: "{prefix}load [load/loadAll/unload/unloadAll/info] [command name (if applicable)]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, client }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const cmdsPath = path.join(__dirname, "..");
  
  if (args.length === 0) {
    return api.sendMessage("Usage: load [load/loadAll/unload/unloadAll/info] [command name (if applicable)]", threadID, messageID);
  }
  
  const action = args[0].toLowerCase();
  
  switch (action) {
    case "load": {
      if (args.length < 2) {
        return api.sendMessage("Please specify the command to load", threadID, messageID);
      }
      
      const commandName = args[1].endsWith('.js') ? args[1] : args[1] + '.js';
      const commandPath = path.join(cmdsPath, "commands", commandName);
      
      if (!fs.existsSync(commandPath)) {
        return api.sendMessage(`Command ${commandName} not found!`, threadID, messageID);
      }
      
      try {
        delete require.cache[require.resolve(commandPath)];
        const command = require(commandPath);
        
        if (!command.config || !command.run) {
          return api.sendMessage(`Invalid command format: ${commandName}`, threadID, messageID);
        }
        
        commands.set(command.config.name, command);
        return api.sendMessage(`Successfully loaded command: ${command.config.name}`, threadID, messageID);
      } catch (error) {
        return api.sendMessage(`Failed to load command ${commandName}: ${error.message}`, threadID, messageID);
      }
    }
    
    case "loadall": {
      const fileNames = fs.readdirSync(path.join(cmdsPath, "commands"))
        .filter(file => file.endsWith(".js") && !file.includes("example"));
      
      let loadedCount = 0;
      let errorCount = 0;
      
      for (const file of fileNames) {
        try {
          const filePath = path.join(cmdsPath, "commands", file);
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);
          
          if (!command.config || !command.run) continue;
          
          commands.set(command.config.name, command);
          loadedCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to load ${file}: ${error.message}`);
        }
      }
      
      return api.sendMessage(`Loaded ${loadedCount} commands successfully. ${errorCount > 0 ? `Failed to load ${errorCount} commands.` : ""}`, threadID, messageID);
    }
    
    case "unload": {
      if (args.length < 2) {
        return api.sendMessage("Please specify the command to unload", threadID, messageID);
      }
      
      const commandName = args[1].replace(".js", "");
      
      if (!commands.has(commandName)) {
        return api.sendMessage(`Command ${commandName} is not loaded or doesn't exist!`, threadID, messageID);
      }
      
      commands.delete(commandName);
      return api.sendMessage(`Successfully unloaded command: ${commandName}`, threadID, messageID);
    }
    
    case "unloadall": {
      const commandsCount = commands.size;
      
      commands.clear();
      
      return api.sendMessage(`Successfully unloaded ${commandsCount} commands!`, threadID, messageID);
    }
    
    case "info": {
      if (args.length < 2) {
        return api.sendMessage("Please specify the command to get info about", threadID, messageID);
      }
      
      const commandName = args[1].replace(".js", "");
      
      if (!commands.has(commandName)) {
        return api.sendMessage(`Command ${commandName} is not loaded or doesn't exist!`, threadID, messageID);
      }
      
      const command = commands.get(commandName);
      const configInfo = command.config;
      
      const info = `
📝 Command Information: ${configInfo.name}
🧩 Version: ${configInfo.version}
👨‍💻 Credits: ${configInfo.credits}
🔒 Permission: ${configInfo.hasPermssion}
📋 Description: ${configInfo.description || "No description"}
📚 Category: ${configInfo.commandCategory || "No category"}
⌨️ Usage: ${configInfo.usages || "No usage provided"}
⏱️ Cooldown: ${configInfo.cooldowns || 0} seconds
      `;
      
      return api.sendMessage(info, threadID, messageID);
    }
    
    default:
      return api.sendMessage("Available actions: load, loadAll, unload, unloadAll, info", threadID, messageID);
  }
};