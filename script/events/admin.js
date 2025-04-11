/** 
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
	name: "adminEvent",
	eventType: ["log:thread-admins"],
	version: "1.0.0"
};

module.exports.run = async function({ api, event, Threads }) {
  const { logMessageType, logMessageData } = event;
  
  if (logMessageType === 'log:thread-admins') {
    const { ADMIN_EVENT, PROMOTION_EVENT, DEMOTION_EVENT } = logMessageData;
    
    try {
      // Get thread info
      const threadInfo = await Threads.getInfo(event.threadID);
      const isBot = api.getCurrentUserID();
      
      // If the bot was promoted to admin
      if (PROMOTION_EVENT && logMessageData.TARGET_ID === isBot) {
        const promoter = logMessageData.ADMIN_EVENT ? logMessageData.ADMIN_EVENT : event.author;
        api.sendMessage(`Thank you for promoting me to admin! I can now provide more functionality in this group.`, event.threadID);
        
        // Enable special admin features
        await Threads.setData(event.threadID, { botIsAdmin: true });
        console.log(`Bot was promoted to admin in group ${event.threadID}`);
      }
      
      // If the bot was demoted from admin
      if (DEMOTION_EVENT && logMessageData.TARGET_ID === isBot) {
        await Threads.setData(event.threadID, { botIsAdmin: false });
        api.sendMessage(`I have been removed as an admin. Some features may be limited now.`, event.threadID);
        console.log(`Bot was demoted from admin in group ${event.threadID}`);
      }
      
    } catch (error) {
      console.error(`Error in admin event: ${error}`);
    }
  }
};