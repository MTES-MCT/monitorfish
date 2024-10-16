import { Logbook } from '@features/Logbook/Logbook.types'
import { type Option } from '@mtes-mct/monitor-ui'
import { ExportToCsv } from 'export-to-csv'

import { DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS, DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS } from './constants'
import { getDate } from '../../../../../utils'
import { formatAsCSVColumns } from '../../../../../utils/formatAsCSVColumns'

import type { LogbookMessage } from '@features/Logbook/LegacyLogbook.types'

export const downloadMessages = (logbookMessages: LogbookMessage[], tripNumber: string | null) => {
  const csvExporter = new ExportToCsv(DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS)

  const objectsToExports = logbookMessages.map(position =>
    formatAsCSVColumns(position, DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS)
  )

  const date = new Date()
  csvExporter.options.filename = `export_ers_${tripNumber}_${getDate(date.toISOString())}`
  csvExporter.generateCsv(objectsToExports)
}

export const filterBySelectedType = (logbookMessage: LogbookMessage, selectedMessagesTypes?: Option[]) => {
  if (selectedMessagesTypes?.length) {
    return selectedMessagesTypes.some(messageType => logbookMessage.messageType === messageType.value)
  }

  return true
}

export function isPnoMessage(logbookMessage: LogbookMessage | Logbook.Message): logbookMessage is Logbook.PnoMessage {
  return logbookMessage.messageType === Logbook.MessageType.PNO
}
