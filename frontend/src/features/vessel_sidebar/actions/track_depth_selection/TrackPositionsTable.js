import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Table from 'rsuite/lib/Table'
import { transform } from 'ol/proj'
import { useDispatch, useSelector } from 'react-redux'
import { sortArrayByColumn, SortType } from '../../../vessel_list/tableSort'
import { getCoordinates } from '../../../../coordinates'
import { highlightVesselTrackPosition } from '../../../../domain/shared_slices/Vessel'
import { CSVOptions } from '../../../vessel_list/dataFormatting'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map'
import { animateToCoordinates } from '../../../../domain/shared_slices/Map'
import { useClickOutsideComponent } from '../../../../hooks/useClickOutside'
import { ReactComponent as ManualPositionSVG } from '../../../icons/Pastille_position_manuelle.svg'

const { Column, HeaderCell, Cell } = Table

const TrackPositionsTable = () => {
  const dispatch = useDispatch()
  const { coordinatesFormat } = useSelector(state => state.map)
  const { selectedVesselPositions, highlightedVesselTrackPosition } = useSelector(state => state.vessel)

  const [sortColumn, setSortColumn] = useState(CSVOptions.dateTime.code)
  const [sortType, setSortType] = useState(SortType.DESC)
  const [positions, setPositions] = useState()
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      highlightedVesselTrackPosition && dispatch(highlightVesselTrackPosition(null))
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (selectedVesselPositions?.length) {
      setPositions(selectedVesselPositions)
    } else {
      setPositions([])
    }
  }, [selectedVesselPositions])

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
    <div ref={wrapperRef}>
      <Table
        virtualized
        height={400}
        data={getPositions()}
        rowHeight={36}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        shouldUpdateScroll={false}
      >
        <Column width={175} fixed sortable>
          <HeaderCell>GDH</HeaderCell>
          <DateTimeCell dispatch={dispatch} dataKey="dateTime" coordinatesFormat={coordinatesFormat}/>
        </Column>
        <Column width={70} fixed sortable>
          <HeaderCell>Vitesse</HeaderCell>
          <SpeedCell dispatch={dispatch} dataKey="speed" coordinatesFormat={coordinatesFormat}/>
        </Column>
        <Column width={60} fixed sortable>
          <HeaderCell>Cap</HeaderCell>
          <CourseCell dispatch={dispatch} dataKey="course" coordinatesFormat={coordinatesFormat}/>
        </Column>
      </Table>
    </div>
  )
}

export const SpeedCell = ({ coordinatesFormat, rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat) : ''
  const olCoordinates = rowData ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION) : []

  return (
    <Cell
      {...props}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
    >
      {
        Number.isNaN(parseFloat(rowData[dataKey]))
          ? ''
          : `${rowData[dataKey]} nds`
      }

    </Cell>
  )
}

export const CourseCell = ({ coordinatesFormat, rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat) : ''
  const olCoordinates = rowData ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION) : []

  return (
    <Cell
      {...props}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
    >
      { rowData[dataKey] || rowData[dataKey] === 0 ? `${rowData[dataKey]}°` : '' }
    </Cell>
  )
}

export const DateTimeCell = ({ coordinatesFormat, rowData, dataKey, dispatch, ...props }) => {
  const coordinates = rowData ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat) : ''
  const olCoordinates = rowData ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION) : []

  let dateTimeStringWithoutMilliSeconds = rowData[dataKey].split('.')[0]
  if (rowData[dataKey].includes('Z') && !dateTimeStringWithoutMilliSeconds.includes('Z')) {
    dateTimeStringWithoutMilliSeconds += 'Z'
  } else if (rowData[dataKey].includes('+') && !dateTimeStringWithoutMilliSeconds.includes('+')) {
    dateTimeStringWithoutMilliSeconds += '+' + rowData[dataKey].split('+')[1]
  }

  return (
    <Cell
      {...props}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
    >
      { dateTimeStringWithoutMilliSeconds } { rowData.isManual ? <ManualPosition title={'Position manuelle (4h-report)'}/> : '' }
    </Cell>
  )
}

const ManualPosition = styled(ManualPositionSVG)`
  vertical-align: sub;
  margin-left: 3px;
`

export default TrackPositionsTable
