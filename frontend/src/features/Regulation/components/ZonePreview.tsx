import { getRegulatoryLayerStyle } from '@features/Regulation/layers/styles/regulatoryLayer.style'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { RegulatoryZone } from '@features/Regulation/types'

export type ZonePreviewProps = {
  className?: string | undefined
  regulatoryZone: RegulatoryZone
}
export function ZonePreview({ className, regulatoryZone }: ZonePreviewProps) {
  const zoneStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)
  const fillColor = zoneStyle?.getFill()?.getColor()?.toString() ?? THEME.color.lightGray
  const strokeColor = zoneStyle?.getStroke()?.getColor()?.toString() ?? THEME.color.lightGray

  return <Square className={className} fillColor={fillColor} strokeColor={strokeColor} />
}

export const Square = styled.div<{
  fillColor: string
  strokeColor: string
}>`
  width: 14px;
  height: 14px;
  background: ${p => p.fillColor};
  border: 1px solid ${p => p.strokeColor};
  display: inline-block;
  margin-right: 10px;
  flex-shrink: 0;
`
