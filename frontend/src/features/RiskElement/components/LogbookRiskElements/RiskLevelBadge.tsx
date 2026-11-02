import { getRiskFactorColor } from '@features/RiskFactor/utils'
import styled from 'styled-components'

type RiskLevelBadgeProps = Readonly<{
  riskLevel: number
}>

export function RiskLevelBadge({ riskLevel }: RiskLevelBadgeProps) {
  return (
    <Badge $color={getRiskFactorColor(riskLevel)} data-cy="risk-element-level" title={`Niveau de risque ${riskLevel}`}>
      {riskLevel}
    </Badge>
  )
}

const Badge = styled.span<{ $color: string | undefined }>`
  border: 2px solid ${p => p.$color ?? p.theme.color.slateGray};
  color: ${p => p.$color ?? p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  height: 18px;
  line-height: 18px;
  margin-right: 10px;
  text-align: center;
  width: 28px;
`
