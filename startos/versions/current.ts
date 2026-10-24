import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.7.0:0',
  releaseNotes: {
    en_US: `Updated Lightning Jet to 1.7.0. Stops trusting certificates from a compromised certificate authority (eMudhra). Automated rebalances now spend at most 100,000 sats in fees per 24 hours; set \`maxDailyFee\` in the rebalancer configuration to change the cap, or \`0\` to remove it.`,
    es_ES: `Lightning Jet actualizado a 1.7.0. Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra). Los reequilibrios automáticos ahora gastan como máximo 100.000 sats en comisiones cada 24 horas; ajusta \`maxDailyFee\` en la configuración del reequilibrador para cambiar el límite, o \`0\` para quitarlo.`,
    de_DE: `Lightning Jet auf 1.7.0 aktualisiert. Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr. Automatische Rebalancings geben jetzt höchstens 100.000 Sats an Gebühren pro 24 Stunden aus; setze \`maxDailyFee\` in der Rebalancer-Konfiguration, um die Grenze zu ändern, oder \`0\`, um sie aufzuheben.`,
    pl_PL: `Zaktualizowano Lightning Jet do 1.7.0. Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra). Automatyczne rebalansowanie wydaje teraz na opłaty najwyżej 100 000 satów na 24 godziny; ustaw \`maxDailyFee\` w konfiguracji rebalancera, aby zmienić limit, lub \`0\`, aby go usunąć.`,
    fr_FR: `Lightning Jet mis à jour vers 1.7.0. Ne fait plus confiance aux certificats d'une autorité de certification compromise (eMudhra). Les rééquilibrages automatiques dépensent désormais au plus 100 000 sats de frais par 24 heures ; définissez \`maxDailyFee\` dans la configuration du rééquilibreur pour modifier ce plafond, ou \`0\` pour le supprimer.`,
  },
  migrations: {},
})
