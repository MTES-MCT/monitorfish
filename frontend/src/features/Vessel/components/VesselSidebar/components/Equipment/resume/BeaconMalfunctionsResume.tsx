import {
  NoValue,
  SidebarHeader,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import styled from 'styled-components'

import { getDateTime } from '../../../../../../../utils'
import { VESSEL_STATUS } from '../../../../../../BeaconMalfunction/constants'

import type { VesselBeaconMalfunctionsResume } from '../../../../../../BeaconMalfunction/types'

type VesselBeaconMalfunctionsResumeProps = {
  vesselBeaconMalfunctionsResume: VesselBeaconMalfunctionsResume | undefined
}
export function BeaconMalfunctionsResume({ vesselBeaconMalfunctionsResume }: VesselBeaconMalfunctionsResumeProps) {
  return vesselBeaconMalfunctionsResume ? (
    <StyledSidebarZone>
      <SidebarHeader>Résumé des avaries VMS (sur 1 an)</SidebarHeader>
      <Table>
        <Fields>
          <TableBody>
            <Field>
              <Key>Nombre d&apos;avaries</Key>
              <Value data-cy="vessel-beacon-malfunctions-resume-number">
                <AtSea>en mer</AtSea> {vesselBeaconMalfunctionsResume?.numberOfBeaconsAtSea}
                <AtPort>à quai</AtPort> {vesselBeaconMalfunctionsResume?.numberOfBeaconsAtPort}
              </Value>
            </Field>
            <Field>
              <Key>Dernière avarie</Key>
              <Value data-cy="vessel-beacon-malfunctions-resume-last">
                {vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionDateTime ? (
                  <>
                    Le {getDateTime(vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionDateTime, true)} (
                    {
                      VESSEL_STATUS.find(
                        status => status.value === vesselBeaconMalfunctionsResume?.lastBeaconMalfunctionVesselStatus
                      )?.label
                    }
                    )
                  </>
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Table>
    </StyledSidebarZone>
  ) : null
}

const StyledSidebarZone = styled(SidebarZone)`
  margin-bottom: 10px;
`

const AtSea = styled.span`
  font-size: 13px;
  margin-right: 5px;
  color: #ff3392;
`

const AtPort = styled.span`
  margin-left: 15px;
  margin-right: 5px;
  font-size: 13px;
  color: #ff3392;
`

const TableBody = styled.tbody``

const Table = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const Fields = styled.table`
  display: table;
  width: inherit;
  margin: 10px 5px 0 15px;
  min-width: 40%;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: #ff3392;
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
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`
