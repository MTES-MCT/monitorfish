import { POSITION_TABLE_COLUMNS } from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/constants'
import { useClickOutsideWhenOpened } from '@hooks/useClickOutsideWhenOpened'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DataTable } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { highlightVesselTrackPosition } from '../../../../../slice'

export function PositionsTable({ openBox }) {
  const dispatch = useMainAppDispatch()
  const { highlightedVesselTrackPosition, selectedVesselPositions } = useMainAppSelector(state => state.vessel)

  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, openBox)

  useEffect(() => {
    if (clickedOutsideComponent && highlightedVesselTrackPosition) {
      dispatch(highlightVesselTrackPosition(null))
    }
  }, [clickedOutsideComponent, dispatch, highlightedVesselTrackPosition])

  return (
    <Wrapper ref={wrapperRef} $isEmpty={!selectedVesselPositions?.length}>
      <DataTable
        // TODO Why `accessorFn` is not defined ?
        columns={POSITION_TABLE_COLUMNS as any}
        data={selectedVesselPositions?.map((position, index) => ({
          ...position,
          id: index
        }))}
        emptyLabel="Aucune position"
        initialSorting={[{ desc: true, id: 'dateTime' }]}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isEmpty: boolean
}>`
  padding: ${p => (p.$isEmpty ? 12 : 0)}px;
  max-height: 500px;
  overflow: auto;
  text-align: center;
`
