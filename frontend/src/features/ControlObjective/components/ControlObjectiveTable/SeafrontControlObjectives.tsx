import { BackOfficeTitle } from '@features/BackOffice/components/BackOfficeTitle'
import {
  DeleteCell,
  ImpactRiskFactorCell,
  INPUT_TYPE,
  ModifiableCell,
  SegmentCellWithTitle
} from '@features/ControlObjective/components/ControlObjectiveTable/tableCells'
import { Label, Select } from '@mtes-mct/monitor-ui'
import { sortArrayByColumn, SortType } from '@utils/sortArrayByColumn'
import { useCallback, useEffect, useState } from 'react'
import { Table } from 'rsuite'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { ControlPriorityCell } from './ControlPriorityCell'
import { InfringementRiskLevelCell } from './InfringementRiskLevelCell'
import { LoadingSpinnerWall } from '../../../../ui/LoadingSpinnerWall'
import { useGetFleetSegmentsQuery } from '../../../FleetSegment/apis'
import {
  useAddControlObjectiveMutation,
  useDeleteControlObjectiveMutation,
  useUpdateControlObjectiveMutation
} from '../../apis'

import type { FleetSegment } from '../../../FleetSegment/types'
import type { ControlObjective } from '../../types'

type ControlObjectiveWithMaybeFleetSegment = ControlObjective &
  Partial<FleetSegment> & {
    controlPriorityLevel?: number
  }

