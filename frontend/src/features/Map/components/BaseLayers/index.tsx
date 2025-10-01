import { StyledTransparentButton, Title } from '@features/LayersSidebar/components/style'
import { layerActions } from '@features/Map/layer.slice'
import { selectBaseLayer } from '@features/Map/slice'
import { closeRegulatoryZoneMetadata } from '@features/Regulation/useCases/closeRegulatoryZoneMetadata'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback, useMemo } from 'react'
import { RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { BaseLayerRow } from './BaseLayerRow'
import { ChevronIconButton } from '../../../commonStyles/icons/ChevronIconButton'
import { BaseLayer, LayerType } from '../../constants'

export function BaseLayers() {
  const dispatch = useMainAppDispatch()
  const isInLightMode = useIsInLightMode()
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)

  const baseLayers = useMemo(() => {
    if (isInLightMode) {
      return [BaseLayer.LIGHT.code]
    }

    return Object.keys(BaseLayer)
  }, [isInLightMode])

  const { isOpened, isRendered } = useDisplayMapBox(layersSidebarOpenedLayerType === LayerType.BASE_LAYER)

  const openOrCloseBaseLayers = useCallback(() => {
    if (isOpened) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(LayerType.BASE_LAYER))
      // @ts-ignore
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, isOpened])

  const showLayer = useCallback(
    nextBaseLayer => {
      dispatch(selectBaseLayer(nextBaseLayer))
    },
    [dispatch]
  )

  return (
    <>
      <Title $isOpen={isOpened}>
        <StyledTransparentButton onClick={openOrCloseBaseLayers}>Fonds de carte</StyledTransparentButton>
        <ChevronIconButton isOpen={isOpened} onClick={openOrCloseBaseLayers} />
      </Title>
      {isRendered && (
        <RadioGroup onChange={showLayer} value={selectedBaseLayer}>
          <List $isShowed={isOpened} $layersLength={baseLayers.length}>
            {baseLayers.map(layer => (
              <BaseLayerRow key={layer} layer={layer} onChange={showLayer} selectedBaseLayer={selectedBaseLayer} />
            ))}
          </List>
        </RadioGroup>
      )}
    </>
  )
}

const List = styled.ul<{
  $isShowed: boolean
  $layersLength: number
}>`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: ${p => (p.$isShowed && p.$layersLength ? 37 * p.$layersLength : 0)}px;
  overflow-y: hidden;
  overflow-x: hidden;
  background: ${p => p.theme.color.white};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  transition: all 0.2s;
`
