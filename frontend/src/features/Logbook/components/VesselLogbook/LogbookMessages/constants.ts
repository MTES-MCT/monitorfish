export const DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS = {
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false
}

export const DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS = {
  dateTime: {
    code: 'operationDateTime',
    name: 'Date'
  },
  messageType: {
    code: 'messageType',
    name: 'Type'
  },
  rawMessage: {
    code: 'rawMessage',
    name: 'Message'
  },
  tripNumber: {
    code: 'tripNumber',
    name: 'Marée n°'
  }
}

export enum WeightType {
  LIVE = 'vif',
  NET = 'net'
}
