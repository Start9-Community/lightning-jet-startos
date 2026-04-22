import { i18n } from './i18n'
import { sdk } from './sdk'
import { jetConfigPath, lndMount } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Lightning Jet...'))

  const mounts = sdk.Mounts.of()
    // Mount api/config.json from the main volume at its position inside /app.
    // This file is the FileModel managed by Actions, so Actions and main.ts
    // stay in sync and the upstream entrypoint reads its config unchanged.
    //
    // NOTE: We only bind-mount this single file (not the whole /app or /app/db
    // tree) because /app is populated by the Dockerfile (npm install) and
    // mounting a volume over it would hide the image's node_modules and JS.
    // Jet's sqlite files inside /app/db are therefore ephemeral across
    // restarts — matching the 0.3.x behavior, where the main volume was
    // mounted at /root (not /app) and the db was never persisted.
    .mountVolume({
      volumeId: 'main',
      subpath: '/api/config.json',
      mountpoint: jetConfigPath,
      readonly: false,
      type: 'file',
    })
    // LND volume (certs + macaroons). Mounted readonly; Lightning Jet only
    // reads the admin macaroon and tls.cert.
    .mountDependency({
      dependencyId: 'lnd',
      volumeId: 'main',
      subpath: null,
      mountpoint: lndMount,
      readonly: true,
    })

  const jetSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    mounts,
    'lightning-jet-sub',
  )

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: jetSub,
    // Run the "daddy" watchdog (launcher.js) directly in the foreground.
    // `jet start daddy` spawns it detached and exits, which would make the
    // primary daemon exit on every start. The watchdog itself spawns the
    // rebalancer, htlc-logger, worker, and telegram sub-services.
    exec: {
      command: ['node', '/app/service/launcher.js'],
    },
    ready: {
      display: i18n('Jet Daemon'),
      fn: async () => {
        const res = await jetSub.exec(['pgrep', '-f', 'service/launcher.js'])
        if (res.exitCode === 0) {
          return {
            result: 'success',
            message: i18n('The Lightning Jet daemon is running'),
          }
        }
        return {
          result: 'loading',
          message: i18n('The Lightning Jet daemon is not running'),
        }
      },
    },
    requires: [],
  })
})
