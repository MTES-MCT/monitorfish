import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import AdministrativeZone from './AdministrativeZone'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { useSelector } from 'react-redux'

const AdministrativeZoneGroup = props => {
  const showedLayers = useSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)

  return <>
    {
      props.layers && props.layers.length && props.layers[0]
        ? <Row>
          <Zone isLastItem={props.isLastItem} isOpen={isOpen}>
            <Text isOpen={isOpen} title={props.layers[0].group.name.replace(/[_]/g, ' ')}
                  onClick={() => setIsOpen(!isOpen)}>
              <ChevronIcon isOpen={isOpen}/>
              {props.layers[0].group.name.replace(/[_]/g, ' ')}
            </Text>
          </Zone>
          <List
            isOpen={isOpen}
            name={props.layers[0].group.name.replace(/\s/g, '-')}
            length={props.layers.length}>
            {props.layers.map((layer, index) => {
              return <ListItem isLastItem={props.layers === index + 1} key={layer.code}>
                <AdministrativeZone
                  isShownOnInit={showedLayers.some(layer_ => {
                    if (layer_.zone) {
                      return layer_.type === layer.groupCode && layer_.zone === layer.code
                    } else {
                      return layer_.type === layer.code
                    }
                  })}
                  layer={layer}
                  callShowAdministrativeZone={props.callShowAdministrativeZone}
                  callHideAdministrativeZone={props.callHideAdministrativeZone}
                  isGrouped={true}
                />
              </ListItem>
            })
            }
          </List>
        </Row>
        : null
    }</>
}

const ListItem = styled.span`
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  line-height: 1.9em;
  padding-top: 8px;
  padding-bottom: 4px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 13px;
  font-weight: 300;
  margin-left: 10px;
`

const Row = styled.div`
  width: 100%;
  display: block;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 11px;
  margin-top: 5px;
  float: right;
  
  animation: ${props => props.isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

const Text = styled.span`
  font-size: 13px;
  padding-left: 10px;
  width: 100%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-bottom: 6px;
  ${props => !props.isOpen ? null : `border-bottom: 1px solid ${COLORS.gray};`}
`

const Zone = styled.span`
  width: 100%;
  display: flex;
  user-select: none;
`

const List = styled.div`
  height: inherit;
  overflow: hidden;
  animation: ${props => props.isOpen ? `list-zones-${props.name}-${props.length}-opening` : `list-zones-${props.name}-${props.length}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-zones-${props.name}-${props.length}-opening` : null} {
    0%   { height: 0px; }
    100% { height: ${props => props.length * 38.4}px; }
  }

  @keyframes ${props => props.name ? `list-zones-${props.name}-${props.length}-closing` : null} {
    0%   { height: ${props => props.length * 38.4}px; }
    100% { height: 0px;   }
  }
`

export default AdministrativeZoneGroup
