import { RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetGearsQuery } from '@api/gear'
import { getAlpha2CodeFromAlpha2or3Code } from '@components/CountryFlag/utils'
import { useGetPriorNotificationPDFQuery } from '@features/PriorNotification/priorNotificationApi'
import { Accent, Button, customDayjs, Dropdown, Icon } from '@mtes-mct/monitor-ui'
import printJS from 'print-js'
import { useMemo } from 'react'

import { HTML_STYLE } from './template'
import { getHasAuthorizedLandingDownload, getHtmlContent } from './utils'
import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

type DownloadButtonProps = Readonly<{
  isDisabled?: boolean
  isManuallyCreated: boolean
  pnoLogbookMessage: LogbookMessage.PnoLogbookMessage
  reportId: string
}>
export function DownloadButton({
  isDisabled = false,
  isManuallyCreated,
  pnoLogbookMessage,
  reportId
}: DownloadButtonProps) {
  const isSuperUser = useIsSuperUser()
  const getGearsApiQuery = useGetGearsQuery()
  const { isError } = useGetPriorNotificationPDFQuery(reportId, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS)
  const isPriorNotificationPDFDocumentAvailable = useMemo(() => !isError, [isError])
  const hasAuthorizedLandingDownload =
    isSuperUser &&
    getHasAuthorizedLandingDownload(
      getAlpha2CodeFromAlpha2or3Code(pnoLogbookMessage.flagState),
      pnoLogbookMessage.externalReferenceNumber
    ) &&
    isManuallyCreated
  const pdfUrl = `/api/v1/prior_notifications/pdf/${reportId}`

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
    <>
      {hasAuthorizedLandingDownload && (
        <Dropdown accent={Accent.SECONDARY} Icon={Icon.Download} placement="topEnd" title="Télécharger les documents">
          <>
            {!isPriorNotificationPDFDocumentAvailable && (
              <Dropdown.Item disabled title="Document non généré">
                Préavis de débarquement
              </Dropdown.Item>
            )}
            {isPriorNotificationPDFDocumentAvailable && (
              <Dropdown.Item
                disabled={isDisabled}
                onClick={() => window.open(pdfUrl, '_blank')}
                title={isDisabled ? 'Veuillez enregistrer le préavis' : undefined}
              >
                Préavis de débarquement (à destination des unités)
              </Dropdown.Item>
            )}
            {/** If the form is dirty (has been modified), the export will be outdated. */}
            {/** The user MUST first save the new version */}
            {hasAuthorizedLandingDownload && (
              <Dropdown.Item
                disabled={isDisabled}
                onClick={downloadPDF}
                title={isDisabled ? 'Veuillez enregistrer le préavis' : undefined}
              >
                Autorisation d&apos;entrée au port et de débarquement
              </Dropdown.Item>
            )}
          </>
        </Dropdown>
      )}
      {!hasAuthorizedLandingDownload && (
        <>
          {!isPriorNotificationPDFDocumentAvailable && (
            <Button
              accent={Accent.SECONDARY}
              disabled
              Icon={Icon.Download}
              title="Le pdf du préavis est en cours de création, cela peut prendre jusqu'à 1 min."
            >
              Télécharger
            </Button>
          )}
          {isPriorNotificationPDFDocumentAvailable && (
            <Button
              accent={Accent.SECONDARY}
              disabled={isDisabled}
              Icon={Icon.Download}
              onClick={() => window.open(pdfUrl, '_blank')}
              title={isDisabled ? 'Veuillez enregistrer le préavis' : undefined}
            >
              Télécharger
            </Button>
          )}
        </>
      )}
    </>
  )
}
