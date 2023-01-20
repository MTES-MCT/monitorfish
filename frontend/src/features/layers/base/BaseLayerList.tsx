import { useCallback, useMemo } from 'react'
import { RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { BaseLayerRow } from './BaseLayerRow'
import { COLORS } from '../../../constants/constants'
import { BaseLayers, LayerType } from '../../../domain/entities/layers/constants'
import LayerSlice from '../../../domain/shared_slices/Layer'
import { selectBaseLayer } from '../../../domain/shared_slices/Map'
import { closeRegulatoryZoneMetadata } from '../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'

export function BaseLayerList({ namespace }) {
  const dispatch = useMainAppDispatch()
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const { setLayersSideBarOpenedLayerType } = LayerSlice[namespace].actions

  const baseLayers = useMemo(() => Object.keys(BaseLayers), [])
  const isBaseLayersShowed = useMemo(
    () => layersSidebarOpenedLayerType === LayerType.BASE_LAYER,
    [layersSidebarOpenedLayerType]
  )

  const openOrCloseBaseLayers = useCallback(() => {
    if (isBaseLayersShowed) {
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(setLayersSideBarOpenedLayerType(LayerType.BASE_LAYER))
      // @ts-ignore
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, isBaseLayersShowed, setLayersSideBarOpenedLayerType])

  const showLayer = useCallback(
    nextBaseLayer => {
      dispatch(selectBaseLayer(nextBaseLayer))
    },
    [dispatch]
  )

  return (
    <>
      <Title isShowed={isBaseLayersShowed} onClick={openOrCloseBaseLayers}>
        Fonds de carte <ChevronIcon $isOpen={isBaseLayersShowed} />
      </Title>
      <RadioGroup onChange={showLayer} value={selectedBaseLayer}>
        <List isShowed={isBaseLayersShowed} layersLength={baseLayers.length}>
          {baseLayers.map(layer => (
            <BaseLayerRow key={layer} layer={layer} />
          ))}
        </List>
      </RadioGroup>
    </>
  )
}

const Title = styled.div<{
  isShowed: boolean
}>`
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  font-size: 16px;
  padding-top: 5px;
  cursor: pointer;
  text-align: left;
  padding-left: 20px;
  user-select: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${p => (p.isShowed ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.isShowed ? '0' : '2px')};
`

const List = styled.ul<{
  isShowed: boolean
  layersLength: number
}>`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: ${p => (p.isShowed && p.layersLength ? 37 * p.layersLength : 0)}px;
  overflow-y: hidden;
  overflow-x: hidden;
  background: ${p => p.theme.color.white};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  transition: all 0.2s;
`
