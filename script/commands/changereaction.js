/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "changereaction",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Change the group chat emoji reaction",
  category: "admin",
  usages: "[emoji]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const threadInfo = await Threads.getInfo(event.threadID);
  
  // Check if the user is an admin of the group
  const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
  const botID = api.getCurrentUserID();
  const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
  
  if (!isAdmin) {
    return api.sendMessage("⚠️ You need to be an admin to use this command!", event.threadID, event.messageID);
  }
  
  if (!isBotAdmin) {
    return api.sendMessage("⚠️ The bot needs to be an admin to use this feature!", event.threadID, event.messageID);
  }
  
  if (args.length === 0) {
    return api.sendMessage(`⚙️ Group Emoji:
Current Emoji: ${threadInfo.emoji || "👍"}
Usage: ${global.config.prefix}changereaction [emoji]

Example: ${global.config.prefix}changereaction ❤️`, event.threadID, event.messageID);
  }
  
  const newEmoji = args[0];
  
  try {
    api.sendMessage(`⏳ Changing group emoji to ${newEmoji}...`, event.threadID, event.messageID);
    
    // Change the group emoji
    api.changeThreadEmoji(newEmoji, event.threadID, (err) => {
      if (err) {
        return api.sendMessage(`❌ Error changing group emoji: ${err.error}`, event.threadID, event.messageID);
      }
      
      api.sendMessage(`✅ Group emoji has been updated to ${newEmoji}`, event.threadID);
    });
  } catch (error) {
    api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};