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
    uid: feature.vesselId,
    id: feature.vesselId,
    checked: true,
    vesselName: feature.vesselName,
    course: feature.course,
    speed: feature.speed,
    length: feature.length,
    flagState: feature.flagState?.toLowerCase(),
    mmsi: feature.mmsi,
    internalReferenceNumber: feature.internalReferenceNumber,
    externalReferenceNumber: feature.externalReferenceNumber,
    ircs: feature.ircs,
    dateTimeTimestamp: feature.dateTime ? new Date(feature.dateTime).getTime() : '',
    dateTime: feature.dateTime,
    latitude: getCoordinates(feature.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0],
    longitude: getCoordinates(feature.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1],
    olCoordinates: feature.coordinates,
    gears: feature.gearOnboard ? [...new Set(feature.gearOnboard.map(gear => gear.gear))].join(', ') : '',
    gearsArray: feature.gearOnboard ? [...new Set(feature.gearOnboard.map(gear => gear.gear))] : [],
    fleetSegments: feature.segments ? feature.segments.join(', ') : '',
    fleetSegmentsArray: feature.segments ? feature.segments.map(segment => segment.replace(' ', '')) : [],
    species: feature.speciesOnboard ? [...new Set(feature.speciesOnboard.map(species => species.species))].join(', ') : '',
    speciesArray: feature.speciesOnboard ? [...new Set(feature.speciesOnboard.map(species => species.species))] : [],
    district: feature.district,
    isAtPort: feature.isAtPort,
    districtCode: feature.districtCode,
    lastControlDateTimeTimestamp: feature.lastControlDateTime ? new Date(feature.lastControlDateTime).getTime() : '',
    lastControlDateTime: feature.lastControlDateTime,
    lastControlInfraction: feature.lastControlInfraction ? 'Oui' : 'Non',
    postControlComment: feature.postControlComment,
    riskFactor: parseFloat(feature.riskFactor).toFixed(1)
  }
}
