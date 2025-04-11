/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "nsfw",
  version: "1.0.0",
  permission: 2, // For admin and operator only
  credits: "Sano Developer",
  description: "Approve or deny NSFW requests",
  category: "admin",
  usages: "approve [threadID] / deny [threadID]",
  cooldowns: 3,
  prefix: true
};

module.exports.run = async function({ api, event, args, Threads, Users }) {
  const { threadID, messageID, senderID } = event;
  const config = require("../../../config.json");
  const operators = config.operators || [];
  
  // Check if user is an operator
  if (!operators.includes(senderID.toString())) {
    return api.sendMessage("⚠️ Only operators can use this command.", threadID, messageID);
  }
  
  if (args.length < 2) {
    return api.sendMessage("⚠️ Usage: nsfw approve [threadID] / nsfw deny [threadID]", threadID, messageID);
  }
  
  const action = args[0].toLowerCase();
  const targetThreadID = args[1];
  
  if (action !== "approve" && action !== "deny") {
    return api.sendMessage("⚠️ Invalid action. Use 'approve' or 'deny'.", threadID, messageID);
  }
  
  // Check if thread exists
  try {
    const threadInfo = await Threads.getInfo(targetThreadID);
    if (!threadInfo) {
      return api.sendMessage(`⚠️ Thread with ID ${targetThreadID} not found.`, threadID, messageID);
    }
    
    const threadName = threadInfo.threadName || "unnamed group";
    const threadData = await Threads.getData(targetThreadID);
    
    // Check if there's a pending request
    if (!threadData.data || !threadData.data.NSFWRequest || !threadData.data.NSFWRequest.requested) {
      return api.sendMessage(`⚠️ No NSFW request found for thread ${threadName} (${targetThreadID})`, threadID, messageID);
    }
    
    // Get requester info
    const requesterID = threadData.data.NSFWRequest.requestedBy;
    const requesterName = threadData.data.NSFWRequest.requestedByName || await Users.getNameUser(requesterID);
    
    if (action === "approve") {
      // Approve the request
      if (!threadData.data) threadData.data = {};
      threadData.data.NSFW = true;
      threadData.data.NSFWRequest.approved = true;
      threadData.data.NSFWRequest.approvedBy = senderID;
      threadData.data.NSFWRequest.approvedAt = Date.now();
      
      await Threads.setData(targetThreadID, threadData);
      
      // Add thread to global NSFW list if not already there
      if (!global.data.threadAllowNSFW.includes(targetThreadID)) {
        global.data.threadAllowNSFW.push(targetThreadID);
      }
      
      // Notify the thread
      api.sendMessage(`✅ NSFW permission has been approved by operator. NSFW commands are now enabled.
      
Request by: ${requesterName}`, targetThreadID);
      
      // Notify the requester
      api.sendMessage(`✅ Your NSFW request for group "${threadName}" has been approved.`, requesterID);
      
      return api.sendMessage(`✅ NSFW permission approved for thread "${threadName}" (${targetThreadID})`, threadID, messageID);
    } else {
      // Deny the request
      if (!threadData.data) threadData.data = {};
      threadData.data.NSFWRequest.denied = true;
      threadData.data.NSFWRequest.deniedBy = senderID;
      threadData.data.NSFWRequest.deniedAt = Date.now();
      
      await Threads.setData(targetThreadID, threadData);
      
      // Notify the thread
      api.sendMessage(`❌ NSFW permission request has been denied by operator.`, targetThreadID);
      
      // Notify the requester
      api.sendMessage(`❌ Your NSFW request for group "${threadName}" has been denied.`, requesterID);
      
      return api.sendMessage(`❌ NSFW permission denied for thread "${threadName}" (${targetThreadID})`, threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ An error occurred: ${error.message}`, threadID, messageID);
  }
};