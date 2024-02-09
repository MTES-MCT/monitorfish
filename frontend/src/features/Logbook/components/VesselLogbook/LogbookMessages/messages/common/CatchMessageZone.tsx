import styled from 'styled-components'

import { useMainAppSelector } from '../../../../../../../hooks/useMainAppSelector'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../../styles'
import {
  getDatetimeOrDash,
  getCodeWithNameOrDash,
  getLatitudeOrDash,
  getLongitudeOrDash,
  getValueOrDash
} from '../utils'

export type CatchMessageZoneProps = {
  datetimeUtc?: string
  dimensions?: string
  gear?: string
  gearName?: string
  latitude?: number
  longitude?: number
  mesh?: number
}
export function CatchMessageZone({
  datetimeUtc,
  dimensions,
  gear,
  gearName,
  latitude,
  longitude,
  mesh
}: CatchMessageZoneProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <Zone>
      <Table>
        <TableBody>
          <TableRow>
            <StyledKey>Date opération</StyledKey>
            <TableValue>{getDatetimeOrDash(datetimeUtc)}</TableValue>
          </TableRow>
          <TableRow>
            <StyledKey>Position opération</StyledKey>
            <TableValue>
              <Latitude>Lat.</Latitude> {getLatitudeOrDash(coordinatesFormat, latitude, longitude)}
              <Longitude>Lon.</Longitude> {getLongitudeOrDash(coordinatesFormat, latitude, longitude)}
            </TableValue>
          </TableRow>
        </TableBody>
      </Table>
      {gear && (
        <GearSection>
          <GearKey>Engin à bord</GearKey>
          <GearValue>{getCodeWithNameOrDash(gear, gearName)}</GearValue>
          <HorizontalAlign>
            <HorizontalItem>
              <MeshKey>Maillage</MeshKey>
              <GearValue>{mesh ? <>{mesh} mm</> : <NoValue>-</NoValue>}</GearValue>
            </HorizontalItem>
            <HorizontalItem>
              <DimensionsKey>Dimensions</DimensionsKey>
              <GearValue>{getValueOrDash(dimensions)}</GearValue>
            </HorizontalItem>
          </HorizontalAlign>
        </GearSection>
      )}
    </Zone>
  )
}

const HorizontalAlign = styled.div`
  display: flex;
`

const HorizontalItem = styled.div``

const GearSection = styled.div`
  margin-right: 5px;
  line-height: 21px;
  width: -moz-available;
  width: -webkit-fill-available;
`

const GearKey = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  display: inline-block;
  width: 125px;
`

const GearValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-right: 15px;
  display: inline-block;
`

const MeshKey = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  display: inline-block;
  width: 60px;
`

const DimensionsKey = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  display: inline-block;
  width: 85px;
`

const Latitude = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
`

const Longitude = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
`

const StyledKey = styled(TableKey)`
  width: 125px;
`
