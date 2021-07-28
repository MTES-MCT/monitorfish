import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import AdministrativeZone from './AdministrativeZone'
import { useSelector } from 'react-redux'
import { ChevronIcon } from '../commonStyles/icons/ChevronIcon.style'

const AdministrativeZoneGroup = props => {
  const showedLayers = useSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)

  return <>
    {
      props.layers && props.layers.length && props.layers[0]
        ? <Row>
          <Zone isLastItem={props.isLastItem} isOpen={isOpen}>
            <Text
              title={props.layers[0].group.name.replace(/[_]/g, ' ')}
              onClick={() => setIsOpen(!isOpen)}
            >
              {props.layers[0].group.name.replace(/[_]/g, ' ')}
            </Text>
            <ChevronIcon isOpen={isOpen}/>
          </Zone>
          <List
            isOpen={isOpen}
            name={props.layers[0].group.name.replace(/\s/g, '-')}
            length={props.layers.length}>
            {
              props.layers.map((layer, index) => {
                return <AdministrativeZone
                  key={layer.code}
                  isFirst={index === 0}
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
              })
            }
          </List>
        </Row>
        : null
    }</>
}

const Row = styled.div`
  width: 100%;
  display: block;
`

const Text = styled.span`
  padding-left: 20px;
  width: 100%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-bottom: 5px;
  padding-top: 8px;
  font-weight: 500;
  line-height: 20px;
  flex: content;
`

const Zone = styled.span`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;
  display: flex;
  user-select: none;
  padding-bottom: ${props => props.isOpen ? 2 : 3}px;
  ${props => !props.isOpen ? null : `border-bottom: 1px solid ${COLORS.lightGray};`}
`

const List = styled.div`
  height: ${props => props.isOpen && props.length ? props.length * 30 + 10 : 0}px;
  overflow: hidden;
  transition: 0.2s all;
`

export default AdministrativeZoneGroup
