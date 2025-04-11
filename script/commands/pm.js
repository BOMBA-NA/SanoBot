/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "pm",
  version: "1.0.0",
  permission: 2,
  credits: "Sano Developer",
  description: "Send a private message to a user by UID",
  category: "admin",
  usages: "[uid] [message]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  if (args.length < 2) {
    return api.sendMessage("⚠️ Usage: pm [uid] [message]", threadID, messageID);
  }
  
  const recipientID = args[0];
  const message = args.slice(1).join(" ");
  
  if (!recipientID || !message) {
    return api.sendMessage("⚠️ Both UID and message are required.", threadID, messageID);
  }
  
  try {
    // Get recipient user info to confirm existence
    const userInfo = await api.getUserInfo(recipientID);
    if (!userInfo || !userInfo[recipientID]) {
      return api.sendMessage(`⚠️ Could not find user with UID: ${recipientID}`, threadID, messageID);
    }
    
    const recipientName = userInfo[recipientID].name || "User";
    
    // Create a conversation first (this often helps with the "thread disabled" error)
    try {
      // Try to create/open a conversation thread first
      await api.sendTypingIndicator(recipientID);
      
      // Attempt to send a message with alternative method using message_id
      const msg = {
        body: `📨 Message from bot admin:\n\n${message}`
      };
      
      // Use a promise-based approach with timeout
      const sendWithTimeout = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Message send operation timed out"));
        }, 10000); // 10 seconds timeout
        
        api.sendMessage(msg, recipientID, (err, info) => {
          clearTimeout(timeoutId);
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
      
      await sendWithTimeout;
      
      // If we get here, the message was sent successfully
      return api.sendMessage(`✅ Message successfully sent to ${recipientName} (${recipientID}):\n\n${message}`, threadID, messageID);
    } catch (sendError) {
      console.error("PM Send Error:", sendError);
      
      // Special handling for thread disabled error
      if (sendError.errorDescription && sendError.errorDescription.includes("thread is disabled")) {
        return api.sendMessage(
          `❌ Cannot send message to ${recipientName}: This user has restricted messages from non-friends or bots.\n\nTry one of these solutions:\n1. Ask them to add the bot as a friend\n2. Ask them to message the bot first to start a conversation\n3. Add them to a group with the bot`, 
          threadID, 
          messageID
        );
      }
      
      // Handle other errors
      return api.sendMessage(
        `❌ Error sending message to ${recipientName}: ${sendError.errorDescription || sendError.message || "Unknown error"}`, 
        threadID, 
        messageID
      );
    }
  } catch (error) {
    console.error("PM Error:", error);
    return api.sendMessage(`❌ Error processing request: ${error.message}`, threadID, messageID);
  }
};
module.exports.config = {
    name: "pm",
    version: "1.0.0",
    permission: 0,
    credits: "sano",
    prefix: true,
    description: "Send a private message to a Facebook user by ID",
    category: "utility",
    usages: "[UID] [message]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    if (args.length < 2) {
        return api.sendMessage("Usage: *pm [uid] [message]", threadID, messageID);
    }
    
    const uid = args[0];
    // Validate if uid is a valid Facebook user ID format
    if (!/^\d+$/.test(uid)) {
        return api.sendMessage("Error: Invalid UID format. User ID should contain only numbers.", threadID, messageID);
    }
    
    const message = args.slice(1).join(" ");
    
    try {
        // Check if the user exists by attempting to get their info
        const userInfo = await api.getUserInfo(uid);
        
        if (!userInfo || !userInfo[uid]) {
            return api.sendMessage(`Error: Could not find a user with ID ${uid}.`, threadID, messageID);
        }
        
        const userName = userInfo[uid].name || "User";
        
        // Get sender info for better message formatting
        const senderInfo = await api.getUserInfo(senderID);
        const senderName = senderInfo[senderID].name || "Unknown User";
        
        // Send the message to the recipient
        await api.sendMessage({
            body: `Message from ${senderName}:\n\n${message}`
        }, uid);
        
        // Confirm to the sender that the message was sent
        return api.sendMessage({
            body: `✅ Message successfully sent to ${userName} (${uid}):\n\n"${message}"`
        }, threadID, messageID);
        
    } catch (error) {
        console.error("Error in PM command:", error);
        return api.sendMessage(`Error: Unable to send message to UID ${uid}. The user may have privacy restrictions, or the UID may be incorrect.`, threadID, messageID);
    }
}
