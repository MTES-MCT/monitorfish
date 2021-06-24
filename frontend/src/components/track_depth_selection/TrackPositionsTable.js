import React, { useCallback, useEffect } from 'react'
import Table from 'rsuite/lib/Table'
import { useDispatch, useSelector } from 'react-redux'
import { sortArrayByColumn, SortType } from '../vessel_list/tableSort'
import { getCoordinates } from '../../utils'
import { highlightVesselTrackPosition } from '../../domain/reducers/Vessel'
import { CSVOptions } from '../vessel_list/dataFormatting'
import { WSG84_PROJECTION } from '../../domain/entities/map'

const { Column, HeaderCell, Cell } = Table

const TrackPositionsTable = () => {
  const dispatch = useDispatch()
  const { selectedVessel } = useSelector(state => state.vessel)

  const [sortColumn, setSortColumn] = React.useState(CSVOptions.dateTime.code)
  const [sortType, setSortType] = React.useState(SortType.DESC)
  const [positions, setPositions] = React.useState()

  useEffect(() => {
    if (selectedVessel) {
      setPositions(selectedVessel.positions)
    } else {
      setPositions([])
    }
  }, [selectedVessel])

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  const getPositions = useCallback(() => {
    if (sortColumn && sortType && Array.isArray(positions)) {
      return positions
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
    }

    return positions
  }, [sortColumn, sortType, positions])

  return (
    <Table
      height={400}
      data={getPositions()}
      rowHeight={36}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={handleSortColumn}
    >
      <Column width={150} fixed sortable>
        <HeaderCell>GDH</HeaderCell>
        <DateTimeCell dispatch={dispatch} dataKey="dateTime" />
      </Column>
      <Column width={70} fixed sortable>
        <HeaderCell>Vitesse</HeaderCell>
        <SpeedCell dispatch={dispatch} dataKey="speed" />
      </Column>
      <Column width={60} fixed sortable>
        <HeaderCell>Cap</HeaderCell>
        <CourseCell dispatch={dispatch} dataKey="course" />
      </Column>
    </Table>
  )
}

export const SpeedCell = ({ rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION) : ''

  return (
    <Cell
      {...props}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}>
      { rowData[dataKey] } nds
    </Cell>
  )
}

export const CourseCell = ({ rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION) : ''

  return (
    <Cell
      {...props}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}>
      { rowData[dataKey] || rowData[dataKey] === 0 ? `${rowData[dataKey]}°` : '' }
    </Cell>
  )
}

export const DateTimeCell = ({ rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION) : ''

  return (
    <Cell
      {...props}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}>
      { rowData[dataKey].split('.')[0] + 'Z' }
    </Cell>
  )
}

export default TrackPositionsTable
