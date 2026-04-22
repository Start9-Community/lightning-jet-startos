export const appDir = '/app' as const
export const lndMount = '/mnt/lnd' as const
export const jetConfigPath = `${appDir}/api/config.json` as const

// Path to the LND mainnet admin macaroon inside the mounted lnd volume.
// Lightning Jet requires `macaroon:read macaroon:write` permissions, which
// the admin macaroon provides. Using the readonly macaroon is not sufficient
// because the rebalancer needs to invoke LND mutation RPCs.
export const adminMacaroonPath =
  `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon` as const
export const tlsCertPath = `${lndMount}/tls.cert` as const
export const lndRpcServer = 'lnd.startos:10009' as const
