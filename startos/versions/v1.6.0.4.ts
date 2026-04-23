import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { sdk } from '../sdk'

export const v_1_6_0_4 = VersionInfo.of({
  version: '1.6.0:4',
  releaseNotes: {
    en_US:
      'Initial Lightning Jet port to StartOS 0.4.0, tracking upstream v1.6.0.',
    es_ES:
      'Portada inicial de Lightning Jet a StartOS 0.4.0, basada en la versión upstream v1.6.0.',
    de_DE:
      'Erste Portierung von Lightning Jet auf StartOS 0.4.0 auf Basis von Upstream v1.6.0.',
    pl_PL:
      'Pierwszy port Lightning Jet do StartOS 0.4.0, bazujący na wersji upstream v1.6.0.',
    fr_FR:
      'Premier portage de Lightning Jet vers StartOS 0.4.0, basé sur la version upstream v1.6.0.',
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
