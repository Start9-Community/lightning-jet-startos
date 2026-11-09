import { jetConfig } from '../fileModels/config.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // Materializes /api/config.json on fresh installs and restores, and
  // re-pins the LND credential paths on existing ones.
  await jetConfig.merge(effects, {})
})
