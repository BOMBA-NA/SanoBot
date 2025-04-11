/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

module.exports.config = {
  name: "inboxhelp",
  version: "1.0.0",
  permission: 0,
  credits: "Sano Developer",
  description: "Guide for messaging users with the bot",
  category: "guide",
  usages: "",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  const guideMessage = `📬 MESSAGING GUIDE 📬

How to enable bot-to-user messaging:

1️⃣ PM/MESSAGE COMMAND ISSUES:
   When using the PM or message commands, you might see:
   ❌ "This thread is disabled" error
   
   This happens because Facebook restricts bots from messaging users who haven't:
   - Messaged the bot first
   - Added the bot as a friend
   - Been in a group with the bot

2️⃣ SOLUTIONS:
   ✅ Ask users to message the bot first
   ✅ Add the bot and user to the same group
   ✅ Have users add the bot as a friend
   
3️⃣ COMMANDS:
   - *pm [uid] [message] - Basic private messaging
   - *message [uid] [message] - Alternative with more connection methods
   
4️⃣ BEST PRACTICES:
   - For reliable messaging, add users to groups with the bot
   - Use group chats when direct messaging fails
   - Always check if allowinbox is set to TRUE in config.json

Need more help? Contact the bot operators.`;
  
  return api.sendMessage(guideMessage, threadID, messageID);
};