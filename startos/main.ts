import { gRPCHostId, gRPCPort } from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { jetConfig } from './fileModels/config.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { bridgeAddress, jetConfigPath, lndMount, lndRpcServer } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Lightning Jet...'))

  // LND's gRPC endpoint over the LXC bridge, pinned into Jet's config so
  // launcher.js dials the right address. This `.const()` restarts main only
  // when the address itself changes: null (LND absent or still locked, no gRPC
  // binding) resolves to a loopback placeholder launcher.js harmlessly retries,
  // then one healing restart lands the real address once LND unlocks — and it
  // stays put across LND lock/unlock cycles thereafter.
  const serverAddress =
    (await bridgeAddress(effects, {
      packageId: 'lnd',
      hostId: gRPCHostId,
      internalPort: gRPCPort,
    }).const()) ?? lndRpcServer
  await jetConfig.merge(effects, { serverAddress })

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
    .mountDependency<typeof lndManifest>({
      dependencyId: 'lnd',
      volumeId: 'main',
      subpath: null,
      mountpoint: lndMount,
      readonly: true,
    })

  const jetSub = sdk.SubContainer.of(
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
      // Checks only the watchdog. That's deliberate: launcher.js is responsible
      // for respawning the rebalancer / htlc-logger / worker / telegram children,
      // so as long as the watchdog is alive the daemon is considered healthy.
      // Per-child failures are upstream's to recover, not ours to mask.
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
