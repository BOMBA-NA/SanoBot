/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "restart-handler",
  eventType: ["log:loaded"],
  version: "1.0.0",
  credits: "Sano Developer",
  description: "Sends a confirmation message after bot restart",
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api }) {
  const fs = require("fs-extra");
  const restartFile = "./script/commands/cache/restart/restart.json";
  
  try {
    // Check if restart file exists
    if (fs.existsSync(restartFile)) {
      // Read restart data
      const restartData = JSON.parse(fs.readFileSync(restartFile, "utf8"));
      const { threadID, time } = restartData;
      
      // Calculate restart time
      const restartTime = ((Date.now() - time) / 1000).toFixed(2);
      
      // Send confirmation message
      api.sendMessage(`Successfully Restarted ✅\nRestart completed in ${restartTime} seconds.`, threadID);
      
      // Delete the restart file
      fs.unlinkSync(restartFile);
    }
  } catch (error) {
    console.error("Error in restart-handler event:", error);
  }
};