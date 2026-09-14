import { MANUAL_ZONE_LABEL } from '@features/Reporting/constants'
import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { Checkbox, SingleTag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type ReportingZoneFilterProps = Readonly<{
  className?: string
}>
/**
 * Lets the user restrict reportings to a zone drawn on the map, on both the map menu and the
 * reporting list. The drawn geometry is committed to the shared filters by `useReportingsFilters`.
 */
export function ReportingZoneFilter({ className }: ReportingZoneFilterProps) {
  const { drawZone, filters, updateZone } = useReportingsFilters()

  const handleChange = (isChecked: boolean | undefined) => {
    if (isChecked) {
      drawZone()

      return
    }

    updateZone(undefined)
  }

  return (
    <Wrapper className={className}>
      <Checkbox
        checked={!!filters.zone}
        label="Filtrer avec une zone dessinée sur la carte"
        name="reportingZone"
        onChange={handleChange}
      />
      {!!filters.zone && <SingleTag onDelete={() => updateZone(undefined)}>{MANUAL_ZONE_LABEL}</SingleTag>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`
