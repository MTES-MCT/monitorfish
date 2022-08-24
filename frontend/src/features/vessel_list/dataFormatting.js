// These properties are ordered for the CSV column order

export const CSVOptions = {
  dateTime: {
    code: 'dateTime',
    name: 'GDH (UTC)',
  },
  district: {
    code: 'district',
    name: 'Quartier',
  },
  externalReferenceNumber: {
    code: 'externalReferenceNumber',
    name: 'Marq. Ext.',
  },
  fleetSegments: {
    code: 'fleetSegmentsArray',
    name: 'Seg. flotte',
  },
  gears: {
    code: 'gearsArray',
    name: 'Engins à bord',
  },
  flagState: {
    code: 'flagState',
    name: 'Pavillon',
  },
  internalReferenceNumber: {
    code: 'internalReferenceNumber',
    name: 'CFR',
  },
  course: {
    code: 'course',
    name: 'Cap',
  },
  ircs: {
    code: 'ircs',
    name: 'C/S',
  },
  lastControlDateTime: {
    code: 'lastControlDateTime',
    name: 'Dernier contrôle',
  },
  riskFactor: {
    code: 'riskFactor',
    name: 'Note de risque'
  },
  lastControlInfraction: {
    code: 'lastControlInfraction',
    name: 'Infraction',
  },
  length: {
    code: 'length',
    name: 'Longueur',
  },
  latitude: {
    code: 'latitude',
    name: 'Latitude',
  },
  vesselName: {
    code: 'vesselName',
    name: 'Nom'
  },
  longitude: {
    code: 'longitude',
    name: 'Longitude',
  },
  mmsi: {
    code: 'mmsi',
    name: 'MMSI',
  },
  postControlComment: {
    code: 'postControlComment',
    name: 'Observations',
  },
  species: {
    code: 'speciesArray',
    name: 'Espèces à bord',
  },
  speed: {
    code: 'speed',
    name: 'Vitesse',
  },
}

export const lastPositionTimeAgoLabels = [
  {
    label: '1 heure',
    value: 1,
  },
  {
    label: '2 heures',
    value: 2,
  },
  {
    label: '3 heures',
    value: 3,
  },
  {
    label: '4 heures',
    value: 4,
  },
  {
    label: '5 heures',
    value: 5,
  },
  {
    label: '6 heures',
    value: 6,
  },
  {
    label: '12 heures',
    value: 12,
  },
  {
    label: '24 heures',
    value: 24,
  },
]

export const lastControlAfterLabels = [
  {
    label: '1 mois',
    value: 1,
  },
  {
    label: '2 mois',
    value: 2,
  },
  {
    label: '3 mois',
    value: 3,
  },
  {
    label: '4 mois',
    value: 4,
  },
  {
    label: '5 mois',
    value: 5,
  },
  {
    label: '6 mois',
    value: 6,
  },
  {
    label: '12 mois',
    value: 12,
  },
  {
    label: '24 mois',
    value: 24,
  },
]
