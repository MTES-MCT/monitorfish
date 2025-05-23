import { ExportToCsv } from 'export-to-csv'

export const exportToCsv = new ExportToCsv({
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false
})
