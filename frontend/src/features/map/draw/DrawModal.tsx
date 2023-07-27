import { Accent, Button, CoordinatesInput, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Point } from 'ol/geom'
import { transform } from 'ol/proj'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import {
  InteractionListener,
  InteractionType,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '../../../domain/entities/map/constants'
import { SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { setInteractionType } from '../../../domain/shared_slices/Draw'
import { fitToExtent } from '../../../domain/shared_slices/Map'
import { addFeatureToDrawedFeature } from '../../../domain/use_cases/draw/addFeatureToDrawedFeature'
import { eraseDrawedGeometries } from '../../../domain/use_cases/draw/eraseDrawedGeometries'
import { closeDraw } from '../../../domain/use_cases/mission/closeDraw'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { theme } from '../../../ui/theme'

import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { MultiPolygon } from 'ol/geom'

const INTERACTION_LISTENER_TITLE_PLACEHOLDER: Partial<Record<InteractionListener, string>> = {
  [InteractionListener.CONTROL_POINT]: 'un point de contrôle',
  [InteractionListener.MISSION_ZONE]: 'une zone de mission',
  [InteractionListener.SURVEILLANCE_ZONE]: 'une zone de surveillance'
}
const INTERACTION_LISTENER_BUTTON_LABEL: Partial<Record<InteractionListener, string>> = {
  [InteractionListener.CONTROL_POINT]: 'le point de contrôle',
  [InteractionListener.MISSION_ZONE]: 'la zone de mission',
  [InteractionListener.SURVEILLANCE_ZONE]: 'la zone de surveillance'
}

export function DrawLayerModal() {
  const dispatch = useMainAppDispatch()
  const { drawedGeometry, initialGeometry, interactionType, listener } = useMainAppSelector(state => state.draw)
  const { sideWindow } = useMainAppSelector(state => state)
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const initialFeatureNumberRef = useRef<number | undefined>(undefined)

  const feature = useMemo(() => {
    const currentGeometry = drawedGeometry || initialGeometry
    if (!currentGeometry) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(currentGeometry)
  }, [initialGeometry, drawedGeometry])

  useEffect(() => {
    if (initialFeatureNumberRef.current !== undefined) {
      return
    }

    if (!feature) {
      initialFeatureNumberRef.current = 0

      return
    }

    if (feature.getGeometry()?.getType() === OpenLayersGeometryType.MULTIPOLYGON) {
      initialFeatureNumberRef.current = (feature.getGeometry() as MultiPolygon).getPolygons().length

      return
    }

    initialFeatureNumberRef.current = 0
  }, [feature])

  useEffect(() => {
    if (sideWindow.status === SideWindowStatus.CLOSED) {
      dispatch(closeDraw())
    }
  }, [dispatch, sideWindow.status])

  const handleQuit = () => {
    dispatch(closeDraw())
  }

  const handleSelectInteraction = (nextInteractionType: InteractionType) => () => {
    dispatch(setInteractionType(nextInteractionType))
  }

  const handleReset = () => {
    dispatch(eraseDrawedGeometries(initialFeatureNumberRef.current))
  }

  const handleValidate = () => {
    dispatch(closeDraw())
  }

  const handleWriteCoordinates = useCallback(
    (nextCoordinates: Coordinates | undefined) => {
      if (!nextCoordinates) {
        return
      }

      const [latitude, longitude] = nextCoordinates
      if (!latitude || !longitude) {
        return
      }

      const nextTransformedCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      const nextFeature = new Feature({
        geometry: new Point(nextTransformedCoordinates)
      })

      dispatch(addFeatureToDrawedFeature(nextFeature))
      const extent = nextFeature.getGeometry()?.getExtent()
      if (!extent) {
        return
      }

      dispatch(fitToExtent(extent))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <ContentWrapper>
        <Header>
          Vous êtes en train d&apos;ajouter {listener && INTERACTION_LISTENER_TITLE_PLACEHOLDER[listener]}
          <QuitButton Icon={Icon.Close} onClick={handleQuit} size={Size.NORMAL}>
            Quitter
          </QuitButton>
        </Header>
        <ActionWrapper>
          {listener === InteractionListener.MISSION_ZONE && (
            <>
              <StyledIconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.POLYGON ? '_active' : ''}
                Icon={Icon.SelectPolygon}
                onClick={handleSelectInteraction(InteractionType.POLYGON)}
                size={Size.NORMAL}
              />
              <StyledIconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.SQUARE ? '_active' : ''}
                Icon={Icon.SelectRectangle}
                onClick={handleSelectInteraction(InteractionType.SQUARE)}
                size={Size.NORMAL}
              />
              <StyledIconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.CIRCLE ? '_active' : ''}
                Icon={Icon.Info}
                onClick={handleSelectInteraction(InteractionType.CIRCLE)}
                size={Size.NORMAL}
              />
            </>
          )}
          {listener === InteractionListener.CONTROL_POINT && (
            <StyledCoordinatesInput
              coordinatesFormat={coordinatesFormat}
              defaultValue={undefined}
              isLabelHidden
              isLight
              label=""
              onChange={handleWriteCoordinates}
            />
          )}
          <ResetButton accent={Accent.TERTIARY} onClick={handleReset}>
            Réinitialiser
          </ResetButton>
          <ValidateButton onClick={handleValidate}>
            {`Valider ${listener ? INTERACTION_LISTENER_BUTTON_LABEL[listener] : ''}`}
          </ValidateButton>
        </ActionWrapper>
      </ContentWrapper>
    </Wrapper>
  )
}

const StyledIconButton = styled(IconButton)`
  width: 30px;
  height: 30px;
  margin-top: 12px;
`

const StyledCoordinatesInput = styled(CoordinatesInput)`
  > div {
    padding: 12px;
  }
`

const Wrapper = styled.div`
  display: flex;
  margin-left: calc(50% - 310px);
  margin-right: calc(50% - 310px);
  position: absolute;
  top: 0;
  width: 620px;
  box-shadow: 0px 3px 6px #00000029;
`
const ContentWrapper = styled.div`
  width: inherit;
`

const Header = styled.h1`
  background: ${theme.color.charcoal};
  color: ${theme.color.white};
  display: flex;
  font-size: 16px;
  font-weight: normal;
  height: 30px;
  line-height: 27px;
  margin: 0;
  padding: 10px 24px;
`

const QuitButton = styled(Button)`
  background: ${theme.color.cultured};
  color: ${theme.color.maximumRed};
  margin-left: auto;
  height: 30px;

  &:hover {
    background: ${theme.color.cultured};
    color: ${theme.color.maximumRed};
  }
`

const ResetButton = styled(Button)`
  margin-left: auto;
  height: 30px;
  margin-top: 12px;
  margin-bottom: 12px;
`

const ValidateButton = styled(Button)`
  background: ${theme.color.mediumSeaGreen};
  height: 30px;
  color: ${theme.color.white};
  margin-top: 12px;
  margin-bottom: 12px;
  margin-right: 12px;

  &:hover {
    background: ${theme.color.mediumSeaGreen};
  }
`
const ActionWrapper = styled.div`
  background-color: ${theme.color.white};
  display: flex;
  padding: 10px;

  & > :first-child {
    margin-left: 14px;
  }

  & > :not(:last-child) {
    margin-right: 10px;
  }
`
