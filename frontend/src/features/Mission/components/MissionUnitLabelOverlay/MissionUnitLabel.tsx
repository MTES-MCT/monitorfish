import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type MissionUnitLabelProps = {
  color: string
  isDoneAndIncomplete: boolean
  showed: boolean
  text: string
}
export function MissionUnitLabel({ color, isDoneAndIncomplete, showed, text }: MissionUnitLabelProps) {
  if (!showed || !text) {
    return null
  }

  return (
    <Wrapper color={color}>
      <ZoneText data-cy="mission-label-text" isWhiteBackground={color === THEME.color.white}>
        {text.toUpperCase()}
      </ZoneText>
      {isDoneAndIncomplete && <IncompleteMission title="Mission à compléter" />}
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

const ZoneText = styled.span<{
  isWhiteBackground: boolean
}>`
  margin: 0px 6px 3px 6px;
  font-size: 11px;
  font-weight: 500;
  user-select: none;
  color: ${p => (p.isWhiteBackground ? p.theme.color.slateGray : p.theme.color.white)};
  line-height: 17px;
  max-width: 250px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const IncompleteMission = styled.span`
  border-radius: 6px;
  border: 1px ${THEME.color.lightGray} solid;
  width: 10px;
  height: 10px;
  background: ${THEME.color.maximumRed} 0% 0% no-repeat padding-box;
  margin-top: -6px;
  margin-right: -6px;
  display: inline-block;
`
