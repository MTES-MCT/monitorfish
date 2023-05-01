import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'

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
  vertical-align: middle;
  display: inline-block;
  font-size: 13px;
  padding-bottom: 2px;
`

const Square = styled.div`
  margin: 5px 7px 5px 7px;
  background: ${props => (props.color ? props.color : 'white')};
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.gainsboro} transparent transparent transparent;
  margin-left: 50px;
  margin-top: -1px;
  clear: top;
`

const Body = styled.div`
  font-size: 13px;
  color: ${COLORS.slateGray};
  padding-top: 2px;
  padding-bottom: 2px;
`
