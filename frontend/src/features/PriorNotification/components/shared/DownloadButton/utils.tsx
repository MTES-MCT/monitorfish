import { getAlpha2CodeFromAlpha2or3Code } from '@components/CountryFlag/utils'
import { buildCatchArray } from '@features/Logbook/utils'
import { HTML_TEMPLATE } from '@features/PriorNotification/components/shared/DownloadButton/template'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { LogbookCatch } from '@features/Logbook/Logbook.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { TemplateData } from '@features/PriorNotification/components/PriorNotificationCard/types'

export function getHtmlContent(
  pno: LogbookMessage.PnoLogbookMessage | undefined,
  gearsWithName: Array<LogbookMessage.Gear & { gearName: string | null }>
): string {
  if (!pno) {
    return ''
  }

  const catches = pno.message.catchOnboard ? buildCatchArray(pno.message.catchOnboard as LogbookCatch[]) : []

  const gearDetails = gearsWithName
    .map(gear => {
      const mesh = gear.mesh ? `- Maillage ${gear.mesh} mm` : ''

      return gear.gearName ? `${gear.gearName} (${gear.gear}) ${mesh}` : `${gear.gear} ${mesh}`
    })
    .join(', ')

  const catchDetails = catches
    .map(
      aCatch =>
        `<tr>
          <td>${aCatch.speciesName} - (${aCatch.species})</td>
          <td>${aCatch.properties
            .map(property => {
              const statisticalRectangle = property.statisticalRectangle ? `(${property.statisticalRectangle})` : ''

              return `${property.faoZone} ${statisticalRectangle}`
            })
            .join(', ')}</td>
          <td>${aCatch.weight ?? ''}</td>
          <td>${aCatch.nbFish ?? ''}</td>
        </tr>`
    )
    .join('')

  const data = {
    catchDetails,
    externalReferenceNumber: pno.externalReferenceNumber ?? 'Aucun',
    flagStateFilePath: getAlpha2CodeFromAlpha2or3Code(pno.flagState)
      ? `flags/${getAlpha2CodeFromAlpha2or3Code(pno.flagState)?.toLowerCase()}.png`
      : 'flags/unknown.png',
    gearDetails,
    imo: pno.imo ?? 'Aucun',
    internalReferenceNumber: pno.internalReferenceNumber ?? 'Aucun',
    ircs: pno.ircs ?? 'Aucun',
    operationDateTime: pno.operationDateTime
      ? customDayjs(pno.operationDateTime).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    port: pno.message.port,
    portEntranceAuthorization: pno.message.hasPortEntranceAuthorization
      ? `<strong class="authorized">Autorisation donnée d'entrer au port<br/></strong>`
      : `<strong class="unauthorized">Interdiction donnée d'entrer au port<br/></strong>`,
    portLandingAuthorization: pno.message.hasPortLandingAuthorization
      ? `<strong class="authorized">Autorisation donnée de débarquer<br/></strong>`
      : `<strong class="unauthorized">Interdiction donnée de débarquer<br/></strong>`,
    portName: pno.message.portName,
    predictedArrivalDatetimeUtc: pno.message.predictedArrivalDatetimeUtc
      ? customDayjs(pno.message.predictedArrivalDatetimeUtc).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    predictedLandingDatetimeUtc: pno.message.predictedLandingDatetimeUtc
      ? customDayjs(pno.message.predictedLandingDatetimeUtc).utc().format('le DD/MM/YYYY à HH[h]mm UTC')
      : '-',
    purpose: pno.message.purpose ? PriorNotification.PURPOSE_LABEL[pno.message.purpose] : '',
    vesselName: pno.vesselName
  }

  return fillTemplate(HTML_TEMPLATE, data)
}

function fillTemplate(html: string, data: TemplateData): string {
  return html.replace(/{(.*?)}/g, (_, key) => (data[key] !== null && data[key] !== undefined ? String(data[key]) : ''))
}
