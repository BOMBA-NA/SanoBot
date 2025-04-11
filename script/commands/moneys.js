module.exports.config = {
        name: "moneys",
        version: "1.0.2",
        permission: 0,
        credits: "sano",
        prefix: false,
        premium: false,
        description: "check the amount of yourself or the person tagged",
        category: "without prefix",
        usages: "[tag/all/top/give/pay]",
        cooldowns: 5
};

module.exports.languages = {
        "bangla": {
                "sotienbanthan": "your current balance : %1$",
                "sotiennguoikhac": "%1's current balance : %2$."
        },
        "english": {
                "sotienbanthan": "your current balance : %1$",
                "sotiennguoikhac": "%1's current balance : %2$."
        }
}

module.exports.run = async function({ api, event, args, Currencies, getText }) {
        const { threadID, messageID, senderID, mentions } = event;
        const fs = require("fs-extra");

        // Check if command is being called in the right context
        if (this.config.hasOwnProperty("cooldowns") && this.config.cooldowns != 0) {
                let cooldown = this.config.cooldowns || 5;
                if (!global.client.cooldowns.has(this.config.name)) global.client.cooldowns.set(this.config.name, new Map());
                let timestamps = global.client.cooldowns.get(this.config.name);
                if (timestamps.has(senderID) && (timestamps.get(senderID) + (cooldown * 1000)) > Date.now()) {
                        let timeLeft = ((timestamps.get(senderID) + (cooldown * 1000)) - Date.now()) / 1000;
                        return api.sendMessage(`⏱ You are on cooldown. Please wait ${timeLeft.toFixed(0)} seconds before using this command again.`, threadID, messageID);
                }
                timestamps.set(senderID, Date.now());
        }

        // Format currency numbers with commas 
        function formatCurrency(number) {
                return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Check user's balance
        if (!args[0]) {
                try {
                        const userData = await Currencies.getData(senderID);
                        // Fix for undefined money
                        let money = 0;
                        if (userData && userData.money !== undefined) {
                            money = userData.money;
                        }
                        
                        // Get user name for better display
                        const userInfo = await api.getUserInfo(senderID);
                        const userName = userInfo[senderID].name || "User";
                        
                        return api.sendMessage({
                                body: `👤 ${userName}\n💰 ${getText("sotienbanthan", formatCurrency(money))}`,
                                mentions: [{
                                        tag: userName,
                                        id: senderID
                                }]
                        }, threadID, messageID);
                } catch (error) {
                        console.error("Error checking balance:", error);
                        return api.sendMessage("An error occurred while checking your balance. Please try again later.", threadID, messageID);
                }
        }
        
        // Show all group members' balances
        else if (args[0].toLowerCase() === "all" || args[0].toLowerCase() === "group") {
                try {
                        const threadInfo = await api.getThreadInfo(threadID);
                        const participants = threadInfo.participantIDs || [];
                        
                        if (participants.length === 0) {
                                return api.sendMessage("No participants found in this group.", threadID, messageID);
                        }
                        
                        let message = "👥 Group Money Balances 👥\n";
                        let mentions = [];
                        
                        for (const id of participants) {
                                if (id !== api.getCurrentUserID()) {
                                        try {
                                                const userData = await Currencies.getData(id);
                                                const money = userData.money || 0;
                                                
                                                const userInfo = await api.getUserInfo(id);
                                                if (userInfo && userInfo[id]) {
                                                        const userName = userInfo[id].name || "Unknown User";
                                                        message += `\n@${userName}: ${formatCurrency(money)}$`;
                                                        mentions.push({
                                                                tag: `@${userName}`,
                                                                id: id
                                                        });
                                                }
                                        } catch (err) {
                                                console.error(`Error getting data for user ${id}:`, err);
                                        }
                                }
                        }
                        
                        return api.sendMessage({
                                body: message,
                                mentions
                        }, threadID, messageID);
                } catch (error) {
                        console.error("Error fetching group data:", error);
                        return api.sendMessage("An error occurred while fetching group data. Please try again later.", threadID, messageID);
                }
        }

        // Show top richest users
        else if (args[0].toLowerCase() === "top" || args[0].toLowerCase() === "richest") {
                try {
                        // Get all currency data
                        const allData = await Currencies.getAll(['userID', 'money']);
                        
                        // Sort by money amount (descending)
                        const richestUsers = allData
                                .filter(user => user.money && user.userID && user.userID !== api.getCurrentUserID())
                                .sort((a, b) => (b.money || 0) - (a.money || 0))
                                .slice(0, 10);
                        
                        if (richestUsers.length === 0) {
                                return api.sendMessage("No users with money found.", threadID, messageID);
                        }
                        
                        let message = "💰 Top 10 Richest Users 💰\n";
                        let position = 1;
                        
                        for (const user of richestUsers) {
                                try {
                                        const userInfo = await api.getUserInfo(user.userID);
                                        if (userInfo && userInfo[user.userID]) {
                                                const userName = userInfo[user.userID].name || "Unknown User";
                                                message += `\n${position}. ${userName}: ${formatCurrency(user.money || 0)}$`;
                                                position++;
                                        }
                                } catch (err) {
                                        console.error(`Error getting info for user ${user.userID}:`, err);
                                }
                        }
                        
                        return api.sendMessage(message, threadID, messageID);
                } catch (error) {
                        console.error("Error fetching top users:", error);
                        return api.sendMessage("An error occurred while fetching top users. Please try again later.", threadID, messageID);
                }
        }

        // Check another user's balance (by mention)
        else if (Object.keys(event.mentions).length == 1) {
                try {
                        const mention = Object.keys(mentions)[0];
                        const userData = await Currencies.getData(mention);
                        const money = userData.money || 0;
                        
                        return api.sendMessage({
                                body: getText("sotiennguoikhac", mentions[mention].replace(/\@/g, ""), formatCurrency(money)),
                                mentions: [{
                                        tag: mentions[mention].replace(/\@/g, ""),
                                        id: mention
                                }]
                        }, threadID, messageID);
                } catch (error) {
                        console.error("Error checking mentioned user's balance:", error);
                        return api.sendMessage("An error occurred while checking the mentioned user's balance. Please try again later.", threadID, messageID);
                }
        }

        // Pay/give money functionality
        else if (args[0].toLowerCase() === "give" || args[0].toLowerCase() === "pay") {
                try {
                        // Check if all required parameters are provided
                        if (Object.keys(event.mentions).length !== 1 || !args[1] || !args[2]) {
                                return api.sendMessage(`Invalid usage. Correct format: ${this.config.name} give/pay @user [amount]`, threadID, messageID);
                        }
                        
                        // Get mentioned user and amount
                        const mentionID = Object.keys(mentions)[0];
                        const amount = parseInt(args[2]);
                        
                        // Validate amount
                        if (isNaN(amount) || amount <= 0) {
                                return api.sendMessage("Invalid amount. Please enter a positive number.", threadID, messageID);
                        }
                        
                        // Get sender's data
                        const senderData = await Currencies.getData(senderID);
                        let senderMoney = 0;
                        if (senderData && senderData.money !== undefined) {
                                senderMoney = senderData.money;
                        }
                        
                        // Check if sender has enough money
                        if (senderMoney < amount) {
                                return api.sendMessage(`You don't have enough money. Your current balance is ${formatCurrency(senderMoney)}$.`, threadID, messageID);
                        }
                        
                        // Get recipient's data
                        const recipientData = await Currencies.getData(mentionID);
                        let recipientMoney = 0;
                        if (recipientData && recipientData.money !== undefined) {
                                recipientMoney = recipientData.money;
                        }
                        
                        // Transfer money
                        await Currencies.decreaseMoney(senderID, amount);
                        await Currencies.increaseMoney(mentionID, amount);
                        
                        // Get user info for better display
                        const recipientInfo = await api.getUserInfo(mentionID);
                        const recipientName = recipientInfo[mentionID].name || "User";
                        
                        return api.sendMessage({
                                body: `Successfully transferred ${formatCurrency(amount)}$ to ${recipientName}!\n\nYour new balance: ${formatCurrency(senderMoney - amount)}$\n${recipientName}'s new balance: ${formatCurrency(recipientMoney + amount)}$`,
                                mentions: [{
                                        tag: recipientName,
                                        id: mentionID
                                }]
                        }, threadID, messageID);
                } catch (error) {
                        console.error("Error transferring money:", error);
                        return api.sendMessage("An error occurred while transferring money. Please try again later.", threadID, messageID);
                }
        }
        
        // Invalid command usage
        else {
                return api.sendMessage(`Invalid usage. Please use one of the following:\n- ${this.config.name}: Check your balance\n- ${this.config.name} @user: Check mentioned user's balance\n- ${this.config.name} all: Show balances of all group members\n- ${this.config.name} top: Show top 10 richest users\n- ${this.config.name} give/pay @user [amount]: Transfer money to another user`, threadID, messageID);
        }
}