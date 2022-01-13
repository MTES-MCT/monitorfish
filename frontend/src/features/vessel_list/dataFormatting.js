// These properties are ordered for the CSV column order
import { getCoordinates } from '../../coordinates'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map'

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
    code: 'fleetSegments',
    name: 'Seg. flotte'
  },
  gears: {
    code: 'gears',
    name: 'Engins à bord'
  },
  species: {
    code: 'species',
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

export function getVesselObjectFromFeature (feature, coordinatesFormat) {
  return {
    // from feature.
    id: feature.vesselId,
    course: feature.course,
    speed: feature.speed,
    lastPositionSentAt: feature.lastPositionSentAt || '',
    coordinates: feature.coordinates,
    isAtPort: feature.isAtPort,
    // from feature.vesselProperties.
    checked: true,
    vesselName: feature.vesselProperties.vesselName,
    length: feature.vesselProperties.length,
    flagState: feature.vesselProperties.flagState?.toLowerCase(),
    mmsi: feature.vesselProperties.mmsi,
    internalReferenceNumber: feature.vesselProperties.internalReferenceNumber,
    externalReferenceNumber: feature.vesselProperties.externalReferenceNumber,
    ircs: feature.vesselProperties.ircs,
    dateTime: feature.vesselProperties.dateTime,
    latitude: getCoordinates(feature.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0],
    longitude: getCoordinates(feature.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1],
    gears: feature.vesselProperties.gearOnboard ? [...new Set(feature.vesselProperties.gearOnboard.map(gear => gear.gear))].join(', ') : '',
    gearsArray: feature.vesselProperties.gearOnboard ? [...new Set(feature.vesselProperties.gearOnboard.map(gear => gear.gear))] : [],
    fleetSegments: feature.vesselProperties.segments ? feature.vesselProperties.segments.join(', ') : '',
    fleetSegmentsArray: feature.vesselProperties.segments ? feature.vesselProperties.segments.map(segment => segment.replace(' ', '')) : [],
    species: feature.vesselProperties.speciesOnboard ? [...new Set(feature.vesselProperties.speciesOnboard.map(species => species.species))].join(', ') : '',
    speciesArray: feature.vesselProperties.speciesOnboard ? [...new Set(feature.vesselProperties.speciesOnboard.map(species => species.species))] : [],
    district: feature.vesselProperties.district,
    districtCode: feature.vesselProperties.districtCode,
    lastControlDateTimeTimestamp: feature.vesselProperties.lastControlDateTime ? new Date(feature.vesselProperties.lastControlDateTime).getTime() : '',
    lastControlDateTime: feature.vesselProperties.lastControlDateTime,
    lastControlInfraction: feature.vesselProperties.lastControlInfraction ? 'Oui' : 'Non',
    postControlComment: feature.vesselProperties.postControlComment,
    riskFactor: parseFloat(feature.vesselProperties.riskFactor).toFixed(1)
  }
}
