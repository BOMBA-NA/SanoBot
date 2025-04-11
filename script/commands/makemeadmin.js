/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "makemeadmin",
  version: "1.0.0",
  permission: 0,
  credits: "Sano Developer",
  description: "Make bot admins into group admins",
  category: "admin",
  usages: "",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const { threadID, messageID, senderID } = event;
  const botID = api.getCurrentUserID();
  const bots = require("../../../bots.json");
  
  // Get the bot's admin list
  let admins;
  try {
    admins = bots.find(item => item.uid === botID).admins;
  } catch (error) {
    return api.sendMessage("Error: Could not get bot admins list.", threadID, messageID);
  }
  
  // Check if the user is a bot admin
  if (!admins.includes(senderID.toString())) {
    return api.sendMessage("⚠️ You need to be a bot admin to use this command!", threadID, messageID);
  }
  
  // Get thread info to check admin status
  const threadInfo = await Threads.getInfo(threadID);
  const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
  
  if (!isBotAdmin) {
    return api.sendMessage("⚠️ The bot needs to be an admin to add other admins!", threadID, messageID);
  }
  
  // Check if the user is already an admin
  const isAlreadyAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
  
  if (isAlreadyAdmin) {
    return api.sendMessage("⚠️ You are already an admin of this group.", threadID, messageID);
  }
  
  // Add the user as an admin
  api.sendMessage("⏳ Promoting you to admin...", threadID, messageID);
  
  try {
    api.changeAdminStatus(threadID, senderID, true, (err) => {
      if (err) {
        return api.sendMessage(`❌ Error promoting to admin: ${err.error}`, threadID, messageID);
      }
      
      api.sendMessage("✅ You have been promoted to admin of this group!", threadID);
    });
  } catch (error) {
    api.sendMessage(`❌ An error occurred: ${error.message}`, threadID, messageID);
  }
};