import { getDateTime } from '../../../../utils'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { NoValue, Header, Zone } from '../../common_styles/common.style'
import { VESSEL_STATUS } from '../../../../domain/entities/beaconMalfunction/constants'

const BeaconMalfunctionsResume = props => {
  const {
    /** @type {VesselBeaconMalfunctionsResume} */
    vesselBeaconMalfunctionsResume
  } = props

  return vesselBeaconMalfunctionsResume
    ? <Zone>
      <Header>
        Résumé des avaries VMS (sur 1 an)
      </Header>
      <Table>
        <Fields>
          <TableBody>
            <Field>
              <Key>Nombre d&apos;avaries</Key>
              <Value data-cy={'vessel-beacon-malfunctions-resume-number'}>
                <AtSea>en mer</AtSea> {vesselBeaconMalfunctionsResume?.numberOfBeaconsAtSea}
                <AtPort>à quai</AtPort> {vesselBeaconMalfunctionsResume?.numberOfBeaconsAtPort}
              </Value>
            </Field>
            <Field>
              <Key>Dernière avarie</Key>
              <Value data-cy={'vessel-beacon-malfunctions-resume-last'}>
                {
                  vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionDateTime
                    ? <>Le {getDateTime(vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionDateTime, true)}
                      {' '}
                    ({VESSEL_STATUS.find(status => status.value === vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionVesselStatus)?.label})</>
                    : <NoValue>-</NoValue>
                }
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Table>
    </Zone>
    : null
}

const AtSea = styled.span`
  font-size: 13px;
  margin-right: 5px;
  color: ${COLORS.slateGray};
`

const AtPort = styled.span`
  margin-left: 15px;
  margin-right: 5px;
  font-size: 13px;
  color: ${COLORS.slateGray};
`

const TableBody = styled.tbody``

const Table = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  padding: 10px 5px 0 15px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

export default BeaconMalfunctionsResume
