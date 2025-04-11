/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "inboxreply",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Sano Developer",
  description: "Automatic reply to messages in inbox",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  
  // Don't respond to messages from the bot itself
  if (senderID === api.getCurrentUserID()) return;
  
  // Only process direct messages (where threadID equals senderID)
  if (threadID !== senderID) return;
  
  // Get bot configuration
  const config = require("../../../config.json");
  const bots = require("../../../bots.json");
  const botID = api.getCurrentUserID();
  
  // Get bot info
  let botName = "Bot";
  let prefix = "*";
  let admins = [];
  try {
    const botInfo = bots.find(item => item.uid === botID);
    if (botInfo) {
      botName = botInfo.botname || "Bot";
      prefix = botInfo.prefix || "*";
      admins = botInfo.admins || [];
    }
  } catch (error) {
    console.error("Error getting bot info:", error);
  }
  
  // If allowinbox is false and the user is not an admin or operator, don't respond
  if (!config.allowinbox && !admins.includes(senderID) && !config.operators.includes(senderID)) {
    return;
  }
  
  // If the message is a command (starts with prefix), don't respond since handleCommand will handle it
  if (body && body.startsWith(prefix)) return;
  
  // Get greeting responses from JSON file
  const fs = require("fs-extra");
  const path = require("path");
  
  // Check if message is a greeting
  const greetingWords = ["hi", "hello", "hey", "greetings"];
  const message = body ? body.toLowerCase() : "";
  
  const isGreeting = greetingWords.some(word => 
    message === word || 
    message.startsWith(`${word} `) || 
    message.endsWith(` ${word}`) || 
    message.includes(` ${word} `)
  );
  
  if (isGreeting) {
    try {
      const hiFile = path.join(__dirname, "..", "commands", "cache", "hi.json");
      if (!fs.existsSync(hiFile)) {
        return api.sendMessage(`Hello! I am ${botName}. You can use ${prefix}help to see available commands.`, threadID, messageID);
      }
      
      const hiData = JSON.parse(fs.readFileSync(hiFile, "utf8"));
      const { messages, stickers } = hiData;
      
      // Get random message and sticker
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      
      // Send the message with bot intro
      await api.sendMessage(`${randomMessage}\n\nI am ${botName}. You can use ${prefix}help to see available commands.`, threadID, messageID);
      
      // Send the sticker
      await api.sendMessage({ sticker: randomSticker }, threadID);
    } catch (error) {
      console.error("Error in inbox greeting reply:", error);
      // Fallback message
      api.sendMessage(`Hello! I am ${botName}. You can use ${prefix}help to see available commands.`, threadID, messageID);
    }
  } else {
    // Default reply for non-greeting messages
    api.sendMessage(`Hi there! I am ${botName}. You can interact with me using commands starting with "${prefix}". Try ${prefix}help to see available commands.`, threadID, messageID);
  }
};