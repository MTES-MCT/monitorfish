import { useMapOverlay } from '@features/Map/components/Overlay/hooks/useMapOverlay'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getCoordinates, usePrevious } from '@mtes-mct/monitor-ui'
import LineString from 'ol/geom/LineString'
import { transform } from 'ol/proj'
import { getLength } from 'ol/sphere'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import EditSVG from '../../icons/Bouton_edition.svg?react'
import DeleteSVG from '../../icons/Suppression.svg?react'

import type { InterestPoint } from '../types'

export const initialOffsetValue = [-90, 60]
const MIN_ZOOM = 7

function coordinatesAreModified(_coordinates, _previousCoordinates) {
  return (
    !Number.isNaN(_coordinates[0]) &&
    !Number.isNaN(_coordinates[1]) &&
    !Number.isNaN(_previousCoordinates[0]) &&
    !Number.isNaN(_previousCoordinates[1]) &&
    (_coordinates[0] !== _previousCoordinates[0] || _coordinates[1] !== _previousCoordinates[1])
  )
}

// TODO Type that.
export type InterestPointOverlayProps = {
  interestPoint: InterestPoint
  onDelete: (id: string) => void
  onDrag: any
  onEdit: (id: string) => void
  zoomHasChanged: any
}
export function InterestPointOverlay({
  interestPoint,
  onDelete,
  onDrag,
  onEdit,
  zoomHasChanged
}: InterestPointOverlayProps) {
  const { coordinates } = interestPoint.geometry

  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const previousCoordinates = usePrevious(coordinates)

  const olCoordinates = useMemo(() => transform(coordinates, WSG84_PROJECTION, OPENLAYERS_PROJECTION), [coordinates])

  const { overlayElementRef, resetOffset } = useMapOverlay({
    coordinates: olCoordinates,
    initialOffset: initialOffsetValue,
    onDrag: (anchorCoords, nextCoords, offset) => onDrag(interestPoint.id, anchorCoords, nextCoords, offset),
    zoomHasChanged
  })

  // Reset offset when feature jumps > 10km
  useEffect(() => {
    if (coordinates && previousCoordinates && coordinatesAreModified(coordinates, previousCoordinates)) {
      const line = new LineString([coordinates, previousCoordinates])
      if (getLength(line, { projection: OPENLAYERS_PROJECTION }) > 10) {
        resetOffset()
      }
    }
  }, [coordinates, previousCoordinates, resetOffset])

  const isHiddenByZoom = typeof zoomHasChanged === 'number' && zoomHasChanged < MIN_ZOOM

  const onInterestPointEdit = () => {
    resetOffset()
    onEdit(interestPoint.id)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={overlayElementRef}>
        {!isHiddenByZoom && (
          <InterestPointOverlayElement>
            <Header>
              <Name data-cy="interest-point-name" title={interestPoint.properties.name ?? 'Aucun Libellé'}>
                {interestPoint.properties.name ?? 'Aucun Libellé'}
              </Name>
              <Edit data-cy="interest-point-edit" onClick={onInterestPointEdit} />
              <Delete data-cy="interest-point-delete" onClick={() => onDelete(interestPoint.id)} />
            </Header>
            <Body data-cy="interest-point-observations">
              {interestPoint.properties.observations ?? 'Aucune observation'}
            </Body>
            <Footer data-cy="interest-point-coordinates">
              {getCoordinates(coordinates, WSG84_PROJECTION, coordinatesFormat).join(' ')}
            </Footer>
          </InterestPointOverlayElement>
        )}
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Body = styled.div`
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const Footer = styled.div`
  padding: 3px;
  font-size: 12px;
  text-align: center;
  color: ${p => p.theme.color.slateGray};
`

const Header = styled.div`
  display: flex;
  height: 30px;
  background: ${p => p.theme.color.gainsboro};
  text-align: left;
  border: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const Delete = styled(DeleteSVG)`
  height: 30px;
  width: 15px;
  border-left: 1px solid ${p => p.theme.color.lightGray};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
`

const Edit = styled(EditSVG)`
  height: 30px;
  width: 15px;
  border-left: 1px solid ${p => p.theme.color.lightGray};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const InterestPointOverlayElement = styled.div`
  background: ${p => p.theme.color.white};
  cursor: grabbing;
  width: 183px;
  color: ${p => p.theme.color.gunMetal};
  border: none;
  border-radius: 2px;
`

const Name = styled.span`
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  margin-left: 2px;
  padding: 6px 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 0;
`
