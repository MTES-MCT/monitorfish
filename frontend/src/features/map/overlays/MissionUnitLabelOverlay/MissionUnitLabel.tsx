import styled from 'styled-components'

export function MissionUnitLabel({ color, showed, text }) {
  if (!showed || !text) {
    return null
  }

  return (
    <Wrapper color={color}>
      <ZoneText data-cy="mission-label-text">{text.toUpperCase()}</ZoneText>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  color: string
}>`
  border: 1px solid ${p => p.theme.color.lightGray};
  box-shadow: 0px 2px 3px #70778580;
  line-height: 20px;
  cursor: grabbing;
  height: 20px;
  display: flex;
  border-radius: 1px;
  background-color: ${p => p.color};
`

const ZoneText = styled.span`
  margin: 0px 6px 3px 6px;
  font-size: 11px;
  font-weight: 500;
  user-select: none;
  color: ${p => p.theme.color.white};
  line-height: 17px;
  max-width: 250px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
