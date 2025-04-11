/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "operatornoti",
  eventType: ["log:thread-admins", "log:user-block", "log:thread-join", "log:thread-leave", "log:loaded"],
  version: "1.1.0",
  credits: "Sano Developer",
  description: "Notify operators of bot status changes including when bot comes online",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event, Threads, Users }) {
  const { threadID, logMessageType, logMessageData } = event;
  const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");
  const config = require("../../../config.json");
  const operators = config.operators || [];
  
  if (operators.length === 0) return; // No operators to notify
  
  let botID = api.getCurrentUserID();
  let botName = "";
  
  try {
    const bots = require("../../../bots.json");
    const botInfo = bots.find(item => item.uid === botID);
    botName = botInfo ? botInfo.botname : "Bot";
  } catch (error) {
    console.error("Error getting bot name:", error);
    botName = "Bot";
  }
  
  let notificationMsg = "";
  
  // When bot comes online (log:loaded event)
  if (logMessageType === "log:loaded") {
    notificationMsg = `🟢 BOT ONLINE STATUS 🟢
⏰ Time: ${time}

✅ ${botName} is now online and ready to serve
🤖 Bot ID: ${botID}

💡 System Information:
- Node Version: ${process.version}
- Platform: ${process.platform}
- Uptime: ${Math.floor(process.uptime())} seconds
`;
  }
  
  // When bot is added to a group
  else if (logMessageType === "log:thread-join" && logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
    const threadInfo = await Threads.getInfo(threadID) || {};
    const threadName = threadInfo.threadName || "Unknown group";
    notificationMsg = `🟢 BOT STATUS UPDATE 🟢
⏰ Time: ${time}

✅ ${botName} has been added to a new group:
📋 Group Name: ${threadName}
🆔 Group ID: ${threadID}

👤 Added by: `;
    
    // Get the user who added the bot
    const addedByUserID = logMessageData.author;
    if (addedByUserID) {
      try {
        const addedByInfo = await Users.getInfo(addedByUserID);
        const addedByName = addedByInfo.name || "Unknown User";
        notificationMsg += `${addedByName} (${addedByUserID})`;
      } catch (error) {
        notificationMsg += `Unknown User (${addedByUserID})`;
      }
    } else {
      notificationMsg += "Unknown User";
    }
  }
  
  // When bot is removed from a group
  else if (logMessageType === "log:thread-leave" && logMessageData.leftParticipantFbId == botID) {
    const threadInfo = await Threads.getInfo(threadID) || {};
    const threadName = threadInfo.threadName || "Unknown group";
    notificationMsg = `🔴 BOT STATUS UPDATE 🔴
⏰ Time: ${time}

❌ ${botName} has been removed from a group:
📋 Group Name: ${threadName}
🆔 Group ID: ${threadID}

👤 Removed by: `;
    
    // Get the user who removed the bot
    const removedByUserID = logMessageData.author;
    if (removedByUserID) {
      try {
        const removedByInfo = await Users.getInfo(removedByUserID);
        const removedByName = removedByInfo.name || "Unknown User";
        notificationMsg += `${removedByName} (${removedByUserID})`;
      } catch (error) {
        notificationMsg += `Unknown User (${removedByUserID})`;
      }
    } else {
      notificationMsg += "Unknown User";
    }
  }
  
  // When bot is promoted to admin
  else if (logMessageType === "log:thread-admins" && logMessageData.ADMIN_EVENT === 1 && logMessageData.TARGET_ID == botID) {
    const threadInfo = await Threads.getInfo(threadID) || {};
    const threadName = threadInfo.threadName || "Unknown group";
    notificationMsg = `🔵 BOT STATUS UPDATE 🔵
⏰ Time: ${time}

👑 ${botName} has been promoted to admin:
📋 Group Name: ${threadName}
🆔 Group ID: ${threadID}

👤 Promoted by: `;
    
    // Get the user who promoted the bot
    const promotedByUserID = logMessageData.ACTOR_ID;
    if (promotedByUserID) {
      try {
        const promotedByInfo = await Users.getInfo(promotedByUserID);
        const promotedByName = promotedByInfo.name || "Unknown User";
        notificationMsg += `${promotedByName} (${promotedByUserID})`;
      } catch (error) {
        notificationMsg += `Unknown User (${promotedByUserID})`;
      }
    } else {
      notificationMsg += "Unknown User";
    }
  }
  
  // When bot is demoted from admin
  else if (logMessageType === "log:thread-admins" && logMessageData.ADMIN_EVENT === 0 && logMessageData.TARGET_ID == botID) {
    const threadInfo = await Threads.getInfo(threadID) || {};
    const threadName = threadInfo.threadName || "Unknown group";
    notificationMsg = `🟡 BOT STATUS UPDATE 🟡
⏰ Time: ${time}

👑 ${botName} has been demoted from admin:
📋 Group Name: ${threadName}
🆔 Group ID: ${threadID}

👤 Demoted by: `;
    
    // Get the user who demoted the bot
    const demotedByUserID = logMessageData.ACTOR_ID;
    if (demotedByUserID) {
      try {
        const demotedByInfo = await Users.getInfo(demotedByUserID);
        const demotedByName = demotedByInfo.name || "Unknown User";
        notificationMsg += `${demotedByName} (${demotedByUserID})`;
      } catch (error) {
        notificationMsg += `Unknown User (${demotedByUserID})`;
      }
    } else {
      notificationMsg += "Unknown User";
    }
  }
  
  // Send notification to operators if there's a message
  if (notificationMsg) {
    for (const operatorID of operators) {
      try {
        await api.sendMessage(notificationMsg, operatorID);
      } catch (error) {
        console.error(`Failed to send notification to operator ${operatorID}:`, error);
      }
    }
  }
};