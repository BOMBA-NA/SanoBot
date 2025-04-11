/**
 * @author Sano Developer
 * @credits by: Mot
 * @warn Do not edit code or edit credits
 */

const chalk = require('chalk');
const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");
const configLog = JSON.parse(readFileSync('./main/utility/config.json'));
const { activeTheme } = require('./autoupdate');

// Create fancy timestamp for logs
const getTimestamp = () => {
  const now = new Date();
  return chalk.hex(activeTheme.warning)(`[${now.toLocaleTimeString()}]`);
};

// Modern spinner characters for loading animation
const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIdx = 0;
const getSpinner = () => {
  spinnerIdx = (spinnerIdx + 1) % spinners.length;
  return chalk.hex(activeTheme.info)(spinners[spinnerIdx]);
};

// Colorful box drawing characters for modern console look
const boxChars = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
};

// Enhanced logging function
module.exports = async (log, type) => {
  const timestamp = getTimestamp();
  const spinner = getSpinner();
  
  switch (type) {
    case "load": 
      console.log(`${timestamp} ${spinner} ${chalk.hex(activeTheme.info)(configLog.load)} ${boxChars.horizontal} ${log}`);
      break;
    case "err":
      console.log(`${timestamp} ${chalk.hex(activeTheme.error)('✖')} ${chalk.hex(activeTheme.error)(configLog.error)} ${boxChars.horizontal} ${log}`);
      break;
    case "warn":
      console.warn(`${timestamp} ${chalk.hex(activeTheme.warning)('⚠')} ${chalk.hex(activeTheme.warning)(configLog.warn)} ${boxChars.horizontal} ${log}`);
      break;
    case "login":
      console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.login)} ${boxChars.horizontal} ${log}`);
      break;
    case "cmd":
      console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.cmd)} ${boxChars.horizontal} ${log}`);
      break;
    case "evnts":
      console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.evnts)} ${boxChars.horizontal} ${log}`);
      break;
    case "error":
      console.log(`${timestamp} ${chalk.hex(activeTheme.error)('✖')} ${chalk.hex(activeTheme.error)(configLog.error)} ${boxChars.horizontal} ${log}`);
      break;
    default:
      console.log(`${timestamp} ${spinner} ${chalk.hex(activeTheme.info)(configLog.load)} ${boxChars.horizontal} ${log}`);
      break;
  }
};

// Specialized logging functions with enhanced visuals
module.exports.commands = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.cmd)} ${boxChars.horizontal} ${log}`);
};

module.exports.events = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.evnts)} ${boxChars.horizontal} ${log}`);
};

module.exports.login = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)(configLog.login)} ${boxChars.horizontal} ${log}`);
};

module.exports.error = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.error)('✖')} ${chalk.hex(activeTheme.error)(configLog.error)} ${boxChars.horizontal} ${log}`);
};

module.exports.database = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.success)('✓')} ${chalk.hex(activeTheme.info)('database')} ${boxChars.horizontal} ${log}`);
};

module.exports.update = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.info)('↻')} ${chalk.hex(activeTheme.info)('update')} ${boxChars.horizontal} ${log}`);
};

module.exports.backup = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.info)('↑')} ${chalk.hex(activeTheme.info)('backup')} ${boxChars.horizontal} ${log}`);
};

module.exports.download = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.info)('↓')} ${chalk.hex(activeTheme.info)('download')} ${boxChars.horizontal} ${log}`);
};

module.exports.install = async (log) => {
  const timestamp = getTimestamp();
  console.log(`${timestamp} ${chalk.hex(activeTheme.info)('⚙')} ${chalk.hex(activeTheme.info)('install')} ${boxChars.horizontal} ${log}`);
};