import { BackOfficeTitle } from '@features/BackOffice/components/BackOfficeTitle'
import {
  DeleteCell,
  ImpactRiskFactorCell,
  INPUT_TYPE,
  ModifiableCell,
  SegmentCellWithTitle
} from '@features/ControlObjective/components/ControlObjectiveTable/tableCells'
import { Label, Select } from '@mtes-mct/monitor-ui'
import { Table } from 'rsuite'
import styled from 'styled-components'

import { ControlPriorityCell } from './ControlPriorityCell'
import { useSeafrontControlObjectives } from './hooks/useSeafrontControlObjectives'
import { InfringementRiskLevelCell } from './InfringementRiskLevelCell'
import { LoadingSpinnerWall } from '../../../../ui/LoadingSpinnerWall'

import type { ControlObjective } from '../../types'

export type SeafrontControlObjectivesProps = Readonly<{
  data: ControlObjective[]
  facade: string
  title: string
  year: number
}>

export function SeafrontControlObjectives({ data, facade, title, year }: SeafrontControlObjectivesProps) {
  const {
    addSegment,
    controlObjectives,
    deleteRow,
    handleSort,
    isLoading,
    segmentsOptions,
    sortColumn,
    sortType,
    updateField
  } = useSeafrontControlObjectives(data, facade, year)

  if (isLoading) {
    return <LoadingSpinnerWall />
  }

  return (
    <Wrapper>
      <BackOfficeTitle data-cy="control-objective-facade-title">{title}</BackOfficeTitle>
      <Table
        affixHorizontalScrollbar
        data={controlObjectives}
        height={(controlObjectives?.length || 0) * 40 + 60}
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
        onSortColumn={handleSort as any}
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
            onChange={updateField}
          />
        </Table.Column>

        <Table.Column sortable width={160}>
          <Table.HeaderCell>Obj. contrôles Mer</Table.HeaderCell>
          <ModifiableCell
            dataKey="targetNumberOfControlsAtSea"
            id="id"
            inputType={INPUT_TYPE.INT}
            maxLength={3}
            onChange={updateField}
          />
        </Table.Column>

        <Table.Column width={100}>
          <Table.HeaderCell>N. impact</Table.HeaderCell>
          <ImpactRiskFactorCell />
        </Table.Column>

        <Table.Column width={80}>
          <Table.HeaderCell>Priorité</Table.HeaderCell>
          <ControlPriorityCell dataKey="controlPriorityLevel" onChange={updateField} />
        </Table.Column>

        <Table.Column width={100}>
          <Table.HeaderCell>N. infraction</Table.HeaderCell>
          <InfringementRiskLevelCell dataKey="infringementRiskLevel" onChange={updateField} />
        </Table.Column>

        <Table.Column width={34}>
          <Table.HeaderCell> </Table.HeaderCell>
          <DeleteCell dataKey="id" id="id" onClick={deleteRow} />
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
          onChange={addSegment}
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
