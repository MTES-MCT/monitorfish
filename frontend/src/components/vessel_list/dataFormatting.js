// These properties are ordered for the CSV column order
import { getCoordinates } from '../../utils'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map'

export const CSVOptions = {
  targetNumber: {
    code: 'targetNumber',
    name: 'Priorite'
  },
  vesselName: {
    code: 'vesselName',
    name: 'Nom'
  },
  externalReferenceNumber: {
    code: 'externalReferenceNumber',
    name: 'Marq. Ext.'
  },
  ircs: {
    code: 'ircs',
    name: 'C/S'
  },
  mmsi: {
    code: 'mmsi',
    name: 'MMSI'
  },
  internalReferenceNumber: {
    code: 'internalReferenceNumber',
    name: 'CFR'
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
  district: {
    code: 'district',
    name: 'Quartier'
  },
  dateTime: {
    code: 'dateTime',
    name: 'GDH (UTC)'
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

export function getVesselTableObjects (vessel, coordinates) {
  return {
    targetNumber: '',
    id: vessel.id_,
    checked: true,
    vesselName: vessel.getProperties().vesselName,
    course: vessel.getProperties().course,
    speed: vessel.getProperties().speed,
    length: vessel.getProperties().length,
    flagState: vessel.getProperties().flagState.toLowerCase(),
    mmsi: vessel.getProperties().mmsi,
    internalReferenceNumber: vessel.getProperties().internalReferenceNumber,
    externalReferenceNumber: vessel.getProperties().externalReferenceNumber,
    ircs: vessel.getProperties().ircs,
    dateTimeTimestamp: new Date(vessel.getProperties().dateTime).getTime(),
    dateTime: vessel.getProperties().dateTime,
    latitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[0],
    longitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[1],
    olCoordinates: coordinates,
    gears: vessel.getProperties().gearOnboard ? vessel.getProperties().gearOnboard.map(gear => gear.gear).join(', ') : '',
    gearsArray: vessel.getProperties().gearOnboard ? vessel.getProperties().gearOnboard.map(gear => gear.gear) : [],
    fleetSegments: vessel.getProperties().segments ? vessel.getProperties().segments.join(', ') : '',
    fleetSegmentsArray: vessel.getProperties().segments ? vessel.getProperties().segments.map(segment => segment.replace(' ', '')) : [],
    species: vessel.getProperties().speciesOnboard ? vessel.getProperties().speciesOnboard.map(species => species.species).join(', ') : '',
    speciesArray: vessel.getProperties().speciesOnboard ? vessel.getProperties().speciesOnboard.map(species => species.species) : [],
    district: vessel.getProperties().district,
    districtCode: vessel.getProperties().districtCode
  }
}
