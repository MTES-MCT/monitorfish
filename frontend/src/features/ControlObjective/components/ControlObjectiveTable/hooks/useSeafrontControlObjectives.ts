import { sortArrayByColumn, SortType } from '@utils/sortArrayByColumn'
import { useCallback, useMemo, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { useGetFleetSegmentsQuery } from '../../../../FleetSegment/apis'
import {
  useAddControlObjectiveMutation,
  useDeleteControlObjectiveMutation,
  useUpdateControlObjectiveMutation
} from '../../../apis'

import type { FleetSegment } from '../../../../FleetSegment/types'
import type { ControlObjective } from '../../../types'

type ControlObjectiveWithMaybeFleetSegment = ControlObjective &
  Partial<FleetSegment> & {
    controlPriorityLevel?: number
  }

type UseSeafrontControlObjectivesResult = {
  addSegment: (nextSegment: string | undefined) => void
  controlObjectives: ControlObjectiveWithMaybeFleetSegment[]
  deleteRow: (id: number) => void
  handleSort: (nextSortColumn: keyof ControlObjective, nextSortType: SortType) => void
  isLoading: boolean
  segmentsOptions: Array<{ label: string; value: string }>
  sortColumn: keyof ControlObjective
  sortType: SortType
  updateField: (id: number, key: keyof ControlObjective, value: number) => void
}

export function useSeafrontControlObjectives(
  data: ControlObjective[],
  facade: string,
  year: number
): UseSeafrontControlObjectivesResult {
  // Only track local edits for optimistic updates
  const [localEdits, setLocalEdits] = useState<Record<number, Partial<ControlObjective>>>({})
  const [sortColumn, setSortColumn] = useState<keyof ControlObjective>('segment')
  const [sortType, setSortType] = useState(SortType.ASC)

  const getFleetSegmentsQuery = useGetFleetSegmentsQuery()
  const [updateControlObjective] = useUpdateControlObjectiveMutation()
  const [addControlObjective] = useAddControlObjectiveMutation()
  const [deleteControlObjective] = useDeleteControlObjectiveMutation()

  const fleetSegments = getFleetSegmentsQuery.data
  const isLoading = !fleetSegments

  const findFleetSegment = useCallback(
    (segment: string) => fleetSegments?.find(fs => fs.segment === segment),
    [fleetSegments]
  )

  const controlObjectives = useMemo(() => {
    if (!data.length || !fleetSegments) {
      return []
    }

    return data
      .map(
        objective =>
          ({
            ...objective,
            ...(findFleetSegment(objective.segment) ?? {}),
            ...localEdits[objective.id]
          }) as ControlObjectiveWithMaybeFleetSegment
      )
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
  }, [data, fleetSegments, findFleetSegment, localEdits, sortColumn, sortType])

  const updateControlObjectiveDebounced = useDebouncedCallback(
    (id: number, key: keyof ControlObjective, value: number) => {
      updateControlObjective({
        id: id.toString(),
        updatedFields: {
          controlPriorityLevel: null,
          infringementRiskLevel: null,
          targetNumberOfControlsAtPort: null,
          targetNumberOfControlsAtSea: null,
          // eslint-disable-next-line sort-keys-fix/sort-keys-fix
          [key]: value
        }
      })
        .unwrap()
        .catch(() => {
          // Revert local edit on error
          setLocalEdits(prev => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...rest } = prev

            return rest
          })
        })
    },
    500
  )

  const updateField = useCallback(
    (id: number, key: keyof ControlObjective, value: number) => {
      // Optimistic update
      setLocalEdits(prev => ({
        ...prev,
        [id]: { ...prev[id], [key]: value }
      }))
      updateControlObjectiveDebounced(id, key, value)
    },
    [updateControlObjectiveDebounced]
  )

  // RTK Query cache invalidation handles state update
  const addSegment = useCallback(
    (nextSegment: string | undefined) => {
      if (!nextSegment) {
        return
      }

      addControlObjective({ facade, segment: nextSegment, year })
    },
    [addControlObjective, facade, year]
  )

  // RTK Query cache invalidation handles state update
  const deleteRow = useCallback(
    (id: number) => {
      deleteControlObjective(id)
    },
    [deleteControlObjective]
  )

  const handleSort = useCallback((nextSortColumn: keyof ControlObjective, nextSortType: SortType) => {
    setSortColumn(nextSortColumn)
    setSortType(nextSortType)
  }, [])

  const segmentsOptions = useMemo(() => {
    if (!fleetSegments) {
      return []
    }

    return fleetSegments
      .map(s => ({ label: s.segment, value: s.segment }))
      .filter(s => !controlObjectives.some(o => o.segment === s.value))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [fleetSegments, controlObjectives])

  return {
    addSegment,
    controlObjectives,
    deleteRow,
    handleSort,
    isLoading,
    segmentsOptions,
    sortColumn,
    sortType,
    updateField
  }
}
