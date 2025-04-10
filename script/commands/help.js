module.exports.config = {
  name: "help",
  version: "1.0.2",
  permission: 0,
  credits: "ryuko",
  description: "beginner's guide",
  prefix: true,
  premium: false,
  category: "guide",
  usages: "[Shows Commands]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    moduleInfo:
      "%1\n%2\n\nusage : %3\ncategory : %4\nwaiting time : %5 seconds(s)\npermission : %6\n\nmodule code by %7.",
    helpList:
      `THERE ARE %1 COMMANDS AND %2 CATEGORIES`,
    user: "user",
    adminGroup: "group admin",
    adminBot: "bot admin",
  },
  bangla: {
    moduleInfo:
      "%1\n%2\n\nusage : %3\ncategory : %4\nwaiting time : %5 seconds(s)\npermission : %6\n\nmodule code by %7.",
    helpList:
      `THERE ARE %1 COMMANDS AND %2 CATEGORIES`,
    user: "user",
    adminGroup: "group admin",
    adminBot: "bot admin",
  }
};


module.exports.handleEvent = function ({ api, event, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;  

  if (!body || typeof body == "undefined" || body.indexOf("help") != 0)
    return;
  const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
  if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const command = commands.get(splitBody[1].toLowerCase());
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
      command.config.permission === 0
        ? getText("user")
        : command.config.permission === 1
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};

module.exports.run = async function ({ api, event, args, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const autoUnsend  = true;
  const delayUnsend = 60;

  if (!command) {
    const commandList = Array.from(commands.values());
    const categories = new Set(commandList.map((cmd) => cmd.config.category.toLowerCase()));
    const categoryCount = categories.size;

    // If searching for a specific category
    if (args[0] && !isNaN(args[0])) {
      const categoryNames = Array.from(categories);
      const itemsPerPage = 10;
      const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

      let currentPage = 1;
      const parsedPage = parseInt(args[0]);
      if (
        !isNaN(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= totalPages
      ) {
        currentPage = parsedPage;
      } else {
        return api.sendMessage(
          `⚠️ Invalid page number. Please choose a page between 1 and ${totalPages}.`,
          threadID,
          messageID
        );
      }

      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const visibleCategories = categoryNames.slice(startIdx, endIdx);

      let msg = "";
      for (let i = 0; i < visibleCategories.length; i++) {
        const category = visibleCategories[i];
        const categoryCommands = commandList.filter(
          (cmd) => cmd.config.category.toLowerCase() === category
        );
        const commandNames = categoryCommands.map((cmd) => cmd.config.name);

        msg += `📁 ${category.charAt(0).toUpperCase() + category.slice(1).toUpperCase()} CATEGORY\n`;
        msg += `${commandNames.join(", ")}\n\n`;
      }

      msg += `📄 PAGE ${currentPage} OF ${totalPages}\n\n`;
      msg += getText("helpList", commands.size, categoryCount, prefix);

      const msgg = {
        body: `📋 COMMANDS AND CATEGORIES OF ${botname.toUpperCase()} AI\n\n` + msg + `\n\n`
      };
    } 
    // If searching for a specific category by name
    else if (args[0]) {
      const searchCategory = args[0].toLowerCase();
      const categoryExists = Array.from(categories).some(cat => cat.includes(searchCategory));

      if (!categoryExists) {
        return api.sendMessage(
          `⚠️ Category "${args[0]}" not found. Use "${prefix}help" to see all categories.`,
          threadID,
          messageID
        );
      }

      const filteredCategories = Array.from(categories).filter(cat => cat.includes(searchCategory));
      let msg = "";

      for (const category of filteredCategories) {
        const categoryCommands = commandList.filter(
          (cmd) => cmd.config.category.toLowerCase() === category
        );

        msg += `📁 ${category.charAt(0).toUpperCase() + category.slice(1).toUpperCase()} CATEGORY\n\n`;

        for (const cmd of categoryCommands) {
          msg += `• ${prefix}${cmd.config.name} - ${cmd.config.description || "No description"}\n`;
        }

        msg += `\n`;
      }

      const msgg = {
        body: `📋 COMMANDS IN ${args[0].toUpperCase()} CATEGORY\n\n${msg}`
      };

      const sentMessage = await api.sendMessage(msgg, threadID, async (error, info) => {
        if (autoUnsend) {
          await new Promise(resolve => setTimeout(resolve, delayUnsend * 500));
          return api.unsendMessage(info.messageID);
        } else return;
      }, messageID);

      return;
    }
    // Default view - show all categories
    else {
      const categoryNames = Array.from(categories);
      const itemsPerPage = 10;
      const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

      let msg = "";

      // First display categories summary
      msg += `📊 CATEGORIES (${categoryCount}):\n`;
      categoryNames.sort().forEach((category, index) => {
        const count = commandList.filter(cmd => cmd.config.category.toLowerCase() === category).length;
        msg += `${index+1}. ${category.charAt(0).toUpperCase() + category.slice(1)} (${count} commands)\n`;
      });

      msg += `\n📝 USAGE:\n`;
      msg += `• ${prefix}help [page number] - Browse commands by page\n`;
      msg += `• ${prefix}help [category name] - View commands in a category\n`;
      msg += `• ${prefix}help [command name] - Get details about a command\n\n`;

      msg += getText("helpList", commands.size, categoryCount, prefix);

      const msgg = {
        body: `📋 COMMANDS AND CATEGORIES OF ${botname.toUpperCase()} AI\n\n` + msg + `\n\n`
      };

      const sentMessage = await api.sendMessage(msgg, threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 500));
				return api.unsendMessage(info.messageID);
			} else return;
		}, messageID);
    }
  } else {
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
        command.config.permission === 0
          ? getText("user")
          : command.config.permission === 1
          ? getText("adminGroup")
          : getText("adminBot"),
        command.config.credits
      ),
      threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 500));
				return api.unsendMessage(info.messageID);
			} else return;
		}, messageID);
  }
};