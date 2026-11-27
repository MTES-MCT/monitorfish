import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { readZonesFromWKT } from '@features/Reporting/zoneFilter'
import { SingleTag } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

type ZoneFilterTagsProps = Readonly<{
  /** Displayed as the title while the deletion is disabled. */
  disabledReason?: string | undefined
  isDeletionDisabled?: boolean
}>
/**
 * The drawn zones are added to the shared filters by `addDrawnZonesToFilter`.
 */
export function ZoneFilterTags({ disabledReason, isDeletionDisabled = false }: ZoneFilterTagsProps) {
  const { filters, removeZone } = useReportingsFilters()

  const zones = useMemo(() => readZonesFromWKT(filters.zone), [filters.zone])

  const deleteZone = (index: number) => {
    if (isDeletionDisabled) {
      return
    }

    removeZone(index)
  }

  return zones.map((_, index) => (
    <ZoneFilterTag
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      $isDeletionDisabled={isDeletionDisabled}
      onDelete={() => deleteZone(index)}
      title={isDeletionDisabled ? disabledReason : undefined}
    >
      {`Zone de filtre ${index + 1}`}
    </ZoneFilterTag>
  ))
}

/** `SingleTag` does not forward any prop to its delete button. */
const ZoneFilterTag = styled(SingleTag)<{ $isDeletionDisabled: boolean }>`
  > button {
    cursor: ${p => (p.$isDeletionDisabled ? 'not-allowed' : 'pointer')};
    opacity: ${p => (p.$isDeletionDisabled ? 0.5 : 1)};
  }
`
