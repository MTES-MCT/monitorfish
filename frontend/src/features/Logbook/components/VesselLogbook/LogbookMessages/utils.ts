import { Logbook } from '@features/Logbook/Logbook.types'
import { type Option } from '@mtes-mct/monitor-ui'
import { ExportToCsv } from 'export-to-csv'

import { DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS, DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS, LogbookSortKey } from './constants'
import { getDate } from '../../../../../utils'
import { formatAsCSVColumns } from '../../../../../utils/formatAsCSVColumns'

export const downloadMessages = (logbookMessages: Logbook.Message[], tripNumber: string | null) => {
  const csvExporter = new ExportToCsv(DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS)

  const objectsToExports = logbookMessages.map(position =>
    formatAsCSVColumns(position, DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS)
  )

  const date = new Date()
  csvExporter.options.filename = `export_ers_${tripNumber}_${getDate(date.toISOString())}`
  csvExporter.generateCsv(objectsToExports)
}

export const filterBySelectedType = (logbookMessage: Logbook.Message, selectedMessagesType: string | undefined) => {
  if (selectedMessagesType) {
    return logbookMessage.messageType === selectedMessagesType
  }

  return true
}

export function isPnoMessage(logbookMessage: Logbook.Message): logbookMessage is Logbook.PnoMessage {
  return logbookMessage.messageType === Logbook.MessageType.PNO
}

export function getLogbookSortKeyOptions(): Option[] {
  return Object.keys(LogbookSortKey).map(key => ({
    label: LogbookSortKey[key],
    value: key
  }))
}
