/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "randomhireply",
  eventType: ["message"],
  version: "1.0.0",
  credits: "Sano Developer",
  description: "Responds to greetings with random messages and stickers",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID, body, isGroup } = event;
  
  // Don't respond to messages from the bot itself
  if (senderID === api.getCurrentUserID()) return;
  
  // Skip processing if it's a direct message - inboxreply.js will handle those
  if (threadID === senderID) return;
  
  // If no message body, return
  if (!body) return;
  
  // Get the greeting responses from JSON file
  const fs = require("fs-extra");
  const path = require("path");
  
  const greetingWords = ["hi", "hello", "hey", "greetings", "halo", "helo", "sup", "yo"];
  const message = body.toLowerCase();
  
  // Check if message is just a greeting
  const isGreeting = greetingWords.some(word => {
    // Check exact match
    if (message === word) return true;
    
    // Check if it starts with the greeting
    if (message.startsWith(`${word} `)) return true;
    
    // Check if it ends with the greeting
    if (message.endsWith(` ${word}`)) return true;
    
    // Check if it contains the greeting with spaces on both sides
    if (message.includes(` ${word} `)) return true;
    
    return false;
  });
  
  // Exit if not a greeting
  if (!isGreeting) return;
  
  try {
    const hiFile = path.join(__dirname, "..", "commands", "cache", "hi.json");
    if (!fs.existsSync(hiFile)) {
      console.log("hi.json file not found");
      // Create directories if they don't exist
      await fs.ensureDir(path.join(__dirname, "..", "commands", "cache"));
      
      // Create default hi.json if it doesn't exist
      const defaultHiData = {
        "messages": [
          "Hello there! How can I help you today?",
          "Hi! Nice to see you!",
          "Hey! What's up?",
          "Greetings! How's your day going?",
          "Hello! Ready for some fun conversations?"
        ],
        "stickers": [
          "2041011506087729",
          "1775283965836672",
          "2080863565335851",
          "553279348862280",
          "369324574781989"
        ]
      };
      
      await fs.writeFileSync(hiFile, JSON.stringify(defaultHiData, null, 2));
      
      // Send default greeting
      await api.sendMessage("Hello there! How can I help you today?", threadID, messageID);
      return;
    }
    
    const hiData = JSON.parse(fs.readFileSync(hiFile, "utf8"));
    const { messages, stickers } = hiData;
    
    // Get random message and sticker
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
    
    // Get user name
    try {
      const userInfo = await api.getUserInfo(senderID);
      const userName = userInfo[senderID].firstName || "Friend";
      
      // Send personalized message
      await api.sendMessage(`${randomMessage} ${userName}`, threadID, messageID);
    } catch (err) {
      // Fallback if can't get user info
      await api.sendMessage(randomMessage, threadID, messageID);
    }
    
    // Send the sticker
    await api.sendMessage({ sticker: randomSticker }, threadID);
  } catch (error) {
    console.error("Error in randomhireply event:", error);
  }
};