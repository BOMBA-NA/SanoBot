module.exports.config = {
    name: 'admin',
    version: '1.0.0',
    permission: 2,
    credits: 'ryuko modified',
    prefix: true,
    premium: false,
    description: 'Admin management commands',
    category: 'admin',
    usages: 'admin [add/remove/list/info] [uid]',
    cooldowns: 5,
    dependencies: []
};

module.exports.run = async function({ api, event, args, Users, Threads, global }) {
    const { threadID, messageID, senderID } = event;
    const config = require('../../config.json');
    const fs = require('fs');
    const path = '../../config.json';
    
    // Check if user is an operator
    if (!config.operators.includes(senderID)) {
        return api.sendMessage('⚠️ Only bot operators can use this command.', threadID, messageID);
    }
    
    const command = args[0];
    const uid = args[1];
    
    if (!command) {
        return api.sendMessage(`⚠️ Missing command. Usage:\n- admin add [uid] : Add new admin\n- admin remove [uid] : Remove admin\n- admin list : Show all admins\n- admin info [uid] : Show admin info`, threadID, messageID);
    }
    
    switch(command.toLowerCase()) {
        case "add":
            if (!uid) return api.sendMessage('⚠️ Please provide a user ID to add as an admin.', threadID, messageID);
            
            if (config.operators.includes(uid)) {
                return api.sendMessage(`⚠️ User ID ${uid} is already an admin.`, threadID, messageID);
            }
            
            config.operators.push(uid);
            fs.writeFileSync(path, JSON.stringify(config, null, 2));
            
            return api.sendMessage(`✅ Successfully added user ID ${uid} as an admin.`, threadID, messageID);
            
        case "remove":
            if (!uid) return api.sendMessage('⚠️ Please provide a user ID to remove from admins.', threadID, messageID);
            
            if (!config.operators.includes(uid)) {
                return api.sendMessage(`⚠️ User ID ${uid} is not an admin.`, threadID, messageID);
            }
            
            // Special check to prevent removing the last admin
            if (config.operators.length <= 1) {
                return api.sendMessage('⚠️ Cannot remove the last admin. Add another admin first.', threadID, messageID);
            }
            
            config.operators = config.operators.filter(id => id !== uid);
            fs.writeFileSync(path, JSON.stringify(config, null, 2));
            
            return api.sendMessage(`✅ Successfully removed user ID ${uid} from admins.`, threadID, messageID);
            
        case "list":
            if (config.operators.length === 0) {
                return api.sendMessage('⚠️ No admins are configured.', threadID, messageID);
            }
            
            let adminList = '📜 List of Bot Administrators:\n\n';
            
            for (let i = 0; i < config.operators.length; i++) {
                const adminID = config.operators[i];
                let adminName = 'Unknown';
                
                try {
                    const userInfo = await api.getUserInfo(adminID);
                    adminName = userInfo[adminID].name || 'Unknown';
                } catch (error) {
                    console.error(error);
                }
                
                adminList += `${i+1}. ${adminName} (${adminID})\n`;
            }
            
            return api.sendMessage(adminList, threadID, messageID);
            
        case "info":
            if (!uid) return api.sendMessage('⚠️ Please provide a user ID to check admin status.', threadID, messageID);
            
            const isAdmin = config.operators.includes(uid);
            let userName = 'Unknown';
            
            try {
                const userInfo = await api.getUserInfo(uid);
                userName = userInfo[uid].name || 'Unknown';
            } catch (error) {
                console.error(error);
            }
            
            return api.sendMessage(
                `👤 User Information:\n\n` +
                `Name: ${userName}\n` +
                `ID: ${uid}\n` +
                `Admin Status: ${isAdmin ? '✅ Admin' : '❌ Not Admin'}`,
                threadID, messageID
            );
            
        default:
            return api.sendMessage(`⚠️ Invalid command. Usage:\n- admin add [uid] : Add new admin\n- admin remove [uid] : Remove admin\n- admin list : Show all admins\n- admin info [uid] : Show admin info`, threadID, messageID);
    }
};