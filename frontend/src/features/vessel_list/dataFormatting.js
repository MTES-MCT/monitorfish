// These properties are ordered for the CSV column order

export const CSVOptions = {
  riskFactor: {
    code: 'riskFactor',
    name: 'Note de risque'
  },
  district: {
    code: 'district',
    name: 'Quartier'
  },
  internalReferenceNumber: {
    code: 'internalReferenceNumber',
    name: 'CFR'
  },
  ircs: {
    code: 'ircs',
    name: 'C/S'
  },
  vesselName: {
    code: 'vesselName',
    name: 'Nom'
  },
  externalReferenceNumber: {
    code: 'externalReferenceNumber',
    name: 'Marq. Ext.'
  },
  dateTime: {
    code: 'dateTime',
    name: 'GDH (UTC)'
  },
  mmsi: {
    code: 'mmsi',
    name: 'MMSI'
  },
  fleetSegments: {
    code: 'fleetSegmentsArray',
    name: 'Seg. flotte'
  },
  gears: {
    code: 'gearsArray',
    name: 'Engins à bord'
  },
  species: {
    code: 'speciesArray',
    name: 'Espèces à bord'
  },
  length: {
    code: 'length',
    name: 'Longueur'
  },
  flagState: {
    code: 'flagState',
    name: 'Pavillon'
  },
  latitude: {
    code: 'latitude',
    name: 'Latitude'
  },
  longitude: {
    code: 'longitude',
    name: 'Longitude'
  },
  course: {
    code: 'course',
    name: 'Cap'
  },
  speed: {
    code: 'speed',
    name: 'Vitesse'
  },
  lastControlDateTime: {
    code: 'lastControlDateTime',
    name: 'Dernier contrôle'
  },
  lastControlInfraction: {
    code: 'lastControlInfraction',
    name: 'Infraction'
  },
  postControlComment: {
    code: 'postControlComment',
    name: 'Observations'
  }
}

export const lastPositionTimeAgoLabels = [
  {
    label: '1 heure',
    value: 1
  },
  {
    label: '2 heures',
    value: 2
  },
  {
    label: '3 heures',
    value: 3
  },
  {
    label: '4 heures',
    value: 4
  },
  {
    label: '5 heures',
    value: 5
  },
  {
    label: '6 heures',
    value: 6
  },
  {
    label: '12 heures',
    value: 12
  },
  {
    label: '24 heures',
    value: 24
  }
]

export const lastControlAfterLabels = [
  {
    label: '1 mois',
    value: 1
  },
  {
    label: '2 mois',
    value: 2
  },
  {
    label: '3 mois',
    value: 3
  },
  {
    label: '4 mois',
    value: 4
  },
  {
    label: '5 mois',
    value: 5
  },
  {
    label: '6 mois',
    value: 6
  },
  {
    label: '12 mois',
    value: 12
  },
  {
    label: '24 mois',
    value: 24
  }
]
