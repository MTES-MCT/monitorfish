import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { readZonesFromWKT } from '@features/Reporting/zoneFilter'
import { SingleTag } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

/**
 * The drawn zones are added to the shared filters by `addDrawnZonesToFilter`.
 */
export function ZoneFilterTags() {
  const { filters, removeZone } = useReportingsFilters()

  const zones = useMemo(() => readZonesFromWKT(filters.zone), [filters.zone])

  return zones.map((_, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <SingleTag key={index} onDelete={() => removeZone(index)}>
      {`Zone de filtre ${index + 1}`}
    </SingleTag>
  ))
}
