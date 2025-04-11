/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "admintools",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Sano Developer",
  description: "Admin tools for group management",
  category: "group",
  prefix: true,
  usages: "[kick/ban/mute/unmute/info] [uid or @tag]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
  const threadInfo = await Threads.getInfo(event.threadID);
  const botID = api.getCurrentUserID();
  
  // Check if bot is admin in the group
  const isAdmin = threadInfo.adminIDs.some(admin => admin.id == botID);
  if (!isAdmin) {
    return api.sendMessage("⚠️ I need to be an admin to use these commands!", event.threadID, event.messageID);
  }
  
  const action = args[0];
  const mentions = Object.keys(event.mentions);
  let targetID = mentions.length > 0 ? mentions[0] : args[1];
  
  if (!action) {
    return api.sendMessage(`⚙️ Admin Tools Usage:
🛠️ ${global.config.prefix}admintools kick [@tag/uid] - Remove user from group
🛠️ ${global.config.prefix}admintools ban [@tag/uid] - Ban user from group
🛠️ ${global.config.prefix}admintools mute [@tag/uid] - Mute user in group
🛠️ ${global.config.prefix}admintools unmute [@tag/uid] - Unmute user in group
🛠️ ${global.config.prefix}admintools info - Show admins and group info`, event.threadID, event.messageID);
  }
  
  switch (action.toLowerCase()) {
    case "kick":
      if (!targetID) return api.sendMessage("⚠️ Please provide a user ID or tag a user to kick.", event.threadID, event.messageID);
      
      api.removeUserFromGroup(targetID, event.threadID, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err.error}`, event.threadID, event.messageID);
        api.sendMessage(`✅ User has been removed from the group.`, event.threadID, event.messageID);
      });
      break;
      
    case "ban":
      if (!targetID) return api.sendMessage("⚠️ Please provide a user ID or tag a user to ban.", event.threadID, event.messageID);
      
      api.removeUserFromGroup(targetID, event.threadID, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err.error}`, event.threadID, event.messageID);
        // Add user to thread banned users
        Threads.setData(event.threadID, { banned: { ...(threadInfo.data.banned || {}), [targetID]: { reason: "Banned by admin", time: Date.now() } } });
        api.sendMessage(`✅ User has been banned from the group.`, event.threadID, event.messageID);
      });
      break;
      
    case "mute":
      if (!targetID) return api.sendMessage("⚠️ Please provide a user ID or tag a user to mute.", event.threadID, event.messageID);
      
      // Set user as muted in thread data
      await Threads.setData(event.threadID, { muted: { ...(threadInfo.data.muted || {}), [targetID]: { reason: "Muted by admin", time: Date.now() } } });
      api.sendMessage(`✅ User has been muted. They won't be able to use commands.`, event.threadID, event.messageID);
      break;
      
    case "unmute":
      if (!targetID) return api.sendMessage("⚠️ Please provide a user ID or tag a user to unmute.", event.threadID, event.messageID);
      
      // Check if user is muted
      const mutedUsers = threadInfo.data.muted || {};
      if (!mutedUsers[targetID]) {
        return api.sendMessage("⚠️ This user is not muted.", event.threadID, event.messageID);
      }
      
      // Delete user from muted list
      const newMutedData = { ...mutedUsers };
      delete newMutedData[targetID];
      await Threads.setData(event.threadID, { muted: newMutedData });
      api.sendMessage(`✅ User has been unmuted.`, event.threadID, event.messageID);
      break;
      
    case "info":
      // Get admins from thread
      let adminList = "";
      for (const admin of threadInfo.adminIDs) {
        const userName = threadInfo.userInfo.find(user => user.id === admin.id)?.name || "Unknown";
        adminList += `\n👑 ${userName} (${admin.id})`;
      }
      
      api.sendMessage(`📊 Group Information:
🏷️ Name: ${threadInfo.threadName}
👥 Members: ${threadInfo.participantIDs.length}
🤖 Bot is admin: ${isAdmin ? "Yes ✅" : "No ❌"}

👑 Admins:${adminList}`, event.threadID, event.messageID);
      break;
      
    default:
      api.sendMessage(`⚠️ Unknown action: "${action}". Use kick, ban, mute, unmute, or info.`, event.threadID, event.messageID);
  }
};