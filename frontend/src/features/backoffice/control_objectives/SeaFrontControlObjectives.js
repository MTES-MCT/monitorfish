import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Table from 'rsuite/lib/Table'
import { useDispatch, useSelector } from 'react-redux'
import { ControlPriorityCell, ExpandCell, ImpactRiskFactorCell, ModifiableCell, renderRowExpanded } from './tableCells'
import { CellWithTitle } from '../../vessel_list/tableCells'
import updateControlObjective from '../../../domain/use_cases/updateControlObjective'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'

const { Column, HeaderCell } = Table
const rowKey = 'id'

const SeaFrontControlObjectives = ({ title, data }) => {
  const dispatch = useDispatch()
  const { fleetSegments } = useSelector(state => state.fleetSegment)

  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [dataWithSegmentDetails, setDataWithSegmentDetails] = React.useState([])
  const [sortColumn, setSortColumn] = React.useState('segment')
  const [sortType, setSortType] = React.useState(SortType.ASC)

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  useEffect(() => {
    if (data?.length) {
      const dataWithSegmentDetails = data.map(row => {
        const segment = fleetSegments?.find(segment => segment.segment === row.segment)

        return { ...row, ...segment }
      }).slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setDataWithSegmentDetails(dataWithSegmentDetails)
    }
  }, [data, sortColumn, sortType])

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

  const handleChangeModifiableKey = (id, key, value) => {
    const nextDataWithSegmentDetails = Object.assign([], dataWithSegmentDetails)

    const updateJSON = {
      targetNumberOfControlsAtSea: null,
      targetNumberOfControlsAtPort: null,
      controlPriorityLevel: null
    }
    updateJSON[key] = value || 0

    dispatch(updateControlObjective(id, updateJSON)).then(() => {
      nextDataWithSegmentDetails.find(item => item.id === id)[key] = value
      setDataWithSegmentDetails(nextDataWithSegmentDetails)
    })
  }

  return (
    <Wrapper>
      <Title>{title}</Title><br/>
      <Table
        height={(dataWithSegmentDetails?.length || 0) * 36 + expandedRowKeys.length * 95 + 65}
        width={765}
        data={dataWithSegmentDetails}
        rowKey={rowKey}
        expandedRowKeys={expandedRowKeys}
        renderRowExpanded={renderRowExpanded}
        rowExpandedHeight={125}
        rowHeight={36}
        affixHorizontalScrollbar
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
      >
        <Column width={50} align="center">
          <HeaderCell/>
          <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded}/>
        </Column>

        <Column sortable width={100}>
          <HeaderCell>Segment</HeaderCell>
          <CellWithTitle dataKey="segment"/>
        </Column>

        <Column sortable width={160}>
          <HeaderCell>Nom du segment</HeaderCell>
          <CellWithTitle dataKey="segmentName"/>
        </Column>

        <Column sortable width={160}>
          <HeaderCell>Obj. contrôles au Port</HeaderCell>
          <ModifiableCell
            dataKey={'targetNumberOfControlsAtPort'}
            onChange={handleChangeModifiableKey}
          />
        </Column>

        <Column sortable width={160}>
          <HeaderCell>Obj. contrôles en Mer</HeaderCell>
          <ModifiableCell
            dataKey={'targetNumberOfControlsAtSea'}
            onChange={handleChangeModifiableKey}
          />
        </Column>

        <Column width={70}>
          <HeaderCell>N. impact</HeaderCell>
          <ImpactRiskFactorCell/>
        </Column>

        <Column width={60}>
          <HeaderCell>Priorité</HeaderCell>
          <ControlPriorityCell
            dataKey={'controlPriorityLevel'}
            onChange={handleChangeModifiableKey}
          />
        </Column>
      </Table>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-left: 40px;
  margin-top: 20px;
  
  .rs-picker-input {
    border: none;
    margin-left: 7px;
    margin-top: -3px;
  }
  
  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
  }
  
  .rs-picker-has-value .rs-btn .rs-picker-toggle-value, .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.charcoal};
  }
  
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }
`

const Title = styled.h2`
  font-size: 16px;
  color: #282F3E;
  border-bottom: 2px solid #E0E0E0;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`

export default SeaFrontControlObjectives
