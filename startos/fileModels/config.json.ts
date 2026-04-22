import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import {
  adminMacaroonPath,
  lndRpcServer,
  tlsCertPath,
} from '../utils'

// Defaults for the rebalancer sub-object. Upstream defaults live in
// lightning-jet/api/config.json; these mirror them while enforcing the
// StartOS-specific `minCapacity` that the legacy 0.3 entrypoint set.
const rebalancerDefault = {
  maxTime: 30,
  maxPpm: 650,
  maxAutoPpm: 500,
  maxInstances: 10,
  maxPendingHtlcs: 4,
  enforceMaxPpm: false,
  enforceProfitability: false,
  minCapacity: 50_000,
  buffer: 250,
  disabled: false,
  exclude: [] as string[],
}

const rebalancerShape = z.object({
  maxTime: z.number().catch(rebalancerDefault.maxTime),
  maxPpm: z.number().catch(rebalancerDefault.maxPpm),
  maxAutoPpm: z.number().catch(rebalancerDefault.maxAutoPpm),
  maxInstances: z.number().catch(rebalancerDefault.maxInstances),
  maxPendingHtlcs: z.number().catch(rebalancerDefault.maxPendingHtlcs),
  enforceMaxPpm: z.boolean().catch(rebalancerDefault.enforceMaxPpm),
  enforceProfitability: z
    .boolean()
    .catch(rebalancerDefault.enforceProfitability),
  minCapacity: z.number().catch(rebalancerDefault.minCapacity),
  buffer: z.number().catch(rebalancerDefault.buffer),
  disabled: z.boolean().catch(rebalancerDefault.disabled),
  exclude: z.array(z.string()).catch([]),
})

const logDefault = { level: 'info' }
const logShape = z.object({
  level: z.string().catch(logDefault.level),
})

const dbDefault = {
  maxRebalanceHistoryDepth: '180',
  maxChannelEventsDepth: '180',
}
const dbShape = z.object({
  maxRebalanceHistoryDepth: z.string().catch(dbDefault.maxRebalanceHistoryDepth),
  maxChannelEventsDepth: z.string().catch(dbDefault.maxChannelEventsDepth),
})

const shape = z.object({
  // Locked to the StartOS LND mount paths
  macaroonPath: z.literal(adminMacaroonPath).catch(adminMacaroonPath),
  tlsCertPath: z.literal(tlsCertPath).catch(tlsCertPath),
  serverAddress: z.literal(lndRpcServer).catch(lndRpcServer),

  // User-configurable
  debugMode: z.boolean().catch(false),
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
