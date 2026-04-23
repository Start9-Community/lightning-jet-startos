import { jetConfig } from '../fileModels/config.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // Ensure /api/config.json exists with defaults applied. On existing files
  // `merge({})` is a no-op (zod `.catch()` preserves every value present);
  // on fresh installs / restores from a pre-FileModel backup it materializes
  // the file so upstream launcher.js can read it.
  await jetConfig.merge(effects, {})
})
