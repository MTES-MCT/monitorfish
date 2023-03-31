import styled from 'styled-components'

export function MissionUnitLabel({ color, showed, text }) {
  if (!showed || !text) {
    return null
  }

  return (
    <VesselLabelOverlayElement color={color}>
      <ZoneText data-cy="mission-label-text">{text.toUpperCase()}</ZoneText>
    </VesselLabelOverlayElement>
  )
}

const VesselLabelOverlayElement = styled.div<{
  color: string
}>`
  box-shadow: 0px 2px 3px #d4dadc;
  line-height: 20px;
  cursor: grabbing;
  height: 22px;
  display: flex;
  border-radius: 1px;
  background-color: ${p => p.color};
`

const ZoneText = styled.span`
  margin: 2px 8px 3px 8px;
  font-size: 13px;
  font-weight: 500;
  user-select: none;
  color: ${p => p.theme.color.white};
  line-height: 17px;
  vertical-align: middle;
  max-width: 250px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
