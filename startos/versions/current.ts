import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.6.0:7',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 2.0.x)',
    es_ES: 'Actualizaciones internas (start-sdk 2.0.x)',
    de_DE: 'Interne Aktualisierungen (start-sdk 2.0.x)',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 2.0.x)',
    fr_FR: 'Mises à jour internes (start-sdk 2.0.x)',
  },
  migrations: {
    up: async ({ effects }) => {
      // Clean up legacy StartOS 0.3.x state directory if present on the
      // main volume. Safe to run on fresh installs (directory will be
      // missing).
      await rm(sdk.volumes.main.subpath('start9'), {
        recursive: true,
      }).catch(() => {})
    },
    down: IMPOSSIBLE,
  },
})
