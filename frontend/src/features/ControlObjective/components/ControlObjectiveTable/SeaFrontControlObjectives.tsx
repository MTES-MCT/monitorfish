import { useCallback, useEffect, useState } from 'react'
import { SelectPicker, Table } from 'rsuite'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { useGetFleetSegmentsQuery } from '../../../../api/fleetSegment'
import { COLORS } from '../../../../constants/constants'
import { LoadingSpinnerWall } from '../../../../ui/LoadingSpinnerWall'
import {
  ControlPriorityCell,
  DeleteCell,
  ExpandCell,
  ImpactRiskFactorCell,
  INPUT_TYPE,
  ModifiableCell,
  renderRowExpanded,
  SegmentCellWithTitle
} from '../../../Backoffice/tableCells'
import { sortArrayByColumn, SortType } from '../../../VesselList/tableSort'
import {
  useAddControlObjectiveMutation,
  useDeleteControlObjectiveMutation,
  useUpdateControlObjectiveMutation
} from '../../apis'

import type { FleetSegment } from '../../../../domain/types/fleetSegment'
import type { ControlObjective } from '../../types'

type ControlObjectiveWithMaybeFleetSegment = ControlObjective &
  Partial<FleetSegment> & {
    controlPriorityLevel?: number
  }

export type SeaFrontControlObjectivesProps = {
  data: ControlObjective[]
  facade: string
  title: string
  year: number
}
export function SeaFrontControlObjectives({ data, facade, title, year }: SeaFrontControlObjectivesProps) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([])
  const [controlObjectivesWithMaybeFleetSegment, setControlObjectivesWithMaybeFleetSegment] = useState<
    ControlObjectiveWithMaybeFleetSegment[]
  >([])
  const [sortColumn, setSortColumn] = useState<keyof ControlObjective>('segment')
  const [sortType, setSortType] = useState(SortType.ASC)
  const [segmentToAddToFacade, setSegmentToAddToFacade] = useState<string | undefined>(undefined)

  const getFleetSegmentsQuery = useGetFleetSegmentsQuery()

  const [updateControlObjective] = useUpdateControlObjectiveMutation()

  const [addControlObjective] = useAddControlObjectiveMutation()

  const [deleteControlObjective] = useDeleteControlObjectiveMutation()

  const addSegmentToFacade = useCallback(
    async (nextSegment: string) => {
      if (!getFleetSegmentsQuery.data) {
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
          segment: nextSegment,
          target: 1,
          targetNumberOfControlsAtPort: 0,
          targetNumberOfControlsAtSea: 0,
          year,
          ...(foundFleetSegment || {})
        } as unknown as ControlObjectiveWithMaybeFleetSegment
      ]

      const sortedNextDataWithSegmentDetails = nextControlObjectiveWithFleetSegment.sort((a, b) =>
        sortArrayByColumn(a, b, sortColumn, sortType)
      )

      setControlObjectivesWithMaybeFleetSegment(sortedNextDataWithSegmentDetails)
      setSegmentToAddToFacade(undefined)
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
      value,
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

  // TODO Make that functional programming friendly.
  const handleExpanded = useCallback(
    (rowData: ControlObjectiveWithMaybeFleetSegment) => {
      let open = false
      const nextExpandedRowKeys: number[] = []

      expandedRowKeys.forEach(id => {
        if (id === rowData.id) {
          open = true
        } else {
          nextExpandedRowKeys.push(id)
        }
      })

      if (!open) {
        nextExpandedRowKeys.push(rowData.id)
      }

      setExpandedRowKeys(nextExpandedRowKeys)
    },
    [expandedRowKeys]
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
        const foundFleetSegment = (getFleetSegmentsQuery.data || []).find(
          fleetSegment => fleetSegment.segment === controlledObjective.segment
        )

        return { ...controlledObjective, ...(foundFleetSegment || {}) } as ControlObjectiveWithMaybeFleetSegment
      })
      .slice()
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

    setControlObjectivesWithMaybeFleetSegment(nextControlObjectivesWithMaybeFleetSegment)
  }, [data, getFleetSegmentsQuery.data, sortColumn, sortType])

  useEffect(() => {
    if (!segmentToAddToFacade) {
      return
    }

    addSegmentToFacade(segmentToAddToFacade)
  }, [addSegmentToFacade, segmentToAddToFacade])

  if (!getFleetSegmentsQuery.data) {
    return <LoadingSpinnerWall />
  }

  return (
    <Wrapper>
      <Title data-cy="control-objective-facade-title">{title}</Title>
      <br />
      <Table
        affixHorizontalScrollbar
        data={controlObjectivesWithMaybeFleetSegment}
        expandedRowKeys={expandedRowKeys}
        height={(controlObjectivesWithMaybeFleetSegment?.length || 0) * 36 + expandedRowKeys.length * 125 + 60}
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
        onSortColumn={handleSortColumn as any}
        renderRowExpanded={renderRowExpanded}
        rowExpandedHeight={125}
        rowHeight={36}
        rowKey="id"
        sortColumn={sortColumn}
        sortType={sortType}
        width={720}
      >
        <Table.Column align="center" width={50}>
          <Table.HeaderCell> </Table.HeaderCell>
          <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded} />
        </Table.Column>

        <Table.Column sortable width={100}>
          <Table.HeaderCell>Segment</Table.HeaderCell>
          <SegmentCellWithTitle dataKey="segment" />
        </Table.Column>

        <Table.Column sortable width={130}>
          <Table.HeaderCell>Nom du segment</Table.HeaderCell>
          <SegmentCellWithTitle dataKey="segmentName" />
        </Table.Column>

        <Table.Column sortable width={140}>
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

        <Table.Column sortable width={140}>
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

        <Table.Column width={70}>
          <Table.HeaderCell>N. impact</Table.HeaderCell>
          <ImpactRiskFactorCell />
        </Table.Column>

        <Table.Column width={55}>
          <Table.HeaderCell>Priorité</Table.HeaderCell>
          <ControlPriorityCell
            dataKey="controlPriorityLevel"
            onChange={(id, key, value) =>
              handleChangeModifiableKey(id, key, value, controlObjectivesWithMaybeFleetSegment)
            }
          />
        </Table.Column>

        <Table.Column width={30}>
          <Table.HeaderCell> </Table.HeaderCell>
          <DeleteCell dataKey="id" id="id" onClick={deleteControlObjectiveRow} />
        </Table.Column>
      </Table>
      <AddSegment>
        Ajouter
        <SelectPicker
          data={getFleetSegmentsQuery.data
            .map(segment => ({ label: segment.segment, value: segment.segment }))
            .filter(
              segment =>
                !controlObjectivesWithMaybeFleetSegment.find(facadeSegment => facadeSegment.segment === segment.value)
            )
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))}
          data-cy="add-control-objective"
          onChange={segment => setSegmentToAddToFacade(segment || undefined)}
          placeholder="segment"
          placement="auto"
          searchable
          style={{ margin: '0px 10px 10px 10px', width: 70 }}
          value={segmentToAddToFacade}
        />
      </AddSegment>
    </Wrapper>
  )
}

const AddSegment = styled.div`
  text-align: left;
  margin-left: 5px;
  margin-top: -10px;
  line-height: 10px;
  width: fit-content;
  color: ${COLORS.gunMetal};
`

const Wrapper = styled.div`
  margin-left: 40px;
  margin-top: 10px;
  margin-bottom: 10px;

  .rs-picker-input {
    border: none;
    margin-left: 7px;
    margin-top: -3px;
  }

  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
  }

  .rs-picker-has-value .rs-btn .rs-picker-toggle-value,
  .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.charcoal};
  }

  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }

  .rs-input:focus {
    background: ${COLORS.charcoal};
    color: ${COLORS.white};
  }
`

const Title = styled.h2`
  font-size: 16px;
  color: #282f3e;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`
