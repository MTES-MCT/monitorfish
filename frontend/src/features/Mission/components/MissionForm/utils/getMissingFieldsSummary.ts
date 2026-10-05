import type { MissionActionFormValues } from '../types'

const MISSING_FIELD_LABELS: Record<string, string> = {
  actionDatetimeUtc: 'Date et heure du contrôle',
  completedBy: 'Complété par',
  'discardedSpecies[].discardReason': 'Nature du rejet',
  'discardedSpecies[].faoZones': 'Zone de pêche des rejets',
  'discardedSpecies[].rejectedWeight': 'Qté rejetée',
  emitsAis: 'Bonne émission AIS',
  emitsVms: 'Bonne émission VMS',
  europeanFishingLicenceValid: 'Licence de pêche européenne valide',
  gangwayPresentAndCompliant: 'Echelle de coupée présente et conforme',
  gearOnboard: 'Inspection des engins',
  'gearOnboard[].declaredMesh': 'Maillage déclaré ou mesuré',
  'gearOnboard[].gearMarkingIsCompliant': "Marquage de l'engin conforme",
  'gearOnboard[].gearWasControlled': 'Engin contrôlé',
  holdControlledAfterUnloading: 'Cale contrôlée après déchargement',
  'infractions[].infractionType': 'Infraction en attente',
  isINNControl: 'Contrôle INN',
  isLastHaul: 'Last haul effectué',
  latitude: 'Lieu du contrôle',
  licencesMatchActivity: 'Autorisations de pêche (AEP, ANP, licences locales) conformes à l’activité du navire',
  logbookMatchesActivity: 'Déclarations journal de pêche conformes à l’activité du navire',
  logbookOpenedPriorToControl: 'Journal de pêche ouvert avant le contrôle',
  longitude: 'Lieu du contrôle',
  onboardWeighingPermit: 'Autorisation pour la pesée à bord',
  portEntranceAndLandingAuthorized: 'Accès au port / autorisation de débarquement conformes',
  portLocode: 'Port de contrôle',
  separateStowageOfPreservedSpecies: 'Arrimage séparé des espèces soumises à plan',
  'speciesOnboard[].faoZones': 'Zone de pêche des espèces',
  speciesQuantitySeized: 'Quantités saisies (kg)',
  speciesSizeControlled: 'Taille des espèces vérifiées',
  speciesWeightControlled: 'Poids des espèces vérifiés',
  stowagePlanPresent: 'Plan d’arrimage présent et conforme',
  underSizedSeparateRecording: "Enregistrement séparé des poissons n'ayant pas la taille requise",
  underSizedSeparateStowage: "Arrimage séparé des poissons n'ayant pas la taille requise",
  userTrigram: 'Saisi par',
  vesselId: 'Navire',
  weighingCertificateAndSystemsValid: 'Certificat de pesée présent et systèmes de pesée à bord valides',
  weighingOperationsMonitoredByInspectors: 'Suivi des opérations de pesée par les inspecteurs'
}

const ROW_PATH_REGEXP = /^(\w+)\[(\d+)\]/

type MissingFieldsSummaryValues = Partial<
  Pick<MissionActionFormValues, 'discardedSpecies' | 'gearOnboard' | 'infractions' | 'speciesOnboard'>
>

function getCodeOrFallback(code: string | undefined, fallback: string): string {
  return code !== undefined && code !== '' ? code : fallback
}

function getRowName(values: MissingFieldsSummaryValues, collection: string, index: number): string {
  switch (collection) {
    case 'speciesOnboard':
      return getCodeOrFallback(values.speciesOnboard?.[index]?.speciesCode, 'ligne sans espèce')
    case 'discardedSpecies':
      return getCodeOrFallback(values.discardedSpecies?.[index]?.speciesCode, 'ligne sans espèce')
    case 'gearOnboard':
      return getCodeOrFallback(values.gearOnboard?.[index]?.gearCode, 'ligne sans engin')
    default:
      return `n°${index + 1}`
  }
}

export function getMissingFieldsSummary(paths: string[], values: MissingFieldsSummaryValues): string[] {
  const rowNamesByLabel = new Map<string, string[]>()

  paths.forEach(path => {
    const normalizedPath = path.replace(/\[\d+\]/g, '[]')
    const label = MISSING_FIELD_LABELS[normalizedPath] ?? normalizedPath
    const rowNames = rowNamesByLabel.get(label) ?? []

    const rowMatch = ROW_PATH_REGEXP.exec(path)
    if (rowMatch) {
      const [, collection, index] = rowMatch
      rowNames.push(getRowName(values, collection as string, Number(index)))
    }

    rowNamesByLabel.set(label, rowNames)
  })

  return [...rowNamesByLabel].map(([label, rowNames]) =>
    rowNames.length > 0 ? `${label} : ${rowNames.join(', ')}` : label
  )
}
