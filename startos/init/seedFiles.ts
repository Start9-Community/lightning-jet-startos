import { jetConfig } from '../fileModels/config.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  // Create /api/config.json on the main volume with all defaults applied.
  // `merge(effects, {})` writes a fresh file where every zod `.catch()`
  // fills in a default value.
  await jetConfig.merge(effects, {})
})
