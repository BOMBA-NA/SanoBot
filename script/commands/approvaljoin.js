/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "approvaljoin",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Require approval for new members joining the group",
  category: "admin",
  usages: "[on/off/approve/deny] [userID]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const threadInfo = await Threads.getInfo(event.threadID);
  const data = threadInfo.data || {};
  data.pendingMembers = data.pendingMembers || {};
  
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
  
  if (!args[0] || !["on", "off", "approve", "deny", "list"].includes(args[0].toLowerCase())) {
    return api.sendMessage(`⚙️ Approval System Commands:
🛡️ ${global.config.prefix}approvaljoin on - Turn on join approval system
🛡️ ${global.config.prefix}approvaljoin off - Turn off join approval system
✅ ${global.config.prefix}approvaljoin approve [userID] - Approve a pending user
❌ ${global.config.prefix}approvaljoin deny [userID] - Deny a pending user
📋 ${global.config.prefix}approvaljoin list - List all pending users
🔍 Current Status: ${data.approvalMode ? "ON ✅" : "OFF ❌"}`, event.threadID, event.messageID);
  }
  
  const command = args[0].toLowerCase();
  
  switch (command) {
    case "on":
      await Threads.setData(event.threadID, { approvalMode: true });
      return api.sendMessage("✅ Join approval system has been turned ON. New members will need approval to join the group.", event.threadID, event.messageID);
      
    case "off":
      await Threads.setData(event.threadID, { approvalMode: false });
      return api.sendMessage("✅ Join approval system has been turned OFF. New members can join without approval.", event.threadID, event.messageID);
      
    case "list":
      const pendingUsers = data.pendingMembers;
      if (!pendingUsers || Object.keys(pendingUsers).length === 0) {
        return api.sendMessage("📋 There are no pending users waiting for approval.", event.threadID, event.messageID);
      }
      
      let pendingList = "📋 Pending Users:\n";
      for (const [userID, timestamp] of Object.entries(pendingUsers)) {
        const date = new Date(timestamp);
        pendingList += `👤 ${userID} - Requested: ${date.toLocaleString()}\n`;
      }
      
      return api.sendMessage(pendingList, event.threadID, event.messageID);
      
    case "approve":
      if (!args[1]) {
        return api.sendMessage("⚠️ Please provide a user ID to approve.", event.threadID, event.messageID);
      }
      
      const userIDToApprove = args[1];
      if (!data.pendingMembers[userIDToApprove]) {
        return api.sendMessage("⚠️ This user is not in the pending list.", event.threadID, event.messageID);
      }
      
      // Add user to the group
      api.addUserToGroup(userIDToApprove, event.threadID, (err) => {
        if (err) {
          return api.sendMessage(`❌ Failed to add user: ${err.error}`, event.threadID, event.messageID);
        }
        
        // Remove from pending list
        delete data.pendingMembers[userIDToApprove];
        Threads.setData(event.threadID, { pendingMembers: data.pendingMembers });
        
        api.sendMessage(`✅ User ${userIDToApprove} has been approved and added to the group.`, event.threadID, event.messageID);
      });
      break;
      
    case "deny":
      if (!args[1]) {
        return api.sendMessage("⚠️ Please provide a user ID to deny.", event.threadID, event.messageID);
      }
      
      const userIDToDeny = args[1];
      if (!data.pendingMembers[userIDToDeny]) {
        return api.sendMessage("⚠️ This user is not in the pending list.", event.threadID, event.messageID);
      }
      
      // Remove from pending list
      delete data.pendingMembers[userIDToDeny];
      await Threads.setData(event.threadID, { pendingMembers: data.pendingMembers });
      
      return api.sendMessage(`✅ User ${userIDToDeny} has been denied from joining the group.`, event.threadID, event.messageID);
  }
};