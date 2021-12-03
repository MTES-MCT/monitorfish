import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import BaseLayerItem from './BaseLayerItem'
import { COLORS } from '../../../constants/constants'
import { baseLayers, layersType } from '../../../domain/entities/layers'
import layer from '../../../domain/shared_slices/Layer'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'

const BaseLayers = ({ namespace }) => {
  const dispatch = useDispatch()
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
  const { layersSidebarOpenedLayer } = useSelector(state => state.layer)

  const baseLayersKeys = Object.keys(baseLayers).filter(key => key !== baseLayers.DARK.code)
  const [showBaseLayers, setShowBaseLayers] = useState(false)

  const {
    setLayersSideBarOpenedZone
  } = layer[namespace].actions

  useEffect(() => {
    setShowBaseLayers(layersSidebarOpenedLayer === layersType.BASE_LAYER)
  }, [layersSidebarOpenedLayer, setShowBaseLayers])

  const onSectionTitleClicked = () => {
    if (showBaseLayers) {
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      dispatch(setLayersSideBarOpenedZone(layersType.BASE_LAYER))
    }
  }

  return (
    <>
      <SectionTitle onClick={() => onSectionTitleClicked()} showBaseLayers={showBaseLayers}>
        Fonds de carte <ChevronIcon $isOpen={showBaseLayers}/>
      </SectionTitle>
      <BaseLayersList showBaseLayers={showBaseLayers} baseLayersLength={baseLayersKeys.length}>
        {
          baseLayersKeys.map(layer => {
            return (<ListItem key={layer}>
              <BaseLayerItem
                isShownOnInit={selectedBaseLayer === layer}
                layer={layer}
              />
            </ListItem>)
          })
        }
      </BaseLayersList>
    </>
  )
}

const SectionTitle = styled.div`
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
  border-bottom-left-radius: ${props => props.showBaseLayers ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showBaseLayers ? '0' : '2px'};
`

const BaseLayersList = styled.ul`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  background: ${COLORS.background};
  
  animation: ${props => props.showBaseLayers ? 'zones-opening' : 'zones-closing'} 0.5s ease forwards;

  @keyframes zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.baseLayersLength ? `${34 * props.baseLayersLength}px` : '175px'}; }
  }

  @keyframes zones-closing {
    0%   { height: ${props => props.baseLayersLength ? `${34 * props.baseLayersLength}px` : '175px'}; }
    100% { height: 0;   }
  }
  
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 6px 5px 5px 0px;
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  background: ${COLORS.background};
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
  line-height: 1.9em;
  
  :hover {
    background: ${COLORS.shadowBlueLittleOpacity};
  }
`

export default BaseLayers
