import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { RiskFactorBox } from './RiskFactorBox'

type RiskFactorCursorProps = {
  color: string | undefined
  height: number
  isBig?: boolean
  progress: number
  underCharter?: boolean
  value: string
  withoutBox?: boolean
}
export function RiskFactorCursor({
  color,
  height,
  isBig = false,
  progress,
  underCharter = false,
  value,
  withoutBox = false
}: RiskFactorCursorProps) {
  const [progressWithDelay, setProgressWithDelay] = useState(0)

  useEffect(() => {
    if (progress) {
      setTimeout(() => {
        setProgressWithDelay(progress)
      }, 100)
    }
  }, [progress])

  return (
    <Wrapper $isBig={isBig} $withoutBox={withoutBox}>
      <RiskFactorBox color={color} hide={withoutBox} isBig={isBig}>
        {value}
      </RiskFactorBox>
      {underCharter ? <UnderCharter /> : null}
      <Bar $height={height} $isBig={isBig}>
        <VerticalBar $height={height} $isBig={isBig} />
        <VerticalBar $height={height} $isBig={isBig} />
        <VerticalBar $height={height} $isBig={isBig} />
        <Progress $color={color} $height={height} $isBig={isBig} $progress={progressWithDelay}>
          {progressWithDelay >= 25 ? <VerticalBar $height={height} $isBig={isBig} /> : null}
          {progressWithDelay >= 50 ? <VerticalBar $height={height} $isBig={isBig} /> : null}
          {progressWithDelay === 100 ? <VerticalBar $height={height} $isBig={isBig} /> : null}
        </Progress>
      </Bar>
    </Wrapper>
  )
}

const UnderCharter = styled.span`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${p => p.theme.color.mediumSeaGreen} 0% 0% no-repeat padding-box;
  margin-left: -15px;
  margin-top: -5px;
  margin-right: 5px;
  display: inline-block;
`

const Wrapper = styled.div<{
  $isBig?: boolean
  $withoutBox?: boolean
}>`
  margin: ${p => (p.$withoutBox ? 0 : 9)}px 0;
  padding-bottom: 1px;
  display: flex;
  margin-left: ${p => (p.$isBig ? 35 : 0)}px;
`

const Bar = styled.div<{
  $height: number
  $isBig: boolean
}>`
  height: ${p => (p.$height ? p.$height : 8)}px;
  width: 208px;
  background: ${p => p.theme.color.lightGray};
  margin-top: ${p => (p.$isBig ? 0 : 5)}px;
`

const Progress = styled.div<{
  $color: string | undefined
  $height: number
  $isBig: boolean
  $progress: number
}>`
  height: ${p => (p.$height ? p.$height : 8)}px;
  width: ${p => (p.$progress ? p.$progress : 0)}%;
  background: ${p => (p.$color ? p.$color : 'white')};
  margin-top: calc(
    -${p => (p.$height ? p.$height : 8)}px - ${p =>
        // eslint-disable-next-line no-nested-ternary
        p.$isBig ? 5 : p.$height === 8 ? 11 : 14}px
  );
  transition: 1.2s all;
`

const VerticalBar = styled.div<{
  $height: number
  $isBig: boolean
}>`
  height: 100%;
  width: 2px;
  background: ${p => p.theme.color.white};
  margin-left: 50.5px;
  margin-top: ${p => (p.$isBig ? 1 : 0)}px;
  padding-top: ${p =>
    // eslint-disable-next-line no-nested-ternary
    p.$isBig ? 0 : p.$height === 8 ? 7 : 10}px;
  display: inline-block;
`
