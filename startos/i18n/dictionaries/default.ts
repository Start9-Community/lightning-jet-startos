export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Lightning Jet...': 0,
  'Jet Daemon': 1,
  'The Lightning Jet daemon is running': 2,
  'The Lightning Jet daemon is not running': 3,

  // actions/setTelegramToken.ts
  'Configure Telegram Bot': 4,
  'Set or clear the Telegram bot token used by Lightning Jet to send notifications.':
    5,
  'Telegram Bot Token': 6,
  'The API token issued by BotFather when you created your Jet Telegram bot. Leave blank to disable notifications.':
    7,
  'Telegram Bot Configured': 8,
  'Your Telegram token has been saved. Start a chat with your bot in Telegram and send /start to begin receiving notifications.':
    9,
  'Telegram Bot Disabled': 10,
  'The Telegram token has been cleared. Lightning Jet will no longer send Telegram notifications.':
    11,

  // actions/viewLogs.ts
  'View Logs': 12,
  'View a log file produced by Lightning Jet (rebalancer, htlc-logger, launcher, telegram).':
    13,
  'Log File': 14,
  'Which Lightning Jet log to read': 15,
  Rebalancer: 16,
  'HTLC Logger': 17,
  Launcher: 18,
  Telegram: 19,
  Tail: 20,
  'Number of trailing lines to return (up to 2000).': 21,
  'Log Contents': 22,
  'Tail of the selected log file below.': 23,
  'Log file is empty or does not exist yet.': 24,

} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
