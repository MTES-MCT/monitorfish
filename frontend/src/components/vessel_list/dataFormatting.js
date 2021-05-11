// These properties are ordered for the CSV column order
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
  flagState: {
    code: 'flagState',
    name: 'Pavillon'
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

export const getLastPositionTimeAgoLabels = () => {
  return [
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
}
