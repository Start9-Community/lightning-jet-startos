import { jetConfig } from '../fileModels/config.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  telegramToken: Value.text({
    name: i18n('Telegram Bot Token'),
    description: i18n(
      'The API token issued by BotFather when you created your Jet Telegram bot. Leave blank to disable notifications.',
    ),
    required: false,
    default: null,
    masked: true,
  }),
})

export const setTelegramToken = sdk.Action.withInput(
  // id
  'set-telegram-token',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure Telegram Bot'),
    description: i18n(
      'Set or clear the Telegram bot token used by Lightning Jet to send notifications.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // prefill
  async ({ effects }) => {
    const current =
      (await jetConfig.read((c) => c.telegramToken).once()) ?? null
    return { telegramToken: current }
  },

  // handler
  async ({ effects, input }) => {
    const token = input.telegramToken?.trim() || undefined
    await jetConfig.merge(effects, { telegramToken: token })

    if (token) {
      return {
        version: '1',
        title: i18n('Telegram Bot Configured'),
        message: i18n(
          'Your Telegram token has been saved. Start a chat with your bot in Telegram and send /start to begin receiving notifications.',
        ),
        result: null,
      }
    }
    return {
      version: '1',
      title: i18n('Telegram Bot Disabled'),
      message: i18n(
        'The Telegram token has been cleared. Lightning Jet will no longer send Telegram notifications.',
      ),
      result: null,
    }
  },
)
