import { useGetPortsQuery } from '@api/port'
import { type Option } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

/**
 * Fetches ports and returns them as options with their `locode` property as option value.
 */
export function useGetPortsAsOptions() {
  const { data: ports, error, isLoading } = useGetPortsQuery()

  const portsAsOptions: Option[] | undefined = useMemo(
    () => {
      if (!ports) {
        return undefined
      }

      return ports
        .map(port => ({
          label: `${port.name} (${port.locode})`,
          value: port.locode
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },

    // Ports are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    isLoading,
    portsAsOptions
  }
}
