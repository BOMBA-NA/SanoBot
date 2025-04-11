/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "rename",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Change the name of the group chat",
  category: "admin",
  usages: "[New group name]",
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
    return api.sendMessage(`⚙️ Group Rename:
Current Name: ${threadInfo.threadName}
Usage: ${global.config.prefix}rename [New group name]`, event.threadID, event.messageID);
  }
  
  const newGroupName = args.join(" ");
  
  if (newGroupName.length > 100) {
    return api.sendMessage("⚠️ Group name cannot exceed 100 characters!", event.threadID, event.messageID);
  }
  
  // Change the group name
  api.setTitle(newGroupName, event.threadID, (err) => {
    if (err) {
      return api.sendMessage(`❌ Error changing group name: ${err.error}`, event.threadID, event.messageID);
    }
    
    api.sendMessage(`✅ Group name has been changed to: ${newGroupName}`, event.threadID, event.messageID);
  });
};