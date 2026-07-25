export const lndMount = '/mnt/lnd' as const
export const jetConfigPath = '/app/api/config.json' as const

// Using the readonly macaroon is not sufficient
// because the rebalancer needs to invoke LND mutation RPCs.
export const adminMacaroonPath =
  `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon` as const
export const tlsCertPath = `${lndMount}/tls.cert` as const
