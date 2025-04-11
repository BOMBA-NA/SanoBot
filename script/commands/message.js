/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "message",
  version: "1.0.0",
  permission: 2,
  credits: "Sano Developer",
  description: "Start a conversation with a user via UID (alternative to PM)",
  category: "admin",
  usages: "[uid] [message]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  if (args.length < 2) {
    return api.sendMessage("⚠️ Usage: message [uid] [message]", threadID, messageID);
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
    
    // Notify user about message attempt
    api.sendMessage(`🔄 Attempting to message ${recipientName}...`, threadID, messageID);
    
    // Try multiple approaches to start a conversation
    try {
      // 1. First try typing indicator to "warm up" the thread
      await api.sendTypingIndicator(recipientID);
      
      // 2. Try marking as read first (sometimes helps initialize the thread)
      try {
        await api.markAsRead(recipientID);
      } catch (markError) {
        // Ignore errors from mark as read
        console.log("Mark as read error (can be ignored):", markError);
      }
      
      // 3. Try sending a message with presence (more likely to work)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Send the actual message with presence
      const options = {
        offerPresence: true,
        body: `📨 Message from bot admin:\n\n${message}`
      };
      
      // Create a promise for the send with timeout
      const sendPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Message send operation timed out"));
        }, 10000);
        
        api.sendMessage(options, recipientID, (err, info) => {
          clearTimeout(timeoutId);
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
      
      // Wait for the send to complete or time out
      const messageInfo = await sendPromise;
      
      // If we successfully sent the message, confirm to the user
      return api.sendMessage(`✅ Message successfully delivered to ${recipientName} (${recipientID}):\n\n${message}`, threadID);
      
    } catch (sendError) {
      console.error("Message Send Error:", sendError);
      
      // Provide detailed error and workarounds
      return api.sendMessage(
        `❌ Could not send message to ${recipientName} (${recipientID}).\n\nPossible reasons and solutions:\n` +
        `1. The user has restricted messages from bots or non-friends\n` +
        `2. The user needs to message the bot first to start a conversation\n` +
        `3. The user should add the bot as a friend\n` +
        `4. Try adding the user to a group with the bot\n\n` +
        `Technical error: ${sendError.errorDescription || sendError.message || "Unknown error"}`,
        threadID
      );
    }
  } catch (error) {
    console.error("Message command error:", error);
    return api.sendMessage(`❌ Error processing request: ${error.message}`, threadID, messageID);
  }
};