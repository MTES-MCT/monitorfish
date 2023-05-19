import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

const VesselEstimatedPositionCard = ({ coordinates }) => {
  return (
    <>
      <Body>
        <Text>Position estimée : <b>{coordinates[0]} {coordinates[1]}</b></Text>
      </Body>
      <TrianglePointer>
        <TriangleShadow/>
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
  border-color: ${COLORS.gainsboro} transparent transparent transparent;
  margin-left: 150px;
  margin-top: -1px;
  clear: top;
`

const Body = styled.div`
  font-size: 13px;
  color: ${COLORS.slateGray};
  padding-top: 2px;
  padding-bottom: 2px;
`

export default VesselEstimatedPositionCard
