import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.7.0:2',
  releaseNotes: {
    en_US:
      'Jet now keeps its SQLite history across restarts, updates, and package backups. Before updating, save any history you need from the running older version.',
    es_ES:
      'Jet ahora conserva el historial SQLite al reiniciar, actualizar y hacer copias de seguridad. Antes de actualizar, guarda el historial que necesites de la versión anterior mientras sigue en ejecución.',
    de_DE:
      'Jet behält den SQLite-Verlauf bei Neustarts, Updates und Paketsicherungen. Sichere vor dem Update den benötigten Verlauf der noch laufenden älteren Version.',
    pl_PL:
      'Jet zachowuje historię SQLite po restarcie, aktualizacji i w kopiach zapasowych pakietu. Przed aktualizacją zapisz potrzebną historię ze starszej, nadal działającej wersji.',
    fr_FR:
      'Jet conserve son historique SQLite lors des redémarrages, des mises à jour et des sauvegardes du paquet. Avant la mise à jour, enregistrez l’historique souhaité pendant que l’ancienne version fonctionne encore.',
  },
  migrations: {},
})
