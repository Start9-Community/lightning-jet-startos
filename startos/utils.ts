import { T } from '@start9labs/start-sdk'
import { gRPCPort } from 'lnd-startos/startos/interfaces'
import { sdk } from './sdk'

export const lndMount = '/mnt/lnd' as const
export const jetConfigPath = '/app/api/config.json' as const

// Using the readonly macaroon is not sufficient
// because the rebalancer needs to invoke LND mutation RPCs.
export const adminMacaroonPath =
  `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon` as const
export const tlsCertPath = `${lndMount}/tls.cert` as const

// Loopback placeholder for the FileModel's serverAddress catch default, and the
// value main.ts pins while LND is absent or still locked (no gRPC binding yet).
// main.ts overwrites it with LND's live gRPC bridge address (see bridgeAddress)
// once that binding resolves; a dead loopback is just connection-refused, which
// launcher.js retries until the healing restart lands the real address.
export const lndRpcServer = `127.0.0.1:${gRPCPort}` as const

/**
 * Bridge address (`10.0.3.1:<assigned external port>`) of a dependency's
 * binding, as a minimal reactive value. Chain `.const()` in main: the mapped
 * string only changes when the address itself does, so main restarts exactly
 * on dependency install/uninstall/port-change and never on dependency updates.
 * Chain `.once()` in an action context. `fallbackPort` keeps the value non-null
 * while the dependency is absent — sanctioned only for tor's allocator-
 * guaranteed SOCKS 9050. Drop-in for the planned SDK
 * `sdk.host.getBridgeAddress` helper.
 */
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort: number
  },
): { const(): Promise<string>; once(): Promise<string> }
export function bridgeAddress(
  effects: T.Effects,
  opts: { packageId: string; hostId: string; internalPort: number },
): { const(): Promise<string | null>; once(): Promise<string | null> }
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort?: number
  },
) {
  const watchable = async () => {
    const osIp = await sdk.getOsIp(effects)
    return sdk.host.get(
      effects,
      { packageId: opts.packageId, hostId: opts.hostId },
      (host) => {
        const port =
          host?.bindings[opts.internalPort]?.net.assignedPort ??
          opts.fallbackPort
        return port != null ? `${osIp}:${port}` : null
      },
    )
  }
  return {
    const: async () => (await watchable()).const(),
    once: async () => (await watchable()).once(),
  }
}
