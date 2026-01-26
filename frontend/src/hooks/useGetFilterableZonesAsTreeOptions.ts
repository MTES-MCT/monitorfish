import { getFilterableZonesAsTreeOptions } from '@features/Vessel/components/VesselList/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useEffect, useState } from 'react'

import type { TreeOption } from '@mtes-mct/monitor-ui'

export function useGetFilterableZonesAsTreeOptions(): TreeOption[] | undefined {
  const dispatch = useMainAppDispatch()
  const [filterableZonesAsTreeOptions, setFilterableZonesAsTreeOptions] = useState<TreeOption[] | undefined>(undefined)

  useEffect(() => {
    async function fetchFilterableZones() {
      const nextFilterableZonesAsTreeOptions = await getFilterableZonesAsTreeOptions(dispatch)

      setFilterableZonesAsTreeOptions(nextFilterableZonesAsTreeOptions)
    }

    fetchFilterableZones()
  }, [dispatch])

  return filterableZonesAsTreeOptions
}
