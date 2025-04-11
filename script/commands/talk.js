module.exports.config = {
     name: "talk",
     version: "1.1.0",
     permission: 0,
     credits: "ryuko",
     premium: false,
     description: "Interactive AI chat with advanced features",
     prefix: false,
     category: "without prefix",
     cooldowns: 0
};


const axios = require('axios');

module.exports.onLoad = function() {
    const { writeFileSync, existsSync } = global.nodemodule["fs-extra"];
    const { resolve } = global.nodemodule["path"];
    const log = require('../../main/utility/logs.js');
    const path = resolve(__dirname, 'system', 'system.json');
    if (!existsSync(path)) {
        const obj = {
            ryuko: {},
            settings: {},
            conversations: {}
        };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('ryuko')) data.ryuko = {};
        if (!data.hasOwnProperty('settings')) data.settings = {};
        if (!data.hasOwnProperty('conversations')) data.conversations = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
    }
}

module.exports.handleEvent = async ({ api, event, args, Threads }) => {
    const { threadID, messageID, senderID, body } = event;
    const { resolve } = global.nodemodule["path"];
    const fs = global.nodemodule["fs-extra"];
    const path = resolve(__dirname, 'system', 'system.json');
   
    const data = require(path);
    const { ryuko, conversations } = data;

    // Skip if bot sends message or talk feature is not enabled for this thread
    if (senderID === api.getCurrentUserID() || !ryuko.hasOwnProperty(threadID) || !ryuko[threadID]) {
        return;
    }

    // Initialize conversation history for this thread if it doesn't exist
    if (!conversations[threadID]) {
        conversations[threadID] = [];
    }

    // Maintain conversation history (limit to last 10 messages for context)
    conversations[threadID].push({
        role: "user",
        content: body
    });
    
    // Keep only last 10 messages for context
    if (conversations[threadID].length > 10) {
        conversations[threadID] = conversations[threadID].slice(conversations[threadID].length - 10);
    }

    // Save conversation history
    fs.writeFileSync(path, JSON.stringify(data, null, 4));

    try {
        // First try Sim API
        const simResponse = await axios.get(encodeURI(`https://joncll.serv00.net/sim/sim.php?query=${body}`));
        
        if (simResponse.data.respond && 
            simResponse.data.respond !== "null" && 
            simResponse.data.respond !== "i didn't understand you, teach me.") {
            
            // Add bot response to conversation history
            conversations[threadID].push({
                role: "assistant",
                content: simResponse.data.respond
            });
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
            
            return api.sendMessage(simResponse.data.respond, threadID, messageID);
        }
        
        // If Sim API doesn't understand, try alternate API or respond with a learning message
        // You can add more fallback APIs here if needed
        
        const learningMessage = "I'm still learning about this topic. Could you teach me more about it?";
        
        // Add bot response to conversation history
        conversations[threadID].push({
            role: "assistant",
            content: learningMessage
        });
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
        
        return api.sendMessage(learningMessage, threadID, messageID);
        
    } catch (error) {
        console.error("Error in talk AI response:", error);
        return api.sendMessage("Sorry, I'm having trouble understanding right now. Please try again later.", threadID, messageID);
    }
}

module.exports.run = async ({ api, event, args, permssion }) => {
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const { resolve } = global.nodemodule["path"];
    const path = resolve(__dirname, 'system', 'system.json');
    const { threadID, messageID, senderID } = event;
    const database = require(path);
    
    const { ryuko, settings, conversations } = database;

    if (!args[0]) { 
        return api.sendMessage("Usage:\n- talk on: Turn on talk mode\n- talk off: Turn off talk mode\n- talk clear: Clear conversation history\n- talk status: Check current talk status\n- talk [message]: Directly talk with AI without turning on talk mode", threadID, messageID);
    } else {
        switch(args[0].toLowerCase()) {
            case "on": {
                if (permssion !== 1 && permssion !== 2) return api.sendMessage('Only group admins can use this command', threadID, messageID);
                ryuko[threadID] = true;
                api.sendMessage("Talk mode is now enabled. The bot will respond to all messages in this chat.", threadID);
                break;
            }
            case "off": {
                if (permssion !== 1 && permssion !== 2) return api.sendMessage('Only group admins can use this command', threadID, messageID);
                ryuko[threadID] = false;
                api.sendMessage("Talk mode is now disabled. The bot will only respond to commands.", threadID);
                break;
            }
            case "clear": {
                if (permssion !== 1 && permssion !== 2) return api.sendMessage('Only group admins can use this command', threadID, messageID);
                if (conversations[threadID]) {
                    conversations[threadID] = [];
                    api.sendMessage("Conversation history has been cleared.", threadID);
                } else {
                    api.sendMessage("No conversation history found for this chat.", threadID);
                }
                break;
            }
            case "status": {
                const status = ryuko[threadID] ? "enabled" : "disabled";
                const historyCount = conversations[threadID] ? conversations[threadID].length : 0;
                
                api.sendMessage(`Talk mode is currently ${status}.\nConversation history: ${historyCount} messages stored.`, threadID);
                break;
            }
            default: {
                // Direct conversation with the bot without enabling talk mode
                const userQuery = args.join(" ");
                
                // Initialize conversation for this thread if it doesn't exist
                if (!conversations[threadID]) {
                    conversations[threadID] = [];
                }
                
                // Add user message to conversation history
                conversations[threadID].push({
                    role: "user",
                    content: userQuery
                });
                
                // Keep only last 10 messages
                if (conversations[threadID].length > 10) {
                    conversations[threadID] = conversations[threadID].slice(conversations[threadID].length - 10);
                }
                
                // Save updated conversation
                writeFileSync(path, JSON.stringify(database, null, 4));
                
                try {
                    // Try to get a response from Sim API
                    const response = await axios.get(encodeURI(`https://joncll.serv00.net/sim/sim.php?query=${userQuery}`));
                    
                    if (response.data.respond && 
                        response.data.respond !== "null" && 
                        response.data.respond !== "i didn't understand you, teach me.") {
                        
                        // Add bot response to conversation history
                        conversations[threadID].push({
                            role: "assistant",
                            content: response.data.respond
                        });
                        writeFileSync(path, JSON.stringify(database, null, 4));
                        
                        return api.sendMessage(response.data.respond, threadID, messageID);
                    } else {
                        const learningMessage = "I'm still learning about this topic. Could you teach me more about it?";
                        
                        // Add bot response to conversation history
                        conversations[threadID].push({
                            role: "assistant",
                            content: learningMessage
                        });
                        writeFileSync(path, JSON.stringify(database, null, 4));
                        
                        return api.sendMessage(learningMessage, threadID, messageID);
                    }
                } catch (error) {
                    console.error("Error in direct talk:", error);
                    return api.sendMessage("Sorry, I'm having trouble understanding right now. Please try again later.", threadID, messageID);
                }
            }
        }
        
        // Save all changes to the database
        writeFileSync(path, JSON.stringify(database, null, 4));
    }
}