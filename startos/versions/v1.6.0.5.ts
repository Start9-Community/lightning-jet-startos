import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { sdk } from '../sdk'

export const v_1_6_0_5 = VersionInfo.of({
  version: '1.6.0:5',
  releaseNotes: {
    en_US: `- Adds an in-app Instructions tab
- Internal updates (start-sdk 1.5.1)`,
    es_ES: `- Añade una pestaña de Instrucciones en la app
- Actualizaciones internas (start-sdk 1.5.1)`,
    de_DE: `- Fügt eine In-App-Anleitungs-Registerkarte hinzu
- Interne Aktualisierungen (start-sdk 1.5.1)`,
    pl_PL: `- Dodaje zakładkę Instrukcje w aplikacji
- Aktualizacje wewnętrzne (start-sdk 1.5.1)`,
    fr_FR: `- Ajoute un onglet Instructions dans l'application
- Mises à jour internes (start-sdk 1.5.1)`,
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
