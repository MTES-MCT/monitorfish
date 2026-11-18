import { useGetInfractionsQuery } from '@features/Infraction/apis'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

export function useGetNatinfsAsOptions({ skip = false }: { skip?: boolean } = {}) {
  const getInfractionsApiQuery = useGetInfractionsQuery(undefined, { skip })

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
