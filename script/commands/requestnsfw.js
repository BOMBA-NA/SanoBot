/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "requestnsfw",
  version: "1.0.0",
  permission: 1,
  credits: "Sano Developer",
  description: "Request NSFW permission for a thread",
  category: "admin",
  usages: "",
  cooldowns: 60, // 1 minute cooldown
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads }) {
  const { threadID, messageID, senderID } = event;
  const config = require("../../../config.json");
  const operators = config.operators || [];
  
  // Get thread info
  const threadInfo = await Threads.getInfo(threadID);
  const threadName = threadInfo.threadName || "unnamed group";
  
  // Check if the thread already has NSFW permission
  const threadData = await Threads.getData(threadID);
  if (threadData.data && threadData.data.NSFW) {
    return api.sendMessage("⚠️ This thread already has NSFW permission.", threadID, messageID);
  }
  
  // Get user info
  const userInfo = await api.getUserInfo(senderID);
  const userName = userInfo[senderID].name || "unknown user";
  
  // Create the request message
  const requestMessage = `📝 NSFW Request from ${threadName} (${threadID})
  
Requested by: ${userName} (${senderID})
Message: ${args.join(" ") || "No message provided"}

Reply "nsfw approve ${threadID}" to approve this request`;

  // Send the request to all operators
  let sentTo = 0;
  for (const operatorID of operators) {
    try {
      await api.sendMessage(requestMessage, operatorID);
      sentTo++;
    } catch (error) {
      console.error(`Failed to send NSFW request to operator ${operatorID}:`, error);
    }
  }
  
  if (sentTo > 0) {
    // Store the request in thread data
    const threadData = await Threads.getData(threadID);
    if (!threadData.data) threadData.data = {};
    threadData.data.NSFWRequest = {
      requested: true,
      requestedBy: senderID,
      requestedByName: userName,
      requestedAt: Date.now()
    };
    await Threads.setData(threadID, threadData);
    
    return api.sendMessage(`✅ Your NSFW permission request has been sent to ${sentTo} operators. Please wait for approval.`, threadID, messageID);
  } else {
    return api.sendMessage("❌ Failed to send NSFW request. No operators available.", threadID, messageID);
  }
};