import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'lightning-jet',
  title: 'Lightning Jet',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/lightning-jet-startos',
  upstreamRepo: 'https://github.com/itsneski/lightning-jet',
  marketingUrl: 'https://github.com/itsneski',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
