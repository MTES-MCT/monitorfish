import { useGetThreatCharacterizationsQuery } from '@features/Infraction/apis'
import { useMemo } from 'react'

export function useGetThreatCharacterizationAsTreeOptions() {
  const getThreatCharacterizationApiQuery = useGetThreatCharacterizationsQuery()

  const threatCharacterizationAsOptions = useMemo(() => {
    if (!getThreatCharacterizationApiQuery.data) {
      return []
    }

    return getThreatCharacterizationApiQuery.data
  }, [getThreatCharacterizationApiQuery.data])

  return threatCharacterizationAsOptions
}
