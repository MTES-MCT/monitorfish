import { transform } from 'ol/proj'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Table } from 'rsuite'
import styled from 'styled-components'

import { getCoordinates } from '../../../../coordinates'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map'
import { animateToCoordinates } from '../../../../domain/shared_slices/Map'
import { highlightVesselTrackPosition } from '../../../../domain/shared_slices/Vessel'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { ReactComponent as ManualPositionSVG } from '../../../icons/Pastille_position_manuelle.svg'
import { CSVOptions } from '../../../vessel_list/dataFormatting'
import { sortArrayByColumn, SortType } from '../../../vessel_list/tableSort'

import type { CellProps } from 'rsuite'

const { Cell, Column, HeaderCell } = Table

export function PositionsTable({ openBox }) {
  const dispatch = useAppDispatch()
  const { coordinatesFormat } = useAppSelector(state => state.map)
  const { highlightedVesselTrackPosition, selectedVesselPositions } = useAppSelector(state => state.vessel)

  const [sortColumn, setSortColumn] = useState(CSVOptions.dateTime.code)
  const [sortType, setSortType] = useState(SortType.DESC)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, openBox)

  const handleSortColumn = useCallback((nextSortColumn, nextSortType) => {
    setSortColumn(nextSortColumn)
    setSortType(nextSortType)
  }, [])

  const getPositions = useCallback(() => {
    if (sortColumn && sortType && Array.isArray(selectedVesselPositions)) {
      return selectedVesselPositions.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
    }

    return []
  }, [sortColumn, sortType, selectedVesselPositions])

  useEffect(() => {
    if (clickedOutsideComponent && highlightedVesselTrackPosition) {
      dispatch(highlightVesselTrackPosition(null))
    }
  }, [clickedOutsideComponent, dispatch, highlightedVesselTrackPosition])

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
        <Column flexGrow={1} sortable>
          <HeaderCell>GDH</HeaderCell>
          <DateTimeCell coordinatesFormat={coordinatesFormat} dataKey="dateTime" />
        </Column>
        <Column fixed sortable width={100}>
          <HeaderCell>Vitesse</HeaderCell>
          <SpeedCell coordinatesFormat={coordinatesFormat} dataKey="speed" />
        </Column>
        <Column fixed sortable width={100}>
          <HeaderCell>Cap</HeaderCell>
          <CourseCell coordinatesFormat={coordinatesFormat} dataKey="course" />
        </Column>
      </Table>
    </div>
  )
}

type SpeedCellProps = CellProps & {
  coordinatesFormat: string
  dataKey: string
  rowData?: {
    latitude: number
    longitude: number
  }
}
export function SpeedCell({ coordinatesFormat, dataKey, rowData, ...nativeProps }: SpeedCellProps) {
  const dispatch = useAppDispatch()

  const coordinates = rowData
    ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat)
    : ''
  const olCoordinates = rowData
    ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    : []

  return (
    <Cell
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...nativeProps}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {Number.isNaN(parseFloat(rowData[dataKey])) ? '' : `${rowData[dataKey]} nds`}
    </Cell>
  )
}

type CourseCellProps = CellProps & {
  coordinatesFormat: string
  dataKey: string
  rowData?: {
    latitude: number
    longitude: number
  }
}
export function CourseCell({ coordinatesFormat, dataKey, rowData, ...nativeProps }: CourseCellProps) {
  const dispatch = useAppDispatch()

  const coordinates = rowData
    ? getCoordinates([rowData.longitude, rowData.latitude], WSG84_PROJECTION, coordinatesFormat)
    : ''
  const olCoordinates = rowData
    ? transform([rowData.longitude, rowData.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    : []

  return (
    <Cell
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...nativeProps}
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(rowData))}
      style={{ cursor: 'pointer' }}
      title={rowData && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {rowData[dataKey] || rowData[dataKey] === 0 ? `${rowData[dataKey]}°` : ''}
    </Cell>
  )
}

type DateTimeCellProps = CellProps & {
  coordinatesFormat: string
  dataKey: string
  rowData?: {
    latitude: number
    longitude: number
  }
}
export function DateTimeCell({ coordinatesFormat, dataKey, rowData, ...nativeProps }: DateTimeCellProps) {
  const dispatch = useAppDispatch()

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
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...nativeProps}
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
