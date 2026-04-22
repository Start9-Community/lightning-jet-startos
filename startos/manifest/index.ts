import { setupManifest } from '@start9labs/start-sdk'
import { alertInstall, depLndDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'lightning-jet',
  title: 'Lightning Jet',
  license: 'MIT',
  packageRepo: 'https://github.com/islandbitcoin/lightning-jet-startos',
  upstreamRepo: 'https://github.com/itsneski/lightning-jet',
  marketingUrl: 'https://github.com/itsneski',
  donationUrl: 'https://t.me/lnjet',
  docsUrls: ['https://github.com/itsneski/lightning-jet#readme'],
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: alertInstall,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    lnd: {
      description: depLndDescription,
      optional: false,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
