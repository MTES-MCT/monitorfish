import { type Undefine } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getRiskFactorColor } from '../utils'

type VesselRiskFactorProps = Readonly<
  Undefine<{
    isVesselUnderCharter: boolean
    vesselRiskFactor: number
  }>
>

// https://github.com/MTES-MCT/monitorfish/issues/3043
export function VesselRiskFactor({ isVesselUnderCharter = false, vesselRiskFactor }: VesselRiskFactorProps) {
  if (!vesselRiskFactor) {
    return '-'
  }

  return (
    <Box data-cy="VesselRiskFactor" onClick={event => event.stopPropagation()}>
      <Score $value={vesselRiskFactor}>{vesselRiskFactor.toFixed(1)}</Score>
      {isVesselUnderCharter && <UnderCharterAsBadge title="Navire sous charte" />}
    </Box>
  )
}

const Box = styled.div`
  font-size: 13px;
  position: relative;
  width: auto;

  * {
    user-select: none;
  }
`

const Score = styled.div<{
  $value: number
}>`
  align-items: center;
  background-color: ${p => getRiskFactorColor(p.$value)};
  border-radius: 1px;
  color: ${p => p.theme.color.white};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 22px;
  text-align: center;
  width: 28px;
`

const UnderCharter = styled.span`
  background: ${p => p.theme.color.mediumSeaGreen} 0% 0% no-repeat padding-box;
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  width: 10px;
`

const UnderCharterAsBadge = styled(UnderCharter)`
  box-shadow: 0px 2px 3px ${p => p.theme.color.slateGray};
  position: absolute;
  left: 23px;
  top: -4px;
`
