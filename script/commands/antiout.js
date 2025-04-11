/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "antiout",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Prevent members from leaving the group",
  category: "admin",
  usages: "[on/off]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const threadInfo = await Threads.getInfo(event.threadID);
  const data = threadInfo.data || {};
  
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
  
  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    return api.sendMessage(`⚙️ Anti-Out System:
🛡️ ${global.config.prefix}antiout on - Turn on anti-out protection
🛡️ ${global.config.prefix}antiout off - Turn off anti-out protection
🔍 Current Status: ${data.antiOut ? "ON ✅" : "OFF ❌"}`, event.threadID, event.messageID);
  }
  
  // Update thread data
  const enable = args[0].toLowerCase() === "on";
  await Threads.setData(event.threadID, { antiOut: enable });
  
  return api.sendMessage(`✅ Anti-Out protection has been turned ${enable ? "ON" : "OFF"}.
${enable ? "Users who leave will be automatically added back to the group." : "Users can now leave the group freely."}`, event.threadID, event.messageID);
};