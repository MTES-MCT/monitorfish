import { useGetGearsQuery } from '@api/gear'
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
}>
export function DownloadButton({ isDisabled = false, pnoLogbookMessage }: DownloadButtonProps) {
  const isSuperUser = useIsSuperUser()
  const getGearsApiQuery = useGetGearsQuery()

  const gearsWithName = useMemo(() => {
    if (!getGearsApiQuery.data || !pnoLogbookMessage?.tripGears) {
      return []
    }

    return pnoLogbookMessage.tripGears.map(tripGear => {
      const gearName = getGearsApiQuery.data?.find(gear => gear.code === tripGear.gear)?.name ?? null

      return { ...tripGear, gearName }
    })
  }, [getGearsApiQuery.data, pnoLogbookMessage?.tripGears])

  const downloadPDF = () => {
    printJS({
      documentTitle: `preavis_entree_port_debarquement_${customDayjs().utc().format('DDMMYYYY')}.pdf`,
      printable: getHtmlContent(pnoLogbookMessage, gearsWithName),
      style: HTML_STYLE,
      type: 'raw-html'
    })
  }

  return (
    <Dropdown accent={Accent.PRIMARY} Icon={Icon.Download} placement="topEnd" title="Télécharger les documents">
      <>
        {/** If the form is dirty (has been modified), the export will be outdated. */}
        {/** The user MUST first save the new version */}
        {isSuperUser && pnoLogbookMessage.flagState !== 'FR' && (
          <Dropdown.Item disabled={isDisabled} onClick={downloadPDF}>
            Autorisation d&apos;entrée au port et de débarquement {isDisabled && '(Veuillez enregistrer le préavis)'}
          </Dropdown.Item>
        )}
      </>
    </Dropdown>
  )
}
