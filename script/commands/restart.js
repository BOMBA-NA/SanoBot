module.exports.config = {
        name: "restart",
        version: "7.0.1",
        permission: 3,
        credits: "sano",
        prefix: false,
        premium: false,
        description: "restart bot system",
        category: "operator",
        usages: "",
        cooldowns: 0
};

module.exports.run = async function({ api, event, args, Threads, Users, Currencies, models, botname }) {
  const process = require("process");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;
  
  // Store the threadID where the restart command was initiated
  try {
    // Create a restart_info.json file to store the thread ID
    const restartInfo = {
      threadID: threadID,
      time: Date.now()
    };
    
    fs.writeFileSync("./script/commands/cache/restart_info.json", JSON.stringify(restartInfo));
    
    // Send message and restart
    return api.sendMessage(`Restarting the whole system, please be patient...`, threadID, () => process.exit(1));
  } catch (error) {
    console.error("Error storing restart info:", error);
    return api.sendMessage(`Restarting the whole system, please be patient...`, threadID, () => process.exit(1));
  }
}

// Listen for system restart completion
module.exports.onLoad = function() {
  const fs = require("fs-extra");
  const path = "./script/commands/cache/restart_info.json";
  
  if (fs.existsSync(path)) {
    try {
      // Read the stored threadID
      const restartInfo = JSON.parse(fs.readFileSync(path));
      const timeDiff = Date.now() - restartInfo.time;
      
      // Only send the restart success message if the restart was recent (within 2 minutes)
      if (timeDiff <= 120000) {
        const api = global.nodemodule.api;
        if (api && typeof api.sendMessage === "function") {
          setTimeout(() => {
            api.sendMessage("Restarted Successfully ✅", restartInfo.threadID);
          }, 2000); // Delay by 2 seconds to ensure the bot has fully initialized
        }
      }
      
      // Delete the file after reading
      fs.unlinkSync(path);
    } catch (error) {
      console.error("Error sending restart completion message:", error);
    }
  }
}
