import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { RiskFactorBox } from './styles/RiskFactorBox.style'

const RiskFactorCursor = ({ value, color, progress, isBig }) => {
  const [progressWithDelay, setProgressWithDelay] = useState(0)

  useEffect(() => {
    if (progress) {
      setTimeout(() => {
        setProgressWithDelay(progress)
      }, 100)
    }
  }, progress)

  return (
    <Wrapper isBig={isBig}>
      <RiskFactorBox
        isBig={isBig}
        color={color}
      >
        {value}
      </RiskFactorBox>
      <Bar isBig={isBig}>
        <VerticalBar isBig={isBig}/>
        <VerticalBar isBig={isBig}/>
        <VerticalBar isBig={isBig}/>
        <Progress
          isBig={isBig}
          color={color}
          progress={progressWithDelay}
        >
          {
            progressWithDelay >= 25
              ? <VerticalBar isBig={isBig}/>
              : null
          }
          {
            progressWithDelay >= 50
              ? <VerticalBar isBig={isBig}/>
              : null
          }
          {
            progressWithDelay === 100
              ? <VerticalBar isBig={isBig}/>
              : null
          }
        </Progress>
      </Bar>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: 9px 0;
  padding-bottom: 1px;
  display: flex;
  margin-left: ${props => props.isBig ? 35 : 0}px;
`

const Bar = styled.div`
  height: ${props => props.isBig ? 24 : 8}px;
  width: 208px;
  background: ${COLORS.grayBackground};
  margin-top: ${props => props.isBig ? 0 : 5}px;
`

const Progress = styled.div`
  height: ${props => props.isBig ? 23 : 8}px;
  width: ${props => props.progress ? props.progress : 0}%;
  background: ${props => props.color ? props.color : 'white'};
  margin-top: calc(-${props => props.isBig ? 24 : 8}px - ${props => props.isBig ? 4 : 11}px);
  transition: 1.2s all;
`

const VerticalBar = styled.div`
  height: 100%;
  width: 2px;
  background: ${COLORS.background};
  margin-left: 50.5px;
  padding-top: ${props => props.isBig ? 0 : 7}px;
  display: inline-block;
`

export default RiskFactorCursor
