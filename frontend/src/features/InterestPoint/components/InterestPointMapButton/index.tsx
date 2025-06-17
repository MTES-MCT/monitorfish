import { deleteInterestPoint } from '@features/InterestPoint/useCases/deleteInterestPoint'
import { getGeoJSONFromFeature } from '@features/InterestPoint/useCases/updateInterestPointFeatureFromDraw'
import { InterestPointType } from '@features/InterestPoint/utils'
import { MapBox } from '@features/Map/constants'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

import { EditInterestPoint } from './EditInterestPoint'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'
import { interestPointActions } from '../../slice'

import type { InterestPoint } from '@features/InterestPoint/types'
import type { Coordinate } from 'ol/coordinate'

export function InterestPointMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.INTEREST_POINT)
  const interestPointIdEdited = useMainAppSelector(state => state.interestPoint.interestPointIdEdited)

  const onClose = () => {
    dispatch(setRightMapBoxDisplayed(undefined))
  }

  useEscapeFromKeyboardAndExecute(() => {
    assertNotNullish(interestPointIdEdited)

    dispatch(deleteInterestPoint(interestPointIdEdited))
    onClose()
  })

  const openOrCloseInterestPoint = () => {
    if (!isOpened) {
      const feature = new Feature<Point>({
        geometry: new Point(monitorfishMap.getView().getCenter() as Coordinate),
        name: undefined,
        observations: undefined,
        type: InterestPointType.FISHING_VESSEL
      })
      feature.setId(uuidv4())
      dispatch(interestPointActions.interestPointCreation(getGeoJSONFromFeature(feature) as InterestPoint))

      dispatch(setRightMapBoxDisplayed(MapBox.INTEREST_POINT))
      dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))

      return
    }

    onClose()
  }

  return (
    <Wrapper>
      <MapToolButton
        data-cy="interest-point"
        Icon={Icon.Report}
        isActive={isOpened}
        onClick={openOrCloseInterestPoint}
        style={{ top: 340 }}
        title="Créer un point d'intérêt"
      />
      {isRendered && <EditInterestPoint isOpen={isOpened} onClose={onClose} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
