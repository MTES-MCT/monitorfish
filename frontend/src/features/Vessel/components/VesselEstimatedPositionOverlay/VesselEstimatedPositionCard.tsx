import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const VesselEstimatedPositionCard = ({ coordinates }) => {
  return (
    <>
      <Body>
        <Text>
          Position estimée :{' '}
          <b>
            {coordinates[0]} {coordinates[1]}
          </b>
        </Text>
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
  margin-left: 150px;
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
