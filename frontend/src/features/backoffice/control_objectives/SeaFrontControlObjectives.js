import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SelectPicker, Table } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import addControlObjective from '../../../domain/use_cases/controlObjective/addControlObjective'
import deleteControlObjective from '../../../domain/use_cases/controlObjective/deleteControlObjective'
import updateControlObjective from '../../../domain/use_cases/controlObjective/updateControlObjective'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import {
  ControlPriorityCell,
  DeleteCell,
  ExpandCell,
  ImpactRiskFactorCell,
  INPUT_TYPE,
  ModifiableCell,
  renderRowExpanded,
  SegmentCellWithTitle,
} from '../tableCells'

const { Column, HeaderCell } = Table
const rowKey = 'id'

function SeaFrontControlObjectives({ data, facade, title, year }) {
  const dispatch = useDispatch()
  const { fleetSegments } = useSelector(state => state.fleetSegment)

  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [dataWithSegmentDetails, setDataWithSegmentDetails] = useState([])
  const [sortColumn, setSortColumn] = useState('segment')
  const [sortType, setSortType] = useState(SortType.ASC)
  const [segmentToAddToFacade, setSegmentToAddToFacade] = useState(null)

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  useEffect(() => {
    if (data?.length) {
      const dataWithSegmentDetails = data
        .map(row => {
          const segment = fleetSegments?.find(segment => segment.segment === row.segment)

          return { ...row, ...segment }
        })
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setDataWithSegmentDetails(dataWithSegmentDetails)
    }
  }, [data, sortColumn, sortType, fleetSegments])

  useEffect(() => {
    if (segmentToAddToFacade) {
      function addSegmentToFacade() {
        let nextDataWithSegmentDetails = Object.assign([], dataWithSegmentDetails)

        dispatch(addControlObjective(segmentToAddToFacade, facade, year)).then(id => {
          const segment = fleetSegments?.find(segment => segment.segment === segmentToAddToFacade)
          nextDataWithSegmentDetails = nextDataWithSegmentDetails.concat({
            controlPriorityLevel: 1,
            facade,
            id,
            segment: segmentToAddToFacade,
            target: 1,
            targetNumberOfControlsAtPort: 0,
            targetNumberOfControlsAtSea: 0,
            year,
            ...segment,
          })

          nextDataWithSegmentDetails.sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
          setDataWithSegmentDetails(nextDataWithSegmentDetails)
        })

        setSegmentToAddToFacade(null)
      }

      addSegmentToFacade()
    }
  }, [segmentToAddToFacade, facade, facade])

  const handleExpanded = (rowData, dataKey) => {
    let open = false
    const nextExpandedRowKeys = []

    expandedRowKeys.forEach(key => {
      if (key === rowData[rowKey]) {
        open = true
      } else {
        nextExpandedRowKeys.push(key)
      }
    })

    if (!open) {
      nextExpandedRowKeys.push(rowData[rowKey])
    }

    setExpandedRowKeys(nextExpandedRowKeys)
  }

  const handleChangeModifiableKey = (id, key, value, sortColumn, sortType) => {
    const nextDataWithSegmentDetails = Object.assign([], dataWithSegmentDetails)
    const previousDataWithSegmentDetails = dataWithSegmentDetails

    const updateJSON = {
      controlPriorityLevel: null,
      targetNumberOfControlsAtPort: null,
      targetNumberOfControlsAtSea: null,
    }
    updateJSON[key] = value

    nextDataWithSegmentDetails.find(item => item.id === id)[key] = value
    nextDataWithSegmentDetails.sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
    setDataWithSegmentDetails(nextDataWithSegmentDetails)
    dispatch(updateControlObjective(id, updateJSON)).catch(() => {
      setDataWithSegmentDetails(previousDataWithSegmentDetails)
    })
  }

  const deleteControlObjectiveRow = (id, key, sortColumn, sortType) => {
    let nextDataWithSegmentDetails = Object.assign([], dataWithSegmentDetails)

    dispatch(deleteControlObjective(id)).then(() => {
      nextDataWithSegmentDetails = nextDataWithSegmentDetails.filter(item => item.id !== id)
      nextDataWithSegmentDetails.sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
      setDataWithSegmentDetails(nextDataWithSegmentDetails)
    })
  }

  return (
    <Wrapper>
      <Title>{title}</Title>
      <br />
      <Table
        affixHorizontalScrollbar
        data={dataWithSegmentDetails}
        expandedRowKeys={expandedRowKeys}
        height={(dataWithSegmentDetails?.length || 0) * 36 + expandedRowKeys.length * 125 + 60}
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...',
        }}
        onSortColumn={handleSortColumn}
        renderRowExpanded={renderRowExpanded}
        rowExpandedHeight={125}
        rowHeight={36}
        rowKey={rowKey}
        sortColumn={sortColumn}
        sortType={sortType}
        width={720}
      >
        <Column align="center" width={50}>
          <HeaderCell />
          <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded} />
        </Column>

        <Column sortable width={100}>
          <HeaderCell>Segment</HeaderCell>
          <SegmentCellWithTitle dataKey="segment" />
        </Column>

        <Column sortable width={130}>
          <HeaderCell>Nom du segment</HeaderCell>
          <SegmentCellWithTitle dataKey="segmentName" />
        </Column>

        <Column sortable width={140}>
          <HeaderCell>Obj. contrôles Port</HeaderCell>
          <ModifiableCell
            dataKey="targetNumberOfControlsAtPort"
            id="id"
            inputType={INPUT_TYPE.INT}
            maxLength={3}
            onChange={(id, key, value) => handleChangeModifiableKey(id, key, value, sortColumn, sortType)}
          />
        </Column>

        <Column sortable width={140}>
          <HeaderCell>Obj. contrôles Mer</HeaderCell>
          <ModifiableCell
            dataKey="targetNumberOfControlsAtSea"
            id="id"
            inputType={INPUT_TYPE.INT}
            maxLength={3}
            onChange={(id, key, value) => handleChangeModifiableKey(id, key, value, sortColumn, sortType)}
          />
        </Column>

        <Column width={70}>
          <HeaderCell>N. impact</HeaderCell>
          <ImpactRiskFactorCell />
        </Column>

        <Column width={55}>
          <HeaderCell>Priorité</HeaderCell>
          <ControlPriorityCell
            dataKey="controlPriorityLevel"
            onChange={(id, key, value) => handleChangeModifiableKey(id, key, value, sortColumn, sortType)}
          />
        </Column>

        <Column width={30}>
          <HeaderCell />
          <DeleteCell
            dataKey="id"
            id="id"
            onClick={(id, key) => deleteControlObjectiveRow(id, key, sortColumn, sortType)}
          />
        </Column>
      </Table>
      <AddSegment>
        Ajouter
        <SelectPicker
          data={fleetSegments
            ?.map(segment => ({ label: segment.segment, value: segment.segment }))
            .filter(segment => !dataWithSegmentDetails.find(facadeSegment => facadeSegment.segment === segment.value))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))}
          data-cy="add-control-objective"
          onChange={segment => setSegmentToAddToFacade(segment)}
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
    color: ${COLORS.background};
  }
`

const Title = styled.h2`
  font-size: 16px;
  color: #282f3e;
  border-bottom: 2px solid ${COLORS.squareBorder};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`

export default SeaFrontControlObjectives
