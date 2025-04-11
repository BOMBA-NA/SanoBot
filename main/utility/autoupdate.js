/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const logger = require("./logs.js");
const chalk = require("chalk");

// Color themes
const themes = {
  ghost: {
    info: "#ffffff",
    success: "#00ffff", 
    warning: "#ffff00",
    error: "#ff0000"
  },
  blue: {
    info: "#0000ff",
    success: "#00ffff",
    warning: "#ffff00",
    error: "#ff0000"
  },
  yellowred: {
    info: "#ffff00",
    success: "#00ff00",
    warning: "#ffff00",
    error: "#ff0000"
  },
  red: {
    info: "#ff0000",
    success: "#00ff00",
    warning: "#ffff00",
    error: "#ff0000"
  },
  yellow: {
    info: "#ffff00",
    success: "#00ff00",
    warning: "#ffff00",
    error: "#ff0000"
  },
  hacker: {
    info: "#00ff00",
    success: "#00ff00",
    warning: "#ffff00",
    error: "#ff0000"
  },
  neon: {
    info: "#00ffff",
    success: "#00ff99",
    warning: "#ffff00",
    error: "#ff00ff"
  }
};

// Default to neon if no theme is specified
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const activeTheme = themes[config.theme] || themes.neon;

// Format of log messages
const formatLog = {
  update: (message) => chalk.hex(activeTheme.info)(`[UPDATE] ${message}`),
  success: (message) => chalk.hex(activeTheme.success)(`[SUCCESS] ${message}`),
  warning: (message) => chalk.hex(activeTheme.warning)(`[WARNING] ${message}`),
  error: (message) => chalk.hex(activeTheme.error)(`[ERROR] ${message}`)
};

// Function to check for updates
async function checkForUpdates() {
  try {
    const repoPath = config.autoUpdate.repo;
    
    if (!repoPath) {
      console.log(formatLog.error("No repository path specified in config.json"));
      return;
    }
    
    console.log(formatLog.update(`Checking for updates from https://github.com/${repoPath}`));
    
    // Get the list of files from the commands directory in the repo
    const commandsApiUrl = `https://api.github.com/repos/${repoPath}/contents/script/commands`;
    const eventsApiUrl = `https://api.github.com/repos/${repoPath}/contents/script/events`;
    
    // Check commands directory
    await updateFilesFromRepo(commandsApiUrl, './script/commands', 'command');
    
    // Check events directory
    await updateFilesFromRepo(eventsApiUrl, './script/events', 'event');
    
    console.log(formatLog.success("Update check completed"));
    
  } catch (error) {
    console.log(formatLog.error(`Failed to check for updates: ${error.message}`));
  }
}

// Function to update files from repository
async function updateFilesFromRepo(apiUrl, localDir, fileType) {
  try {
    const response = await axios.get(apiUrl);
    const remoteFiles = response.data;
    
    if (!Array.isArray(remoteFiles)) {
      console.log(formatLog.error(`Invalid response for ${fileType} files`));
      return;
    }
    
    // Ensure local directory exists
    await fs.ensureDir(localDir);
    
    // Get local files
    const localFiles = await fs.readdir(localDir);
    const localFilesMap = localFiles.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
    
    let newFiles = 0;
    let updatedFiles = 0;
    
    // Process each remote file
    for (const file of remoteFiles) {
      if (file.name.endsWith('.js')) {
        const localPath = path.join(localDir, file.name);
        const remoteContentUrl = file.download_url;
        
        if (!localFilesMap[file.name]) {
          // New file - download it
          console.log(formatLog.update(`Downloading new ${fileType}: ${file.name}`));
          
          try {
            const fileContent = await axios.get(remoteContentUrl);
            await fs.writeFile(localPath, fileContent.data);
            console.log(formatLog.success(`Added new ${fileType}: ${file.name}`));
            newFiles++;
          } catch (err) {
            console.log(formatLog.error(`Failed to download ${file.name}: ${err.message}`));
          }
        } else {
          // File exists - check if it should be updated
          try {
            const localContent = await fs.readFile(localPath, 'utf8');
            const remoteContent = (await axios.get(remoteContentUrl)).data;
            
            // Only update if content is different and doesn't have local modifications
            if (localContent !== remoteContent &&
                !localContent.includes("// CUSTOM MODIFICATION - DO NOT UPDATE")) {
              
              await fs.writeFile(localPath, remoteContent);
              console.log(formatLog.success(`Updated ${fileType}: ${file.name}`));
              updatedFiles++;
            }
          } catch (err) {
            console.log(formatLog.error(`Failed to update ${file.name}: ${err.message}`));
          }
        }
      }
    }
    
    if (newFiles > 0 || updatedFiles > 0) {
      console.log(formatLog.success(`${fileType} updates: ${newFiles} new, ${updatedFiles} updated`));
    } else {
      console.log(formatLog.info(`No new ${fileType} updates found.`));
    }
    
  } catch (error) {
    console.log(formatLog.error(`Error updating ${fileType} files: ${error.message}`));
  }
}

// Export functions
module.exports = {
  checkForUpdates,
  formatLog,
  themes,
  activeTheme
};