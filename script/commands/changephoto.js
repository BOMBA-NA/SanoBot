/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "changephoto",
  version: "1.0.0",
  permission: 1,
  credits: "Sano Developer",
  description: "Change the group chat photo",
  category: "admin",
  usages: "[Reply to an image]",
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
  
  if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ Please reply to an image to set as the group photo.", event.threadID, event.messageID);
  }
  
  const attachment = event.messageReply.attachments[0];
  
  if (attachment.type !== "photo") {
    return api.sendMessage("⚠️ The attachment must be a photo.", event.threadID, event.messageID);
  }
  
  const imageURL = attachment.url;
  
  try {
    api.sendMessage("⏳ Changing group photo...", event.threadID, event.messageID);
    
    // Change the group photo
    api.changeGroupImage(imageURL, event.threadID, (err) => {
      if (err) {
        return api.sendMessage(`❌ Error changing group photo: ${err.error}`, event.threadID, event.messageID);
      }
      
      api.sendMessage("✅ Group photo has been updated successfully!", event.threadID);
    });
  } catch (error) {
    api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};