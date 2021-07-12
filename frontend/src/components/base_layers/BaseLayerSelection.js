import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

import BaseLayerItem from './BaseLayerItem'
import { COLORS } from '../../constants/constants'
import { baseLayers } from '../../domain/entities/layers'
import layer from '../../domain/reducers/Layer'

const ZONE_NAME = 'base_layer_zone'
const BaseLayerSelection = ({ namespace }) => {
  const dispatch = useDispatch()
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
  const { layersSideBarOpenedZone } = useSelector(state => state.layer)

  const baseLayersKeys = Object.keys(baseLayers)
  const [showBaseLayers, setShowBaseLayers] = useState(false)

  const {
    setLayersSideBarOpenedZone
  } = layer[namespace].actions

  useEffect(() => {
    setShowBaseLayers(layersSideBarOpenedZone === ZONE_NAME)
  }, [layersSideBarOpenedZone, setShowBaseLayers])

  const onSectionTitleClicked = () => {
    if (showBaseLayers) {
      setShowBaseLayers(false)
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      setShowBaseLayers(true)
      dispatch(setLayersSideBarOpenedZone(ZONE_NAME))
    }
  }

  return (
    <>
      <SectionTitle onClick={() => onSectionTitleClicked()} showBaseLayers={showBaseLayers}>
        Fonds de carte <ChevronIcon isOpen={showBaseLayers}/>
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
  height: 27px;
  margin-top: 10px;
  padding-top: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${COLORS.grayDarker};
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  padding-top: 10px;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 15px;
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
  
  animation: ${props => props.showBaseLayers ? 'zones-opening' : 'zones-closing'} 0.5s ease forwards;

  @keyframes zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.baseLayersLength ? `${36 * props.baseLayersLength}px` : '175px'}; }
  }

  @keyframes zones-closing {
    0%   { height: ${props => props.baseLayersLength ? `${36 * props.baseLayersLength}px` : '175px'}; }
    100% { height: 0;   }
  }
  
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 6px 5px 5px 0px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  background: ${COLORS.background};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-zones-opening' : 'chevron-zones-closing'} 0.5s ease forwards;

  @keyframes chevron-zones-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-zones-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default BaseLayerSelection
