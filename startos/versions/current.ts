import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.0:12',
  releaseNotes: {
    en_US: `Fixes the broken link to the SSH guide.

Lightning Jet has no web interface — you drive it from a shell on your server, so the very first thing the instructions tell you is to set up an SSH key. The link they gave for that pointed at an address that no longer serves the guide. It now points at the current one.`,
    es_ES: `Corrige el enlace roto a la guía de SSH.

Lightning Jet no tiene interfaz web: se maneja desde una terminal en tu servidor, así que lo primero que te indican las instrucciones es configurar una clave SSH. El enlace que daban para ello apuntaba a una dirección que ya no sirve esa guía. Ahora apunta a la actual.`,
    de_DE: `Behebt den defekten Link zur SSH-Anleitung.

Lightning Jet hat keine Weboberfläche — du bedienst es über eine Shell auf deinem Server, weshalb die Anleitung als Allererstes zum Einrichten eines SSH-Schlüssels auffordert. Der dafür angegebene Link zeigte auf eine Adresse, unter der die Anleitung nicht mehr liegt. Jetzt verweist er auf die aktuelle.`,
    pl_PL: `Naprawia zepsuty link do przewodnika po SSH.

Lightning Jet nie ma interfejsu webowego — obsługujesz go z powłoki na swoim serwerze, dlatego instrukcje na samym początku każą skonfigurować klucz SSH. Podany do tego link prowadził pod adres, pod którym tego przewodnika już nie ma. Teraz wskazuje na aktualny.`,
    fr_FR: `Corrige le lien cassé vers le guide SSH.

Lightning Jet n'a pas d'interface web : vous le pilotez depuis un shell sur votre serveur, si bien que la toute première chose que les instructions demandent est de configurer une clé SSH. Le lien fourni pour cela pointait vers une adresse qui n'héberge plus ce guide. Il pointe désormais vers la bonne.`,
  },
  migrations: {},
})
