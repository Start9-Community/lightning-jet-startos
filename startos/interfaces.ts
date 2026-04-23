import { sdk } from './sdk'

// Lightning Jet is a CLI-only tool. It exposes no network interfaces to the user.
export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  return []
})
