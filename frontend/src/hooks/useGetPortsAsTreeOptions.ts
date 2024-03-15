import { useGetPortsQuery } from '@api/port'
import { isDefined, type TreeOption } from '@mtes-mct/monitor-ui'
import { uniq } from 'lodash'
import { useMemo } from 'react'

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

      // TODO If `region` is null, the port won't appear. Check if that's the expected behavior.
      const sortedUniquePortDepartments = uniq(ports.map(port => port.region).filter(isDefined)).sort()

      return sortedUniquePortDepartments.map(department => ({
        children: ports
          .filter(port => port.region === department)
          .map(port => ({
            label: port.name,
            value: port.locode
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        label: department
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
