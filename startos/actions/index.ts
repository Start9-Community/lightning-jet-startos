import { sdk } from '../sdk'
import { setTelegramToken } from './setTelegramToken'

export const actions = sdk.Actions.of().addAction(setTelegramToken)
