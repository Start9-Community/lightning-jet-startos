import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { sdk } from '../sdk'

export const v_1_6_0_6 = VersionInfo.of({
  version: '1.6.0:6',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.5.2).',
    es_ES: 'Actualizaciones internas (start-sdk 1.5.2).',
    de_DE: 'Interne Aktualisierungen (start-sdk 1.5.2).',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 1.5.2).',
    fr_FR: 'Mises à jour internes (start-sdk 1.5.2).',
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
