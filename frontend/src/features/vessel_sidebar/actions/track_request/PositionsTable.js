import { transform } from 'ol/proj'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table } from 'rsuite'
import styled from 'styled-components'

import { getCoordinates } from '../../../../coordinates'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map'
import { animateToCoordinates } from '../../../../domain/shared_slices/Map'
import { highlightVesselTrackPosition } from '../../../../domain/shared_slices/Vessel'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { ReactComponent as ManualPositionSVG } from '../../../icons/Pastille_position_manuelle.svg'
import { CSVOptions } from '../../../vessel_list/dataFormatting'
import { sortArrayByColumn, SortType } from '../../../vessel_list/tableSort'

const { Cell, Column, HeaderCell } = Table

function PositionsTable({ openBox }) {
  const dispatch = useDispatch()
  const { coordinatesFormat } = useSelector(state => state.map)
  const { highlightedVesselTrackPosition, selectedVesselPositions } = useSelector(state => state.vessel)

  const [sortColumn, setSortColumn] = useState(CSVOptions.dateTime.code)
  const [sortType, setSortType] = useState(SortType.DESC)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, openBox)

  useEffect(() => {
    if (clickedOutsideComponent) {
      highlightedVesselTrackPosition && dispatch(highlightVesselTrackPosition(null))
    }
  }, [clickedOutsideComponent])

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  const getPositions = useCallback(() => {
    if (sortColumn && sortType && Array.isArray(selectedVesselPositions)) {
      return selectedVesselPositions.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
    }

    return []
  }, [sortColumn, sortType, selectedVesselPositions])

  return (
    <div ref={wrapperRef}>
      <Table
        data={getPositions()}
        height={400}
        onSortColumn={handleSortColumn}
        rowHeight={36}
        shouldUpdateScroll={false}
        sortColumn={sortColumn}
        sortType={sortType}
        virtualized
      >
        <Column fixed sortable width={175}>
          <HeaderCell>GDH</HeaderCell>
          <DateTimeCell coordinatesFormat={coordinatesFormat} dataKey="dateTime" dispatch={dispatch} />
        </Column>
        <Column fixed sortable width={70}>
          <HeaderCell>Vitesse</HeaderCell>
          <SpeedCell coordinatesFormat={coordinatesFormat} dataKey="speed" dispatch={dispatch} />
        </Column>
        <Column fixed sortable width={60}>
          <HeaderCell>Cap</HeaderCell>
          <CourseCell coordinatesFormat={coordinatesFormat} dataKey="course" dispatch={dispatch} />
        </Column>
      </Table>
    </div>
  )
}

export function SpeedCell({ coordinatesFormat, dataKey, dispatch, rowData, ...props }) {
  const coordinates = rowData
    ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat)
    : ''
  const olCoordinates = rowData
    ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    : []

  return (
    <Cell
      {...props}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {Number.isNaN(parseFloat(rowData[dataKey])) ? '' : `${rowData[dataKey]} nds`}
    </Cell>
  )
}

export function CourseCell({ coordinatesFormat, dataKey, dispatch, rowData, ...props }) {
  const coordinates = rowData
    ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat)
    : ''
  const olCoordinates = rowData
    ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    : []

  return (
    <Cell
      {...props}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {rowData[dataKey] || rowData[dataKey] === 0 ? `${rowData[dataKey]}°` : ''}
    </Cell>
  )
}

export function DateTimeCell({ coordinatesFormat, dataKey, dispatch, rowData, ...props }) {
  const coordinates = rowData
    ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat)
    : ''
  const olCoordinates = rowData
    ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    : []

  let dateTimeStringWithoutMilliSeconds = rowData[dataKey].split('.')[0]
  if (rowData[dataKey].includes('Z') && !dateTimeStringWithoutMilliSeconds.includes('Z')) {
    dateTimeStringWithoutMilliSeconds += 'Z'
  } else if (rowData[dataKey].includes('+') && !dateTimeStringWithoutMilliSeconds.includes('+')) {
    dateTimeStringWithoutMilliSeconds += `+${rowData[dataKey].split('+')[1]}`
  }

  return (
    <Cell
      {...props}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {dateTimeStringWithoutMilliSeconds}{' '}
      {rowData.isManual ? <ManualPosition title="Position manuelle (4h-report)" /> : ''}
    </Cell>
  )
}

const ManualPosition = styled(ManualPositionSVG)`
  vertical-align: sub;
  margin-left: 3px;
`

export default PositionsTable
