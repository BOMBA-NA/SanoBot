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