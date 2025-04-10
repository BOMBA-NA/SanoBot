
module.exports.config = {
  name: "language",
  version: "1.1.0",
  permission: 2,
  prefix: true,
  credits: "ryuko (modified)",
  description: "Change the bot's language",
  premium: false,
  category: "admin",
  usages: "[bangla/english/tagalog]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    notOperator: "Only bot operators can use this command.",
    success: "Language has been changed to English.",
    invalidLang: "Invalid language. Available options: english, bangla, tagalog"
  },
  bangla: {
    notOperator: "শুধুমাত্র বট অপারেটর এই কমান্ড ব্যবহার করতে পারেন।",
    success: "ভাষা বাংলায় পরিবর্তন করা হয়েছে।",
    invalidLang: "অবৈধ ভাষা। উপলব্ধ বিকল্প: english, bangla, tagalog"
  },
  tagalog: {
    notOperator: "Ang mga bot operator lamang ang maaaring gumamit ng command na ito.",
    success: "Ang wika ay naging Tagalog na.",
    invalidLang: "Hindi wastong wika. Mga available na opsyon: english, bangla, tagalog"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  const { threadID, messageID } = event;
  const operators = global.config.operators || [];
  
  // Check if the user is an operator
  if (!operators.includes(event.senderID)) {
    return api.sendMessage(getText("notOperator"), threadID, messageID);
  }
  
  // If no argument provided, show current language and available options
  if (!args[0]) {
    const currentLang = global.config.language || "english";
    return api.sendMessage(
      `Current language: ${currentLang}\n\nAvailable languages:\n• english\n• bangla\n• tagalog\n\nUsage: language [option]`, 
      threadID, 
      messageID
    );
  }
  
  const language = args[0].toLowerCase();
  
  switch (language) {
    case "bangla":
      global.config.language = "bangla";
      return api.sendMessage("ভাষা বাংলায় পরিবর্তন করা হয়েছে।", threadID, messageID);
      
    case "english":
      global.config.language = "english";
      return api.sendMessage("Language has been changed to English.", threadID, messageID);
      
    case "tagalog":
      global.config.language = "tagalog";
      return api.sendMessage("Ang wika ay naging Tagalog na.", threadID, messageID);
      
    default:
      return api.sendMessage(
        getText("invalidLang"), 
        threadID, 
        messageID
      );
  }
};
