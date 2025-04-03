import { getFilterableZonesAsTreeOptions } from '@features/Vessel/components/VesselList/utils'
import { useEffect, useState } from 'react'

import type { TreeOption } from '@mtes-mct/monitor-ui'

export function useGetFilterableZonesAsTreeOptions() {
  const [filterableZonesAsTreeOptions, setFilterableZonesAsTreeOptions] = useState<TreeOption[] | undefined>(undefined)

  useEffect(() => {
    async function fetchFilterableZones() {
      const nextFilterableZonesAsTreeOptions = await getFilterableZonesAsTreeOptions()

      setFilterableZonesAsTreeOptions(nextFilterableZonesAsTreeOptions)
    }

    fetchFilterableZones()
  }, [])

  return filterableZonesAsTreeOptions
}
