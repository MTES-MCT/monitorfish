import { useGetGearsQuery } from '@api/gear'
import { Accent, customDayjs, Dropdown, Icon } from '@mtes-mct/monitor-ui'
import printJS from 'print-js'
import { useMemo } from 'react'

import { HTML_STYLE } from './template'
import { getHtmlContent } from './utils'
import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

type DownloadButtonProps = Readonly<{
  pnoLogbookMessage: LogbookMessage.PnoLogbookMessage
}>
export function DownloadButton({ pnoLogbookMessage }: DownloadButtonProps) {
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
        {isSuperUser && pnoLogbookMessage.flagState !== 'FR' && (
          <Dropdown.Item onClick={downloadPDF}>Autorisation d&apos;entrée au port et de débarquement</Dropdown.Item>
        )}
      </>
    </Dropdown>
  )
}
