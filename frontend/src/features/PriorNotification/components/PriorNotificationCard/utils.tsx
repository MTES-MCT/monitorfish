import { getAlpha2CodeFromAlpha2or3Code } from '@components/CountryFlag/utils'
import { Titled } from '@components/Titled'
import { buildCatchArray } from '@features/Logbook/utils'
import { HTML_TEMPLATE } from '@features/PriorNotification/components/PriorNotificationCard/template'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { LogbookCatch } from '@features/Logbook/Logbook.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { TemplateData } from '@features/PriorNotification/components/PriorNotificationCard/types'

export function getFirstTitleRowText(
  isLessThanTwelveMetersVessel: boolean,
  tripSegments: LogbookMessage.Segment[] | undefined
) {
  const tripSegmentNames =
    tripSegments?.map(tripSegment => `${tripSegment.code} (${tripSegment.name.toUpperCase()})`) ?? []
  const tripSegmentNamesAsText = tripSegmentNames.length > 0 ? tripSegmentNames.join(', ') : 'SEGMENT(S) INCONNU(S)'

  return (
    <>
      {`PNO ${isLessThanTwelveMetersVessel ? '< 12 M' : '≥ 12 M'} - `}
      <Titled>{tripSegmentNamesAsText}</Titled>
    </>
  )
}

export function getHtmlContent(
  pno: LogbookMessage.PnoLogbookMessage | undefined,
  gearsWithName: Array<LogbookMessage.Gear & { gearName: string | null }>
): string {
  if (!pno) {
    return ''
  }

  const catches = pno.message.catchOnboard ? buildCatchArray(pno.message.catchOnboard as LogbookCatch[]) : []

  const gearDetails = gearsWithName
    .map(gear =>
      gear.gearName
        ? `${gear.gearName} (${gear.gear}) - Maillage ${gear.mesh} mm`
        : `${gear.gear} - Maillage ${gear.mesh} mm`
    )
    .join(', ')

  const catchDetails = catches
    .map(
      aCatch =>
        `<tr>
          <td>${aCatch.speciesName} - (${aCatch.species})</td>
          <td>${aCatch.properties
            .map(property => `${property.faoZone} (${property.statisticalRectangle})`)
            .join(', ')}</td>
          <td>${aCatch.weight}</td>
          <td>${aCatch.nbFish}</td>
        </tr>`
    )
    .join('')

  const data = {
    catchDetails,
    externalReferenceNumber: pno.externalReferenceNumber ?? 'Aucun',
    flagState: getAlpha2CodeFromAlpha2or3Code(pno.flagState) ?? 'unknown',
    gearDetails,
    imo: pno.imo ?? 'Aucun',
    internalReferenceNumber: pno.internalReferenceNumber ?? 'Aucun',
    ircs: pno.ircs ?? 'Aucun',
    operationDateTime: pno.operationDateTime
      ? customDayjs(pno.operationDateTime).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    port: pno.message.port,
    portName: pno.message.portName,
    predictedArrivalDatetimeUtc: pno.message.predictedArrivalDatetimeUtc
      ? customDayjs(pno.message.predictedArrivalDatetimeUtc).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    predictedLandingDatetimeUtc: pno.message.predictedLandingDatetimeUtc
      ? customDayjs(pno.message.predictedLandingDatetimeUtc).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    vesselName: pno.vesselName
  }

  return fillTemplate(HTML_TEMPLATE, data)
}

function fillTemplate(html: string, data: TemplateData): string {
  return html.replace(/{(.*?)}/g, (_, key) => (data[key] !== null && data[key] !== undefined ? String(data[key]) : ''))
}
