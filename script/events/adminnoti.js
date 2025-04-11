/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "adminnoti",
  eventType: ["log:thread-admins", "log:thread-add-members", "log:thread-remove", "log:thread-admin-online", "log:thread-name"],
  version: "1.0.0",
  credits: "Sano Developer",
  description: "Admin notification system"
};

module.exports.run = async function({ api, event, Users }) {
  try {
    const { threadID, logMessageType, logMessageData } = event;
    const { readFileSync } = require("fs-extra");
    const config = JSON.parse(readFileSync("./config.json"));
    const operators = config.operators || [];
    const botID = api.getCurrentUserID();
    
    // Get thread info
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (e) {
      console.error(`Error getting thread info: ${e}`);
      return;
    }

    // Check for changes related to the bot
    switch (logMessageType) {
      // Bot made admin
      case "log:thread-admins": {
        if (logMessageData.ADMIN_EVENT === "add_admin") {
          if (logMessageData.TARGET_ID === botID) {
            const promoter = await Users.getNameUser(logMessageData.ACTOR_ID);
            const threadName = threadInfo.threadName;
            
            const message = `👑 Admin Notification 👑\n\n${promoter} has promoted me to admin in the group "${threadName}".`;
            
            // Notify each operator
            for (const adminID of operators) {
              api.sendMessage(message, adminID);
            }
          }
        }
        break;
      }
      
      // Bot added to a group
      case "log:thread-add-members": {
        const addedMembers = logMessageData.addedParticipants;
        
        // Check if bot was added
        if (addedMembers.some(member => member.userFbId === botID)) {
          const adder = await Users.getNameUser(logMessageData.author);
          const threadName = threadInfo.threadName;
          
          const message = `🆕 Admin Notification 🆕\n\nI have been added to a new group "${threadName}" by ${adder}.\n\nTotal members: ${threadInfo.participantIDs.length}`;
          
          // Notify each operator
          for (const adminID of operators) {
            api.sendMessage(message, adminID);
          }
        }
        break;
      }
      
      // Bot removed from a group
      case "log:thread-remove": {
        if (logMessageData.leftParticipantFbId === botID) {
          let remover;
          
          if (logMessageData.author) {
            remover = await Users.getNameUser(logMessageData.author);
          } else {
            remover = "Unknown user";
          }
          
          const message = `❌ Admin Notification ❌\n\nI have been removed from group "${threadInfo.threadName}" by ${remover}.`;
          
          // Notify each operator
          for (const adminID of operators) {
            api.sendMessage(message, adminID);
          }
        }
        break;
      }
      
      // Bot online status (first login or reconnection)
      case "log:thread-admin-online": {
        // This is sent when the bot starts up 
        if (logMessageData.id === botID) {
          const message = `🟢 Admin Notification 🟢\n\nBot is now online and ready to serve.\n\nCurrent stats:\n- Users: ${global.data.allUserID.length}\n- Groups: ${global.data.allThreadID.get(botID).length}`;
          
          // Notify each operator
          for (const adminID of operators) {
            api.sendMessage(message, adminID);
          }
        }
        break;
      }
      
      // Thread name change
      case "log:thread-name": {
        if (logMessageData.actor === botID) {
          const newName = logMessageData.name;
          const message = `📝 Admin Notification 📝\n\nI changed the name of a group to "${newName}".`;
          
          // Notify each operator
          for (const adminID of operators) {
            api.sendMessage(message, adminID);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error in adminnoti event: ${error}`);
  }
};