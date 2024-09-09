import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, Tag } from '@mtes-mct/monitor-ui'
import { transform } from 'ol/proj'
import styled from 'styled-components'

import { getCoordinates } from '../../../../../../coordinates'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../../../domain/entities/map/constants'
import { animateToCoordinates } from '../../../../../../domain/shared_slices/Map'
import { highlightVesselTrackPosition } from '../../../../../../domain/shared_slices/Vessel'
import ManualPositionSVG from '../../../icons/Pastille_position_manuelle.svg?react'

import type { VesselPosition } from '../../../../../../domain/entities/vessel/types'

type HighlightPositionCellProps = {
  isAtPortPositionMarkerShowed?: boolean
  isManualPositionMarkerShowed?: boolean
  isNetworkTypeMarkerShowed?: boolean
  row: VesselPosition
  value: unknown
}
export function HighlightPositionCell({
  isAtPortPositionMarkerShowed,
  isManualPositionMarkerShowed,
  isNetworkTypeMarkerShowed,
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
      {isNetworkTypeMarkerShowed && row.networkType ? (
        <StyledTag accent={Accent.PRIMARY} title={`Réseau ${row.networkType}`}>
          {row.networkType.slice(0, 3)}
        </StyledTag>
      ) : (
        ''
      )}
    </span>
  )
}

const StyledTag = styled(Tag)`
  font-size: 10px;
  height: 17px;
  padding: 0px 4px;
  margin-left: 3px;
  vertical-align: text-top;
`

const StyledAnchor = styled(Icon.Anchor)`
  margin-left: 3px;
`

const ManualPosition = styled(ManualPositionSVG)`
  margin-left: 3px;
`
