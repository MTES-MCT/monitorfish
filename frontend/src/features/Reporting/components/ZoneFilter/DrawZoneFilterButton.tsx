import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'

const LABEL = 'Définir une zone de filtre manuelle'

type DrawZoneFilterButtonProps = Readonly<{
  /** Displayed as the title while the button is disabled. */
  disabledReason?: string | undefined
  isDisabled?: boolean
}>
export function DrawZoneFilterButton({ disabledReason, isDisabled = false }: DrawZoneFilterButtonProps) {
  const { drawZone } = useReportingsFilters()

  return (
    <Button
      accent={Accent.SECONDARY}
      disabled={isDisabled}
      Icon={Icon.Plus}
      onClick={drawZone}
      title={isDisabled && disabledReason ? `${LABEL} (${disabledReason.toLowerCase()})` : LABEL}
    >
      {LABEL}
    </Button>
  )
}
