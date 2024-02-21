import { useGetInfractionsQuery } from '@api/infraction'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

export function useGetNatinfsAsOptions() {
  const getInfractionsApiQuery = useGetInfractionsQuery()

  const natinfsAsOptions: Option<number>[] = useMemo(() => {
    if (!getInfractionsApiQuery.data) {
      return []
    }

    return getInfractionsApiQuery.data.map(({ infraction, natinfCode }) => ({
      label: `${natinfCode} - ${infraction}`,
      value: Number(natinfCode)
    }))
  }, [getInfractionsApiQuery.data])

  return natinfsAsOptions
}
