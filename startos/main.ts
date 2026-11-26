import { gRPCHostId, gRPCPort } from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { jetConfig } from './fileModels/config.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { jetConfigPath, lndMount } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Lightning Jet...'))

  // LND's gRPC endpoint over the LXC bridge, pinned into Jet's config so
  // launcher.js dials the right address. This `.const()` restarts main only
  // when the address itself changes. While LND is absent or still locked (no
  // gRPC binding) it resolves to null and we leave serverAddress unwritten —
  // Jet crash-loops into a red health check until the binding appears, at which
  // point one healing restart lands the real address, staying put across LND
  // lock/unlock cycles thereafter.
  const serverAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'lnd',
      hostId: gRPCHostId,
      internalPort: gRPCPort,
    })
    .const()
  if (serverAddress) await jetConfig.merge(effects, { serverAddress })

  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: '/api/config.json',
      mountpoint: jetConfigPath,
      readonly: false,
      type: 'file',
    })
    .mountVolume({
      volumeId: 'main',
      subpath: '/db',
      mountpoint: '/var/lib/lightning-jet',
      readonly: false,
    })
    // LND's admin tier: admin.macaroon and tls.cert only.
    .mountDependency<typeof lndManifest>({
      dependencyId: 'lnd',
      volumeId: 'public',
      subpath: 'admin',
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
  // Active rebalance registrations expire with the service processes.
  const daemons = sdk.Daemons.of(effects).addOneshot('clear-stale-rebalances', {
    subcontainer: jetSub,
    exec: {
      command: [
        'node',
        '-e',
        `const db = require('/app/db/utils');
for (const { pid } of db.listActiveRebalancesSync()) {
  db.deleteActiveRebalanceSync(pid);
}
if (db.listActiveRebalancesSync().length) {
  throw new Error('Failed to clear stale rebalance registrations');
}`,
      ],
    },
    requires: [],
  })

  return daemons.addDaemon('primary', {
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
    requires: ['clear-stale-rebalances'],
  })
})
