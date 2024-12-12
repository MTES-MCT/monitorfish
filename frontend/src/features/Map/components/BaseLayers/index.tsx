import { layerActions } from '@features/Map/layer.slice'
import { selectBaseLayer } from '@features/Map/slice'
import { closeRegulatoryZoneMetadata } from '@features/Regulation/useCases/closeRegulatoryZoneMetadata'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import { RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { BaseLayerRow } from './BaseLayerRow'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
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

  const isBaseLayersShowed = useMemo(
    () => layersSidebarOpenedLayerType === LayerType.BASE_LAYER,
    [layersSidebarOpenedLayerType]
  )

  const openOrCloseBaseLayers = useCallback(() => {
    if (isBaseLayersShowed) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(LayerType.BASE_LAYER))
      // @ts-ignore
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, isBaseLayersShowed])

  const showLayer = useCallback(
    nextBaseLayer => {
      dispatch(selectBaseLayer(nextBaseLayer))
    },
    [dispatch]
  )

  return (
    <>
      <Title $isShowed={isBaseLayersShowed} onClick={openOrCloseBaseLayers}>
        Fonds de carte <ChevronIcon $isOpen={isBaseLayersShowed} />
      </Title>
      <RadioGroup onChange={showLayer} value={selectedBaseLayer}>
        <List $isShowed={isBaseLayersShowed} $layersLength={baseLayers.length}>
          {baseLayers.map(layer => (
            <BaseLayerRow key={layer} layer={layer} onChange={showLayer} selectedBaseLayer={selectedBaseLayer} />
          ))}
        </List>
      </RadioGroup>
    </>
  )
}

const Title = styled.div<{
  $isShowed: boolean
}>`
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${THEME.color.charcoal};
  color: ${THEME.color.gainsboro};
  font-size: 16px;
  padding-top: 5px;
  cursor: pointer;
  text-align: left;
  padding-left: 20px;
  user-select: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${p => (p.$isShowed ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$isShowed ? '0' : '2px')};

  .Element-IconBox {
    float: right;
    margin-top: 4px;
  }
`

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
