import { RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetGearsQuery } from '@api/gear'
import { getAlpha2CodeFromAlpha2or3Code } from '@components/CountryFlag/utils'
import { useGetPriorNotificationPDFQuery } from '@features/PriorNotification/priorNotificationApi'
import { Accent, customDayjs, Dropdown, Icon } from '@mtes-mct/monitor-ui'
import printJS from 'print-js'
import { useMemo } from 'react'

import { HTML_STYLE } from './template'
import { getHtmlContent } from './utils'
import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

type DownloadButtonProps = Readonly<{
  isDisabled?: boolean
  pnoLogbookMessage: LogbookMessage.PnoLogbookMessage
  reportId: string
}>
export function DownloadButton({ isDisabled = false, pnoLogbookMessage, reportId }: DownloadButtonProps) {
  const isSuperUser = useIsSuperUser()
  const getGearsApiQuery = useGetGearsQuery()
  const { isError } = useGetPriorNotificationPDFQuery(reportId, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS)
  const isPriorNotificationPDFDocumentAvailable = useMemo(() => !isError, [isError])

  const gearsWithName = useMemo(() => {
    if (!getGearsApiQuery.data || !pnoLogbookMessage?.tripGears) {
      return []
    }

    return pnoLogbookMessage.tripGears.map(tripGear => {
      const gearName = getGearsApiQuery.data?.find(gear => gear.code === tripGear.gear)?.name ?? null

      return { ...tripGear, gearName }
    })
  }, [getGearsApiQuery.data, pnoLogbookMessage?.tripGears])

  const downloadPDF = async () => {
    const htmlContent = await getHtmlContent(pnoLogbookMessage, gearsWithName)

    printJS({
      documentTitle: `preavis_entree_port_debarquement_${customDayjs().utc().format('DDMMYYYY')}.pdf`,
      printable: htmlContent,
      style: HTML_STYLE,
      type: 'raw-html'
    })
  }

  return (
    <Dropdown accent={Accent.SECONDARY} Icon={Icon.Download} placement="topEnd" title="Télécharger les documents">
      <>
        {!isPriorNotificationPDFDocumentAvailable && (
          <Dropdown.Item disabled>Préavis de débarquement (Document non généré)</Dropdown.Item>
        )}
        {isPriorNotificationPDFDocumentAvailable && (
          <Dropdown.Item
            disabled={isDisabled}
            onClick={() => window.open(`/bff/v1/prior_notifications/${reportId}/pdf`, '_blank')}
          >
            Préavis de débarquement (à destination des unités) {isDisabled && '(Veuillez enregistrer le préavis)'}
          </Dropdown.Item>
        )}
        {/** If the form is dirty (has been modified), the export will be outdated. */}
        {/** The user MUST first save the new version */}
        {isSuperUser && getAlpha2CodeFromAlpha2or3Code(pnoLogbookMessage.flagState) !== 'FR' && (
          <Dropdown.Item disabled={isDisabled} onClick={downloadPDF}>
            Autorisation d&apos;entrée au port et de débarquement {isDisabled && '(Veuillez enregistrer le préavis)'}
          </Dropdown.Item>
        )}
      </>
    </Dropdown>
  )
}
