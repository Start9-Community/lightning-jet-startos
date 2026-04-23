import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { adminMacaroonPath, lndRpcServer, tlsCertPath } from '../utils'

// Defaults mirror lightning-jet/api/config.json upstream, with minCapacity
// overridden to the StartOS 0.3.x value (50_000) for continuity.
const rebalancerShape = z.object({
  maxTime: z.number().catch(30),
  maxPpm: z.number().catch(650),
  maxAutoPpm: z.number().catch(500),
  maxInstances: z.number().catch(10),
  maxPendingHtlcs: z.number().catch(4),
  enforceMaxPpm: z.boolean().catch(false),
  enforceProfitability: z.boolean().catch(false),
  minCapacity: z.number().catch(50_000),
  buffer: z.number().catch(250),
  disabled: z.boolean().catch(false),
  exclude: z.array(z.string()).catch([]),
})

const logShape = z.object({
  level: z.string().catch('info'),
})

const dbShape = z.object({
  maxRebalanceHistoryDepth: z.string().catch('180'),
  maxChannelEventsDepth: z.string().catch('180'),
})

const shape = z.object({
  // Locked to the StartOS LND mount paths
  macaroonPath: z.literal(adminMacaroonPath).catch(adminMacaroonPath),
  tlsCertPath: z.literal(tlsCertPath).catch(tlsCertPath),
  serverAddress: z.literal(lndRpcServer).catch(lndRpcServer),

  // User-configurable
  telegramToken: z.string().optional().catch(undefined),
  avoid: z.array(z.string()).catch([]),

  // Structured sub-config
  log: logShape.catch(() => logShape.parse({})),
  db: dbShape.catch(() => dbShape.parse({})),
  rebalancer: rebalancerShape.catch(() => rebalancerShape.parse({})),
})

export const jetConfig = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/api/config.json' },
  shape,
)
