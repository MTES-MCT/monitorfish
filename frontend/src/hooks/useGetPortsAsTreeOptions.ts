import { useGetPortsQuery } from '@api/port'
import { useMemo } from 'react'

import type { TreeOption } from '@mtes-mct/monitor-ui'

/**
 * Fetches ports and returns them as tree options with their `locode` property as option value.
 */
export function useGetPortsAsTreeOptions() {
  const { data: ports, error, isLoading } = useGetPortsQuery()

  const portsAsTreeOptions: TreeOption[] | undefined = useMemo(
    () => {
      if (!ports) {
        return undefined
      }

      // TODO Add the department to the ports list API endpoint data.
      const sortedPortCategories = ['Un département']

      return sortedPortCategories.map(category => ({
        children: ports
          // .filter(port => port.department.code === category)
          .map(port => ({
            label: port.name,
            value: port.locode
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        label: category
      }))
    },

    // Ports are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    isLoading,
    portsAsTreeOptions
  }
}
