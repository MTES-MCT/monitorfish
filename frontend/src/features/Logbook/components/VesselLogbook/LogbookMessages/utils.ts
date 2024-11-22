import { Logbook } from '@features/Logbook/Logbook.types'
import { getOptionsFromLabelledEnum, type Option } from '@mtes-mct/monitor-ui'
import { ExportToCsv } from 'export-to-csv'

import { DOWNLOAD_LOGBOOK_MESSAGES_COLUMNS, DOWNLOAD_LOGBOOK_MESSAGES_OPTIONS, LogbookSortKeyLabel } from './constants'
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

export const LOGBOOK_SORT_LABELS_AS_OPTIONS = getOptionsFromLabelledEnum(LogbookSortKeyLabel)

export function getLastLogbookTripsOptions(
  lastLogbookTrips: string[] | undefined,
  currentTripNumber: string | null
): Option[] {
  if (!currentTripNumber) {
    return []
  }

  const logbookTrips = lastLogbookTrips?.includes(currentTripNumber)
    ? lastLogbookTrips
    : [...(lastLogbookTrips ?? []), currentTripNumber]

  return logbookTrips.map(trip => ({
    label: `Marée n°${trip}`,
    value: trip
  }))
}
