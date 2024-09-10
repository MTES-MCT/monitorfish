import { POSITION_TABLE_COLUMNS } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/constants'
import { useClickOutsideWhenOpened } from '@hooks/useClickOutsideWhenOpened'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DataTable } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { highlightVesselTrackPosition } from '../../../../../../domain/shared_slices/Vessel'

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
    <Wrapper ref={wrapperRef}>
      <DataTable
        // TODO Why `accessorFn` is not defined ?
        columns={POSITION_TABLE_COLUMNS as any}
        data={selectedVesselPositions?.map((position, index) => ({
          ...position,
          id: index
        }))}
        initialSorting={[{ desc: true, id: 'dateTime' }]}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-height: 500px;
  overflow: auto;
`
