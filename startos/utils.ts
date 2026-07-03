import { T } from '@start9labs/start-sdk'
import { gRPCHostId, gRPCInterfaceId } from 'lnd-startos/startos/interfaces'
import { sdk } from './sdk'

export const lndMount = '/mnt/lnd' as const
export const jetConfigPath = '/app/api/config.json' as const

// Using the readonly macaroon is not sufficient
// because the rebalancer needs to invoke LND mutation RPCs.
export const adminMacaroonPath =
  `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon` as const
export const tlsCertPath = `${lndMount}/tls.cert` as const

// Legacy fallback for the config's serverAddress. `lnd.startos` DNS no longer
// resolves under SDK 2.0 — containers reach each other over the LXC bridge, so
// main.ts overwrites this with the live bridge address (see lndGrpcHost) before
// the daemon starts. Kept only as the FileModel's catch default.
export const lndRpcServer = 'lnd.startos:10009' as const

// LND's gRPC `host:port` over the LXC bridge, read from the dependency host.
// Returns the IPv4 bridge address covered by LND's StartOS-issued cert, so Jet
// connects with the mounted tls.cert. Undefined until LND's interface resolves;
// `.const()` re-fires main.ts whenever the address changes.
export const lndGrpcHost = (effects: T.Effects) =>
  sdk.host
    .get(effects, { hostId: gRPCHostId, packageId: 'lnd' }, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === gRPCInterfaceId)
      const addr =
        iface &&
        iface.addressInfo.filter({
          kind: 'bridge',
          predicate: (h) => h.ssl && h.metadata.kind === 'ipv4',
        }).hostnames[0]
      return addr ? `${addr.hostname}:${addr.port}` : undefined
    })
    .const()
