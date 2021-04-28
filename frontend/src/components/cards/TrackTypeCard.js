import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const TrackTypeCard = props => {
  return (
        <>
            <Body>
                <Square color={props.trackType.color} />
                <Text>{props.trackType.description}</Text>
            </Body>
            <TrianglePointer>
                <TriangleShadow isBig={props.isBig}/>
            </TrianglePointer>
        </>
  )
}

const Text = styled.div`
  vertical-align: middle;
  display: inline-block;
  font-size: 13px;
  padding-bottom: 2px;
`

const Square = styled.div`
  margin: 5px 7px 5px 7px;
  background: ${props => props.color ? props.color : 'white'};
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto; 
  width: auto;
`

const TriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.grayBackground} transparent transparent transparent;
  margin-left: ${props => props.isBig ? '165px' : '95px'};
  margin-top: -1px;
  clear: top;
`

const Body = styled.div`
  font-size: 13px;
  color: ${COLORS.textGray};
  padding-top: 2px;
  padding-bottom: 2px;
`

export default TrackTypeCard
