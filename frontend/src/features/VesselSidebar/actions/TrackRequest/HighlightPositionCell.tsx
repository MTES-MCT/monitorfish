import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { transform } from 'ol/proj'
import styled from 'styled-components'

import { getCoordinates } from '../../../../coordinates'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { animateToCoordinates } from '../../../../domain/shared_slices/Map'
import { highlightVesselTrackPosition } from '../../../../domain/shared_slices/Vessel'
import ManualPositionSVG from '../../../icons/Pastille_position_manuelle.svg?react'

import type { VesselPosition } from '../../../../domain/entities/vessel/types'

type HighlightPositionCellProps = {
  isAtPortPositionMarkerShowed?: boolean
  isManualPositionMarkerShowed?: boolean
  row: VesselPosition
  value: unknown
}
export function HighlightPositionCell({
  isAtPortPositionMarkerShowed,
  isManualPositionMarkerShowed,
  row,
  value
}: HighlightPositionCellProps) {
  const dispatch = useMainAppDispatch()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  const coordinates = getCoordinates([row.longitude, row.latitude], WSG84_PROJECTION, coordinatesFormat)
  const olCoordinates = transform([row.longitude, row.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

  return (
    <span
      onClick={() => dispatch(animateToCoordinates(olCoordinates))}
      onFocus={() => dispatch(highlightVesselTrackPosition(row))}
      onKeyDown={() => dispatch(animateToCoordinates(olCoordinates))}
      onMouseEnter={() => dispatch(highlightVesselTrackPosition(row))}
      role="presentation"
      style={{ cursor: 'pointer' }}
      title={row && coordinates ? `${coordinates[0]} ${coordinates[1]}` : ''}
    >
      {(value ?? '') as string}
      {isManualPositionMarkerShowed && row.isManual ? <ManualPosition title="Position manuelle (4h-report)" /> : ''}
      {isAtPortPositionMarkerShowed && row.isAtPort ? <StyledAnchor size={13} title="Position au port" /> : ''}
    </span>
  )
}

const StyledAnchor = styled(Icon.Anchor)`
  margin-left: 3px;
`

const ManualPosition = styled(ManualPositionSVG)`
  margin-left: 3px;
`
