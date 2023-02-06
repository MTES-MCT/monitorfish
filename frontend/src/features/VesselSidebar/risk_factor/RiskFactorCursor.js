import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { RiskFactorBox } from './RiskFactorBox'

const RiskFactorCursor = ({ value, color, progress, isBig, withoutBox, height, underCharter }) => {
  const [progressWithDelay, setProgressWithDelay] = useState(0)

  useEffect(() => {
    if (progress) {
      setTimeout(() => {
        setProgressWithDelay(progress)
      }, 100)
    }
  }, [progress])

  return (
    <Wrapper
      withoutBox={withoutBox}
      isBig={isBig}
    >
      <RiskFactorBox
        height={height}
        isBig={isBig}
        color={color}
        hide={withoutBox}
      >
        {value}
      </RiskFactorBox>
      {
        underCharter
          ? <UnderCharter/>
          : null
      }
      <Bar
        isBig={isBig}
        height={height}
      >
        <VerticalBar
          height={height}
          isBig={isBig}
        />
        <VerticalBar
          height={height}
          isBig={isBig}
        />
        <VerticalBar
          height={height}
          isBig={isBig}
        />
        <Progress
          height={height}
          isBig={isBig}
          color={color}
          progress={progressWithDelay}
        >
          {
            progressWithDelay >= 25
              ? <VerticalBar
                height={height}
                isBig={isBig}
              />
              : null
          }
          {
            progressWithDelay >= 50
              ? <VerticalBar
                height={height}
                isBig={isBig}
              />
              : null
          }
          {
            progressWithDelay === 100
              ? <VerticalBar
                height={height}
                isBig={isBig}
              />
              : null
          }
        </Progress>
      </Bar>
    </Wrapper>
  )
}

const UnderCharter = styled.span`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${COLORS.mediumSeaGreen} 0% 0% no-repeat padding-box;
  margin-left: -15px;
  margin-top: -5px;
  margin-right: 5px;
  display: inline-block;
`

const Wrapper = styled.div`
  margin: ${props => props.withoutBox ? 0 : 9}px 0;
  padding-bottom: 1px;
  display: flex;
  margin-left: ${props => props.isBig ? 35 : 0}px;
`

const Bar = styled.div`
  height: ${props => props.height ? props.height : 8}px;
  width: 208px;
  background: ${p => p.theme.color.lightGray};
  margin-top: ${props => props.isBig ? 0 : 5}px;
`

const Progress = styled.div`
  height: ${props => props.height ? props.height : 8}px;
  width: ${props => props.progress ? props.progress : 0}%;
  background: ${props => props.color ? props.color : 'white'};
  margin-top: calc(-${props => props.height ? props => props.height : 8}px - ${props => props.isBig ? 5 : props.height === 8 ? 11 : 14}px);
  transition: 1.2s all;
`

const VerticalBar = styled.div`
  height: 100%;
  width: 2px;
  background: ${COLORS.white};
  margin-left: 50.5px;
  padding-top: ${props => props.isBig ? 0 : props.height === 8 ? 7 : 10}px;
  display: inline-block;
`

export default RiskFactorCursor
