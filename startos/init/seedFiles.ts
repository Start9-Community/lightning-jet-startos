import { mkdir, open } from 'fs/promises'
import { jetConfig } from '../fileModels/config.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // Materializes /api/config.json on fresh installs and restores, and
  // re-pins the LND credential paths on existing ones.
  await jetConfig.merge(effects, {})
  await mkdir(sdk.volumes.main.subpath('db'), { recursive: true })
  // Give SQLite a real symlink target on first open. Append preserves restored databases.
  const db = await open(sdk.volumes.main.subpath('db/jet.db'), 'a', 0o600)
  await db.close()
})
