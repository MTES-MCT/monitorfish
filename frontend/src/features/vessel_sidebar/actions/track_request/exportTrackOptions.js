import { ExportToCsv } from 'export-to-csv'

const optionsCSV = {
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false,
}

export const csvExporter = new ExportToCsv(optionsCSV)

// These properties are ordered for the CSV column order
export const csvOrder = {
  dateTime: {
    code: 'dateTime',
    name: 'GDH (UTC)',
  },
  course: {
    code: 'course',
    name: 'Cap',
  },
  externalReferenceNumber: {
    code: 'externalReferenceNumber',
    name: 'Marq. Ext.',
  },
  flagState: {
    code: 'flagState',
    name: 'Pavillon',
  },
  internalReferenceNumber: {
    code: 'internalReferenceNumber',
    name: 'CFR',
  },
  ircs: {
    code: 'ircs',
    name: 'C/S',
  },
  latitude: {
    code: 'latitude',
    name: 'Latitude',
  },
  longitude: {
    code: 'longitude',
    name: 'Longitude',
  },
  mmsi: {
    code: 'mmsi',
    name: 'MMSI',
  },
  speed: {
    code: 'speed',
    name: 'Vitesse',
  },
  vesselName: {
    code: 'vesselName',
    name: 'Nom'
  },
}
