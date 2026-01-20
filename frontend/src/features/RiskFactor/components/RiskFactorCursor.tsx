import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { RiskFactorBox } from './RiskFactorBox'

type RiskFactorCursorProps = {
  className?: string | undefined
  color: string | undefined
  height: number
  isBig?: boolean
  progress: number
  underCharter?: boolean | undefined
  value: number | undefined
  withoutBox?: boolean
}
export function RiskFactorCursor({
  className,
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
    <Wrapper $height={height} $isBig={isBig} $withoutBox={withoutBox} className={className}>
      {!withoutBox && (
        <RiskFactorBox color={color} isBig>
          {value?.toFixed(1)}
        </RiskFactorBox>
      )}
      {underCharter && <UnderCharter />}
      <Bar $height={height} $isBig={isBig}>
        <VerticalBar $left={52} />
        <VerticalBar $left={104} />
        <VerticalBar $left={156} />
        <Progress $color={color} $progress={progressWithDelay}>
          {progressWithDelay >= 25 && <ProgressVerticalBar $left={52} />}
          {progressWithDelay >= 50 && <ProgressVerticalBar $left={104} />}
          {progressWithDelay >= 75 && <ProgressVerticalBar $left={156} />}
          {progressWithDelay === 100 && <ProgressVerticalBar $left={206} />}
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
  $height?: number
  $isBig?: boolean
  $withoutBox?: boolean
}>`
  padding-bottom: 1px;
  display: flex;
  align-items: end;

  ${p => {
    if (p.$withoutBox) {
      return `height: ${p.$height}px`
    }

    return ''
  }}
`

const Bar = styled.div<{
  $height: number
  $isBig: boolean
}>`
  position: relative;
  height: ${p => p.$height || 8}px;
  width: 208px;
  background: ${p => p.theme.color.lightGray};
  margin-top: ${p => (p.$isBig ? 0 : 5)}px;
`

const Progress = styled.div<{
  $color: string | undefined
  $progress: number
}>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${p => p.$progress || 0}%;
  background: ${p => p.$color ?? 'white'};
  transition: 1.2s all;
`

const VerticalBar = styled.div<{ $left: number }>`
  position: absolute;
  left: ${p => p.$left}px;
  top: 0;
  height: 100%;
  width: 2px;
  background: ${p => p.theme.color.white};
`

const ProgressVerticalBar = styled.div<{ $left: number }>`
  position: absolute;
  left: ${p => p.$left}px;
  top: 0;
  height: 100%;
  width: 2px;
  background: ${p => p.theme.color.white};
`
