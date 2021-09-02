// These properties are ordered for the CSV column order
import { getCoordinates } from '../../utils'
import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '../../domain/entities/map'

export const CSVOptions = {
  targetNumber: {
    code: 'targetNumber',
    name: 'Priorite'
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

export function getVesselObjectFromFeature (feature, coordinates) {
  return {
    targetNumber: '',
    uid: feature.ol_uid,
    id: feature.id_,
    checked: true,
    vesselName: feature.vessel.vesselName,
    course: feature.vessel.course,
    speed: feature.vessel.speed,
    length: feature.vessel.length,
    flagState: feature.vessel.flagState.toLowerCase(),
    mmsi: feature.vessel.mmsi,
    internalReferenceNumber: feature.vessel.internalReferenceNumber,
    externalReferenceNumber: feature.vessel.externalReferenceNumber,
    ircs: feature.vessel.ircs,
    dateTimeTimestamp: new Date(feature.vessel.dateTime).getTime(),
    dateTime: feature.vessel.dateTime,
    latitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS)[0],
    longitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS)[1],
    olCoordinates: coordinates,
    gears: feature.vessel.gearOnboard ? [...new Set(feature.vessel.gearOnboard.map(gear => gear.gear))].join(', ') : '',
    gearsArray: feature.vessel.gearOnboard ? [...new Set(feature.vessel.gearOnboard.map(gear => gear.gear))] : [],
    fleetSegments: feature.vessel.segments ? feature.vessel.segments.join(', ') : '',
    fleetSegmentsArray: feature.vessel.segments ? feature.vessel.segments.map(segment => segment.replace(' ', '')) : [],
    species: feature.vessel.speciesOnboard ? [...new Set(feature.vessel.speciesOnboard.map(species => species.species))].join(', ') : '',
    speciesArray: feature.vessel.speciesOnboard ? [...new Set(feature.vessel.speciesOnboard.map(species => species.species))] : [],
    district: feature.vessel.district,
    districtCode: feature.vessel.districtCode,
    lastControlDateTimeTimestamp: feature.vessel.lastControlDateTime ? new Date(feature.vessel.lastControlDateTime).getTime() : '',
    lastControlDateTime: feature.vessel.lastControlDateTime,
    lastControlInfraction: feature.vessel.lastControlInfraction ? 'Oui' : 'Non',
    postControlComment: feature.vessel.postControlComment
  }
}
