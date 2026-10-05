import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'

export function DrawZoneFilterButton() {
  const { drawZone } = useReportingsFilters()

  return (
    <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={drawZone} title="Définir une zone de filtre manuelle">
      Définir une zone de filtre manuelle
    </Button>
  )
}
