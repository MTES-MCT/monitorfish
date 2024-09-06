import { monitorfishApiKy } from '@api/api'
import { RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetGearsQuery } from '@api/gear'
import { getAlpha2CodeFromAlpha2or3Code } from '@components/CountryFlag/utils'
import {
  StatusBodyEnum,
  useGetPriorNotificationPdfExistenceQuery
} from '@features/PriorNotification/priorNotificationApi'
import { customSentry, CustomSentryMeasurementName } from '@libs/customSentry'
import { Accent, Button, customDayjs, Dropdown, Icon, usePrevious } from '@mtes-mct/monitor-ui'
import { downloadFile } from '@utils/downloadFile'
import printJS from 'print-js'
import { useEffect, useMemo } from 'react'

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
  const { data } = useGetPriorNotificationPdfExistenceQuery(reportId, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS)

  const wasDisabled = usePrevious(isDisabled)

  const isPriorNotificationDocumentAvailable = useMemo(() => data?.status === StatusBodyEnum.FOUND, [data])

  const hasAuthorizedLandingDownload =
    isSuperUser &&
    getHasAuthorizedLandingDownload(
      getAlpha2CodeFromAlpha2or3Code(pnoLogbookMessage.flagState),
      pnoLogbookMessage.externalReferenceNumber
    ) &&
    isManuallyCreated

  const gearsWithName = useMemo(() => {
    if (!getGearsApiQuery.data || !pnoLogbookMessage?.tripGears) {
      return []
    }

    return pnoLogbookMessage.tripGears.map(tripGear => {
      const gearName = getGearsApiQuery.data?.find(gear => gear.code === tripGear.gear)?.name ?? null

      return { ...tripGear, gearName }
    })
  }, [getGearsApiQuery.data, pnoLogbookMessage?.tripGears])

  const downloadAuthorizationDocument = () => {
    const htmlContent = getHtmlContent(pnoLogbookMessage, gearsWithName)

    printJS({
      documentTitle: `preavis_entree_port_debarquement_${customDayjs().utc().format('DDMMYYYY')}.pdf`,
      printable: htmlContent,
      style: HTML_STYLE,
      type: 'raw-html'
    })
  }

  const downloadPriorNotificationDocument = async () => {
    const url = `/bff/v1/prior_notifications/${reportId}/pdf`
    const response = await monitorfishApiKy.get(url)
    const blob = await response.blob()
    const generationDate = response.headers.get('x-generation-date')
    const fileName = `preavis_debarquement_${generationDate}.pdf`

    downloadFile(fileName, 'application/pdf', blob)
  }

  useEffect(() => {
    if (isDisabled === wasDisabled) {
      return
    }

    if (isDisabled) {
      customSentry.startMeasurement(CustomSentryMeasurementName.PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON, reportId)
    } else {
      customSentry.endMeasurement(CustomSentryMeasurementName.PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON, reportId)
    }
  }, [isDisabled, reportId, wasDisabled])

  return (
    <>
      {hasAuthorizedLandingDownload && (
        <Dropdown accent={Accent.SECONDARY} Icon={Icon.Download} placement="topEnd" title="Télécharger les documents">
          <>
            {!isPriorNotificationDocumentAvailable && (
              <Dropdown.Item disabled title="Document non généré">
                Préavis de débarquement
              </Dropdown.Item>
            )}
            {isPriorNotificationDocumentAvailable && (
              <Dropdown.Item
                disabled={isDisabled}
                onClick={downloadPriorNotificationDocument}
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
                onClick={downloadAuthorizationDocument}
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
          {!isPriorNotificationDocumentAvailable && (
            <Button
              accent={Accent.SECONDARY}
              disabled
              Icon={Icon.Download}
              title="Le pdf du préavis est en cours de création, cela peut prendre jusqu'à 1 min."
            >
              Télécharger
            </Button>
          )}
          {isPriorNotificationDocumentAvailable && (
            <Button
              accent={Accent.SECONDARY}
              disabled={isDisabled}
              Icon={Icon.Download}
              onClick={downloadPriorNotificationDocument}
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
