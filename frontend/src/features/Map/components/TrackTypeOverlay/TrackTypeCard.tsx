import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function TrackTypeCard({ trackType }) {
  return (
    <>
      <Body>
        <Square color={trackType.color} />
        <Text>{trackType.description}</Text>
      </Body>
      <TrianglePointer>
        <TriangleShadow />
      </TrianglePointer>
    </>
  )
}

const Text = styled.div`
  display: inline-block;
  font-size: 13px;
  padding-bottom: 2px;
  vertical-align: middle;
`

const Square = styled.div`
  background: ${props => (props.color ? props.color : 'white')};
  display: inline-block;
  height: 14px;
  margin: 5px 7px 5px 7px;
  vertical-align: middle;
  width: 14px;
`

const TrianglePointer = styled.div`
  height: auto;
  margin-left: auto;
  margin-right: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${THEME.color.gainsboro} transparent transparent transparent;
  clear: top;
  height: 0;
  margin-left: 50px;
  margin-top: -1px;
  position: absolute;
  width: 0;
`

const Body = styled.div`
  color: ${THEME.color.slateGray};
  font-size: 13px;
  padding-top: 2px;
  padding-bottom: 2px;
`