export type SeafrontControlObjectivesProps = Readonly<{
  data: ControlObjective[]
  facade: string
  title: string
  year: number
}>
export function SeafrontControlObjectives({ data, facade, title, year }: SeafrontControlObjectivesProps) {
  const [controlObjectivesWithMaybeFleetSegment, setControlObjectivesWithMaybeFleetSegment] = useState<
    ControlObjectiveWithMaybeFleetSegment[]
  >([])
  const [sortColumn, setSortColumn] = useState<keyof ControlObjective>('segment')
  const [sortType, setSortType] = useState(SortType.ASC)

  const getFleetSegmentsQuery = useGetFleetSegmentsQuery()

  const [updateControlObjective] = useUpdateControlObjectiveMutation()

  const [addControlObjective] = useAddControlObjectiveMutation()

  const [deleteControlObjective] = useDeleteControlObjectiveMutation()

  const addSegmentToFacade = useCallback(
    async (nextSegment: string | undefined) => {
      if (!getFleetSegmentsQuery.data || !nextSegment) {
        return
      }

      const newId = await addControlObjective({
        facade,
        segment: nextSegment,
        year
      })
      if (!newId) {
        return
      }

      const foundFleetSegment = (getFleetSegmentsQuery.data || []).find(
        fleetSegment => fleetSegment.segment === nextSegment
      )

      const nextControlObjectiveWithFleetSegment = [
        ...controlObjectivesWithMaybeFleetSegment,
        {
          controlPriorityLevel: 1,
          facade,
          id: newId,
          infringementRiskLevel: 2,
          segment: nextSegment,
          target: 1,
          targetNumberOfControlsAtPort: 0,
          targetNumberOfControlsAtSea: 0,
          year,
          ...(foundFleetSegment ?? {})
        } as unknown as ControlObjectiveWithMaybeFleetSegment
      ]

      const sortedNextDataWithSegmentDetails = nextControlObjectiveWithFleetSegment.sort((a, b) =>
        sortArrayByColumn(a, b, sortColumn, sortType)
      )

      setControlObjectivesWithMaybeFleetSegment(sortedNextDataWithSegmentDetails)
    },
    [
      controlObjectivesWithMaybeFleetSegment,
      addControlObjective,
      facade,
      getFleetSegmentsQuery,
      sortColumn,
      sortType,
      year
    ]
  )

  const deleteControlObjectiveRow = useCallback(
    async (id: number) => {
      await deleteControlObjective(id)

      const nextControlObjectivesWithMaybeFleetSegment = controlObjectivesWithMaybeFleetSegment.filter(
        controlObjectiveWithMaybeFleetSegment => controlObjectiveWithMaybeFleetSegment.id !== id
      )

      setControlObjectivesWithMaybeFleetSegment(nextControlObjectivesWithMaybeFleetSegment)
    },
    [controlObjectivesWithMaybeFleetSegment, deleteControlObjective]
  )

  const updateControlObjectiveDebounced = useDebouncedCallback(
    (
      id: number,
      key: keyof ControlObjective,
      value,
      previousControlObjectivesWithMaybeFleetSegment: ControlObjectiveWithMaybeFleetSegment[]
    ) => {
      const updatedFields = {
        controlPriorityLevel: null,
        infringementRiskLevel: null,
        targetNumberOfControlsAtPort: null,
        targetNumberOfControlsAtSea: null,
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        [key]: value
      }

      updateControlObjective({
        id: id.toString(),
        updatedFields
      }).catch(() => {
        setControlObjectivesWithMaybeFleetSegment(previousControlObjectivesWithMaybeFleetSegment)
      })
    },
    500
  )

  const handleChangeModifiableKey = useCallback(
    (
      id: number,
      key: keyof ControlObjective,
      value: number,
      _controlObjectivesWithMaybeFleetSegment: ControlObjectiveWithMaybeFleetSegment[]
    ) => {
      const previousControlObjectivesWithMaybeFleetSegment = [..._controlObjectivesWithMaybeFleetSegment]
      const nextControlObjectivesWithMaybeFleetSegment = _controlObjectivesWithMaybeFleetSegment.map(
        controlObjectiveWithMaybeFleetSegment =>
          controlObjectiveWithMaybeFleetSegment.id === id
            ? {
                ...controlObjectiveWithMaybeFleetSegment,
                [key]: value
              }
            : controlObjectiveWithMaybeFleetSegment
      )

      setControlObjectivesWithMaybeFleetSegment(nextControlObjectivesWithMaybeFleetSegment)

      updateControlObjectiveDebounced(id, key, value, previousControlObjectivesWithMaybeFleetSegment)
    },
    [updateControlObjectiveDebounced]
  )

  const handleSortColumn = useCallback((nextSortColumn: keyof ControlObjective, nextSortType: SortType) => {
    setSortColumn(nextSortColumn)
    setSortType(nextSortType)
  }, [])

  useEffect(() => {
    if (!data.length || !getFleetSegmentsQuery.data) {
      return
    }

    const nextControlObjectivesWithMaybeFleetSegment = data
      .map(controlledObjective => {
        const foundFleetSegment = (getFleetSegmentsQuery.data ?? []).find(
          fleetSegment => fleetSegment.segment === controlledObjective.segment
        )

        return { ...controlledObjective, ...(foundFleetSegment ?? {}) } as ControlObjectiveWithMaybeFleetSegment
      })
      .slice()
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

    setControlObjectivesWithMaybeFleetSegment(nextControlObjectivesWithMaybeFleetSegment)
  }, [data, getFleetSegmentsQuery.data, sortColumn, sortType])

  if (!getFleetSegmentsQuery.data) {
    return <LoadingSpinnerWall />
  }

  const segmentsOptions = getFleetSegmentsQuery.data
    .map(segment => ({ label: segment.segment, value: segment.segment }))
    .filter(
      segment => !controlObjectivesWithMaybeFleetSegment.find(facadeSegment => facadeSegment.segment === segment.value)
    )
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <Wrapper>
      <BackOfficeTitle data-cy="control-objective-facade-title">{title}</BackOfficeTitle>
      <Table
        affixHorizontalScrollbar
        data={controlObjectivesWithMaybeFleetSegment}
        height={(controlObjectivesWithMaybeFleetSegment?.length || 0) * 40 + 60}
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
        onSortColumn={handleSortColumn as any}
        rowHeight={40}
        rowKey="id"
        sortColumn={sortColumn}
        sortType={sortType}
        width={905}
      >
        <Table.Column sortable width={100}>
          <Table.HeaderCell>Segment</Table.HeaderCell>
          <SegmentCellWithTitle dataKey="segment" />
        </Table.Column>

        <Table.Column sortable width={160}>
          <Table.HeaderCell>Nom du segment</Table.HeaderCell>
          <SegmentCellWithTitle dataKey="segmentName" />
        </Table.Column>

        <Table.Column sortable width={160}>
          <Table.HeaderCell>Obj. contrôles Port</Table.HeaderCell>
          <ModifiableCell
            dataKey="targetNumberOfControlsAtPort"
            id="id"
            inputType={INPUT_TYPE.INT}
            maxLength={3}
            onChange={(id, key, value) =>
              handleChangeModifiableKey(id, key, value, controlObjectivesWithMaybeFleetSegment)
            }
          />
        </Table.Column>

        <Table.Column sortable width={160}>
          <Table.HeaderCell>Obj. contrôles Mer</Table.HeaderCell>
          <ModifiableCell
            dataKey="targetNumberOfControlsAtSea"
            id="id"
            inputType={INPUT_TYPE.INT}
            maxLength={3}
            onChange={(id, key, value) =>
              handleChangeModifiableKey(id, key, value, controlObjectivesWithMaybeFleetSegment)
            }
          />
        </Table.Column>

        <Table.Column width={100}>
          <Table.HeaderCell>N. impact</Table.HeaderCell>
          <ImpactRiskFactorCell />
        </Table.Column>

        <Table.Column width={80}>
          <Table.HeaderCell>Priorité</Table.HeaderCell>
          <ControlPriorityCell
            dataKey="controlPriorityLevel"
            onChange={(id, key, value) =>
              handleChangeModifiableKey(id, key, value, controlObjectivesWithMaybeFleetSegment)
            }
          />
        </Table.Column>

        <Table.Column width={100}>
          <Table.HeaderCell>N. infraction</Table.HeaderCell>
          <InfringementRiskLevelCell
            dataKey="infringementRiskLevel"
            onChange={(id, key, value) =>
              handleChangeModifiableKey(id, key, value, controlObjectivesWithMaybeFleetSegment)
            }
          />
        </Table.Column>

        <Table.Column width={34}>
          <Table.HeaderCell> </Table.HeaderCell>
          <DeleteCell dataKey="id" id="id" onClick={deleteControlObjectiveRow} />
        </Table.Column>
      </Table>

      <AddSegment>
        <Label>Ajouter</Label>
        <Select
          data-cy="add-control-objective"
          isLabelHidden
          isTransparent
          label="Ajouter un objectif"
          name="AddSegment"
          onChange={segment => addSegmentToFacade(segment)}
          options={segmentsOptions}
          placeholder="segment"
          searchable
          style={{ width: 120 }}
          value={undefined}
        />
      </AddSegment>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-left: 40px;
  margin-top: 32px;
  margin-bottom: 10px;
`

const AddSegment = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 8px;
`
