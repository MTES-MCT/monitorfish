import { Accent, Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import GeoJSON from 'ol/format/GeoJSON'
import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { InteractionListener, InteractionType, OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'
import { setInteractionType } from '../../../domain/shared_slices/Draw'
import { eraseDrawedGeometries } from '../../../domain/use_cases/draw/eraseDrawedGeometries'
import { closeAddMissionZone } from '../../../domain/use_cases/missions/closeAddMissionZone'
import { validateMissionZone } from '../../../domain/use_cases/missions/validateMissionZone'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { theme } from '../../../ui/theme'

import type { MultiPolygon } from 'ol/geom'

const titlePlaceholder = {
  CONTROL_POINT: 'un point de contrôle',
  MISSION_ZONE: 'une zone de mission',
  SURVEILLANCE_ZONE: 'une zone de surveillance'
}
const validateButtonPlaceholder = {
  CONTROL_POINT: 'le point de contrôle',
  MISSION_ZONE: 'la zone de mission',
  SURVEILLANCE_ZONE: 'la zone de surveillance'
}

export function DrawLayerModal() {
  const dispatch = useAppDispatch()
  const { geometry, interactionType, listener } = useAppSelector(state => state.draw)
  const openedSideWindowTab = useAppSelector(state => state.global.openedSideWindowTab)
  const initialFeatureNumberRef = useRef<number | undefined>(undefined)

  const feature = useMemo(() => {
    if (!geometry) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(geometry)
  }, [geometry])

  useEffect(() => {
    if (initialFeatureNumberRef.current !== undefined) {
      return
    }

    if (!feature) {
      initialFeatureNumberRef.current = 0

      return
    }

    initialFeatureNumberRef.current = (feature.getGeometry() as MultiPolygon).getPolygons().length
  }, [feature])

  useEffect(() => {
    if (!openedSideWindowTab) {
      dispatch(closeAddMissionZone())
    }
  }, [dispatch, openedSideWindowTab])

  const handleQuit = () => {
    dispatch(closeAddMissionZone())
  }
  const handleSelectInteraction = nextInteraction => () => {
    dispatch(setInteractionType(nextInteraction))
  }
  const handleReset = () => {
    dispatch(eraseDrawedGeometries(initialFeatureNumberRef.current))
  }
  const handleValidate = () => {
    dispatch(validateMissionZone())
  }

  return (
    <Wrapper>
      <ContentWrapper>
        <Header>
          Vous êtes en train d&apos;ajouter {listener && titlePlaceholder[listener]}
          <QuitButton Icon={Icon.Close} onClick={handleQuit} size={Size.NORMAL}>
            Quitter
          </QuitButton>
        </Header>
        <ActionWrapper>
          {listener === InteractionListener.MISSION_ZONE && (
            <>
              <IconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.POLYGON ? '_active' : ''}
                Icon={Icon.SelectPolygon}
                onClick={handleSelectInteraction(InteractionType.POLYGON)}
                size={Size.NORMAL}
              />
              <IconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.SQUARE ? '_active' : ''}
                Icon={Icon.SelectRectangle}
                onClick={handleSelectInteraction(InteractionType.SQUARE)}
                size={Size.NORMAL}
              />
              <IconButton
                accent={Accent.PRIMARY}
                className={interactionType === InteractionType.CIRCLE ? '_active' : ''}
                Icon={Icon.Info}
                onClick={handleSelectInteraction(InteractionType.CIRCLE)}
                size={Size.NORMAL}
              />
            </>
          )}
          <ResetButton accent={Accent.TERTIARY} onClick={handleReset}>
            Réinitialiser
          </ResetButton>
          <ValidateButton onClick={handleValidate}>
            Valider {interactionType && validateButtonPlaceholder[interactionType]}
          </ValidateButton>
        </ActionWrapper>
      </ContentWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  margin-left: calc(50% - 225px);
  margin-right: calc(50% - 225px);
  position: absolute;
  top: 0;
`
const ContentWrapper = styled.div``

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
  width: 502px;
`

const QuitButton = styled(Button)`
  background: ${theme.color.cultured};
  color: ${theme.color.maximumRed};
  margin-left: auto;

  &:hover {
    background: ${theme.color.cultured};
    color: ${theme.color.maximumRed};
  }
`

const ResetButton = styled(Button)`
  margin-left: auto;
`

const ValidateButton = styled(Button)`
  background: ${theme.color.mediumSeaGreen};
  color: ${theme.color.white};

  &:hover {
    background: ${theme.color.mediumSeaGreen};
  }
`
const ActionWrapper = styled.div`
  background-color: ${theme.color.white};
  display: flex;
  padding: 10px;

  & > :not(:last-child) {
    margin-right: 10px;
  }
`
