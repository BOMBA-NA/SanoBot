
module.exports.config = {
  name: "help",
  version: "1.1.0",
  permission: 0,
  credits: "ryuko",
  description: "Displays command list or command details",
  prefix: true,
  premium: false,
  category: "guide",
  usages: "[page number/command name]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    moduleInfo: "╭─❍[ %1 ]❍─╮\n│ %2\n│\n│ Usage: %3\n│ Category: %4\n│ Cooldown: %5 seconds\n│ Permission: %6\n│ Developer: %7\n╰─────────────╯",
    helpList: "There are %1 commands across %2 categories",
    user: "User",
    adminGroup: "Group Admin",
    adminBot: "Bot Admin",
    operatorBot: "Bot Operator",
    commandNotFound: "Command not found.",
    helpHeader: "╭─❍[ COMMAND LIST ]❍─╮",
    helpFooter: "╰─────────────────╯\n• Type '%1help [command]' for details\n• Type '%1help [page]' to view other pages",
    pageInfo: "Page %1 of %2"
  },
  bangla: {
    moduleInfo: "╭─❍[ %1 ]❍─╮\n│ %2\n│\n│ ব্যবহার: %3\n│ বিভাগ: %4\n│ কুলডাউন: %5 সেকেন্ড\n│ অনুমতি: %6\n│ ডেভেলপার: %7\n╰─────────────╯",
    helpList: "মোট %1 টি কমান্ড এবং %2 টি বিভাগ আছে",
    user: "ব্যবহারকারী",
    adminGroup: "গ্রুপ অ্যাডমিন",
    adminBot: "বট অ্যাডমিন",
    operatorBot: "বট অপারেটর",
    commandNotFound: "কমান্ড পাওয়া যায়নি।",
    helpHeader: "╭─❍「 কমান্ড তালিকা 」❍─╮",
    helpFooter: "╰─────────────────╯\n• বিস্তারিত জানতে '%1help [কমান্ড]' টাইপ করুন\n• অন্য পৃষ্ঠা দেখতে '%1help [পৃষ্ঠা]' টাইপ করুন",
    pageInfo: "পৃষ্ঠা %1 / %2"
  },
  tagalog: {
    moduleInfo: "╭─❍[ %1 ]❍─╮\n│ %2\n│\n│ Paggamit: %3\n│ Kategorya: %4\n│ Cooldown: %5 segundo\n│ Permisyon: %6\n│ Developer: %7\n╰─────────────╯",
    helpList: "Mayroong %1 na mga utos at %2 na mga kategorya",
    user: "User",
    adminGroup: "Group Admin",
    adminBot: "Bot Admin",
    operatorBot: "Bot Operator",
    commandNotFound: "Hindi nahanap ang utos.",
    helpHeader: "╭─❍[ LISTAHAN NG UTOS ]❍─╮",
    helpFooter: "╰─────────────────╯\n• I-type '%1help [utos]' para sa detalye\n• I-type '%1help [page]' para makita ang ibang pahina",
    pageInfo: "Pahina %1 ng %2"
  }
};

module.exports.handleEvent = function ({ api, event, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;  

  if (!body || typeof body == "undefined" || body.indexOf("help") != 0)
    return;
  const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
  if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
  const command = commands.get(splitBody[1].toLowerCase());
  
  const permissionNames = {
    0: getText("user"),
    1: getText("adminGroup"),
    2: getText("adminBot"),
    3: getText("operatorBot")
  };
  
  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${
        command.config.usages ? command.config.usages : ""
      }`,
      command.config.category,
      command.config.cooldowns,
      permissionNames[command.config.permission] || getText("user"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};

module.exports.run = async function ({ api, event, args, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const commandName = (args[0] || "").toLowerCase();
  const command = commands.get(commandName);
  const autoUnsend = true;
  const delayUnsend = 60;
  
  // Display specific command information
  if (command) {
    const permissionNames = {
      0: getText("user"),
      1: getText("adminGroup"),
      2: getText("adminBot"),
      3: getText("operatorBot")
    };
    
    return api.sendMessage(
      getText(
        "moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${
          command.config.usages ? command.config.usages : ""
        }`,
        command.config.category,
        command.config.cooldowns,
        permissionNames[command.config.permission] || getText("user"),
        command.config.credits
      ),
      threadID, 
      async (error, info) => {
        if (autoUnsend) {
          await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
          return api.unsendMessage(info.messageID);
        } else return;
      }, 
      messageID
    );
  }
  
  // Display command list by categories
  const commandList = Array.from(commands.values());
  const categories = new Map();
  
  // Group commands by category
  commandList.forEach(cmd => {
    const category = cmd.config.category.toLowerCase();
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push(cmd.config.name);
  });
  
  // Sort categories alphabetically
  const sortedCategories = Array.from(categories.keys()).sort();
  const itemsPerPage = 5; // Categories per page
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  
  // Parse page number from args
  let currentPage = 1;
  if (args[0]) {
    const parsedPage = parseInt(args[0]);
    if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
      currentPage = parsedPage;
    } else if (isNaN(parsedPage)) {
      return api.sendMessage(getText("commandNotFound"), threadID, messageID);
    } else {
      return api.sendMessage(
        `⚠️ Page number must be between 1 and ${totalPages}.`,
        threadID,
        messageID
      );
    }
  }
  
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, sortedCategories.length);
  const visibleCategories = sortedCategories.slice(startIdx, endIdx);
  
  // Build message
  let msg = `${getText("helpHeader")}\n\n`;
  
  for (const category of visibleCategories) {
    const commandNames = categories.get(category).sort();
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    msg += `│ ◉ ${categoryTitle}\n`;
    msg += `│ ${commandNames.join(", ")}\n\n`;
  }
  
  msg += `│ ${getText("pageInfo", currentPage, totalPages)}\n`;
  msg += `│ ${getText("helpList", commands.size, categories.size)}\n`;
  msg += getText("helpFooter", prefix);
  
  const header = `🤖 ${botname.toUpperCase()} COMMAND GUIDE`;
  
  return api.sendMessage(
    `${header}\n\n${msg}`, 
    threadID, 
    async (error, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        return api.unsendMessage(info.messageID);
      } else return;
    }, 
    messageID
  );
};
