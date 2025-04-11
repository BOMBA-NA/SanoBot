/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "badwords",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Configure bad words filter with auto-kick feature",
  category: "admin",
  usages: "[on/off/add/remove/list]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const threadInfo = await Threads.getInfo(event.threadID);
  const data = threadInfo.data || {};
  
  // Initialize badwords list if it doesn't exist
  if (!data.badwords) {
    data.badwords = {
      enabled: false,
      words: [],
      warnCount: {},  // To keep track of warnings before kicking
      warnLimit: 3    // Number of warnings before kick
    };
  }
  
  // Check if the user is an admin of the group
  const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
  const botID = api.getCurrentUserID();
  const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
  
  if (!isAdmin) {
    return api.sendMessage("⚠️ You need to be an admin to use this command!", event.threadID, event.messageID);
  }
  
  if (!args[0] || !["on", "off", "add", "remove", "list", "limit"].includes(args[0].toLowerCase())) {
    return api.sendMessage(`⚙️ Bad Words Filter Commands:
🛡️ ${global.config.prefix}badwords on - Turn on bad words filter
🛡️ ${global.config.prefix}badwords off - Turn off bad words filter
➕ ${global.config.prefix}badwords add [word] - Add a word to the filter
➖ ${global.config.prefix}badwords remove [word] - Remove a word from the filter
📋 ${global.config.prefix}badwords list - Show all filtered words
🔢 ${global.config.prefix}badwords limit [number] - Set warning limit before kick (default: 3)
🔍 Current Status: ${data.badwords.enabled ? "ON ✅" : "OFF ❌"}
⚠️ Warning Limit: ${data.badwords.warnLimit} warnings before kick`, event.threadID, event.messageID);
  }
  
  const command = args[0].toLowerCase();
  
  switch (command) {
    case "on":
      if (!isBotAdmin) {
        return api.sendMessage("⚠️ The bot needs to be an admin to use the kick feature!", event.threadID, event.messageID);
      }
      
      data.badwords.enabled = true;
      await Threads.setData(event.threadID, { badwords: data.badwords });
      return api.sendMessage("✅ Bad words filter is now ON. Users who use bad words will receive warnings and may be kicked.", event.threadID, event.messageID);
      
    case "off":
      data.badwords.enabled = false;
      await Threads.setData(event.threadID, { badwords: data.badwords });
      return api.sendMessage("✅ Bad words filter is now OFF.", event.threadID, event.messageID);
      
    case "add":
      if (!args[1]) {
        return api.sendMessage("⚠️ Please specify a word to add to the filter.", event.threadID, event.messageID);
      }
      
      const wordToAdd = args.slice(1).join(" ").toLowerCase();
      
      if (data.badwords.words.includes(wordToAdd)) {
        return api.sendMessage(`⚠️ "${wordToAdd}" is already in the filter.`, event.threadID, event.messageID);
      }
      
      data.badwords.words.push(wordToAdd);
      await Threads.setData(event.threadID, { badwords: data.badwords });
      return api.sendMessage(`✅ Added "${wordToAdd}" to the bad words filter.`, event.threadID, event.messageID);
      
    case "remove":
      if (!args[1]) {
        return api.sendMessage("⚠️ Please specify a word to remove from the filter.", event.threadID, event.messageID);
      }
      
      const wordToRemove = args.slice(1).join(" ").toLowerCase();
      const wordIndex = data.badwords.words.indexOf(wordToRemove);
      
      if (wordIndex === -1) {
        return api.sendMessage(`⚠️ "${wordToRemove}" is not in the filter.`, event.threadID, event.messageID);
      }
      
      data.badwords.words.splice(wordIndex, 1);
      await Threads.setData(event.threadID, { badwords: data.badwords });
      return api.sendMessage(`✅ Removed "${wordToRemove}" from the bad words filter.`, event.threadID, event.messageID);
      
    case "list":
      if (data.badwords.words.length === 0) {
        return api.sendMessage("📋 The bad words filter list is empty.", event.threadID, event.messageID);
      }
      
      return api.sendMessage(`📋 Bad Words Filter List (${data.badwords.words.length} words):
${data.badwords.words.join(", ")}`, event.threadID, event.messageID);
      
    case "limit":
      if (!args[1] || isNaN(args[1]) || parseInt(args[1]) < 1) {
        return api.sendMessage("⚠️ Please specify a valid number (minimum 1) for the warning limit.", event.threadID, event.messageID);
      }
      
      data.badwords.warnLimit = parseInt(args[1]);
      await Threads.setData(event.threadID, { badwords: data.badwords });
      return api.sendMessage(`✅ Warning limit set to ${data.badwords.warnLimit} before kicking a user.`, event.threadID, event.messageID);
  }
};

// Event listener for message
module.exports.handleEvent = async function({ api, event, Threads }) {
  if (event.type !== "message" || event.senderID === api.getCurrentUserID()) return;
  
  const threadInfo = await Threads.getInfo(event.threadID);
  const data = threadInfo.data || {};
  
  // Skip if badwords filter is not configured or disabled
  if (!data.badwords || !data.badwords.enabled || !data.badwords.words || data.badwords.words.length === 0) return;
  
  // Check if bot is admin (needed for kick)
  const botID = api.getCurrentUserID();
  const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
  if (!isBotAdmin) return;
  
  // Check if user is admin (admins can't be kicked)
  const isUserAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
  if (isUserAdmin) return;
  
  // Check message for bad words
  const message = event.body.toLowerCase();
  let foundBadWord = null;
  
  for (const word of data.badwords.words) {
    if (message.includes(word)) {
      foundBadWord = word;
      break;
    }
  }
  
  if (foundBadWord) {
    // Initialize warn count for user if not exists
    if (!data.badwords.warnCount[event.senderID]) {
      data.badwords.warnCount[event.senderID] = 0;
    }
    
    // Increment warning count
    data.badwords.warnCount[event.senderID]++;
    const currentWarnCount = data.badwords.warnCount[event.senderID];
    
    // Save updated data
    await Threads.setData(event.threadID, { badwords: data.badwords });
    
    if (currentWarnCount >= data.badwords.warnLimit) {
      // Reset warning count
      data.badwords.warnCount[event.senderID] = 0;
      await Threads.setData(event.threadID, { badwords: data.badwords });
      
      // Kick the user
      api.sendMessage(`⛔ @${event.senderID} has been removed from the group for using bad words repeatedly.`, event.threadID, (err, info) => {
        if (err) return;
        
        // Remove user after sending the message
        api.removeUserFromGroup(event.senderID, event.threadID);
      });
    } else {
      // Send warning
      api.sendMessage(`⚠️ @${event.senderID}, please do not use bad words. Warning ${currentWarnCount}/${data.badwords.warnLimit}. You will be removed from the group if you continue.`, event.threadID);
    }
  }
};