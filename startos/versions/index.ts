import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_1_6_0_7 } from './v1.6.0_7'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_1_6_0_7],
})
