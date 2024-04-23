import { getDateTime } from '@utils/getDateTime'
import styled from 'styled-components'

import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'
import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  END_OF_MALFUNCTION_REASON_RECORD,
  VESSEL_STATUS
} from '../../../../domain/entities/beaconMalfunction/constants'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../domain/entities/beaconMalfunction/types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

type BeaconMalfunctionBodyProps = {
  beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails | null
}
export function BeaconMalfunctionBody({ beaconMalfunctionWithDetails }: BeaconMalfunctionBodyProps) {
  return beaconMalfunctionWithDetails ? (
    <Wrapper>
      <Key $width={120}>Dernière pos.</Key>
      <SubValue>
        {VESSEL_STATUS.find(status => status.value === getFirstVesselStatus(beaconMalfunctionWithDetails))?.label}
      </SubValue>
      <br />
      <Key $width={120}>Durée avarie</Key>
      <SubValue>
        {beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime &&
        beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime ? (
          <>
            {Math.floor(
              // TODO Fix that and use a clean function.
              // @ts-ignore
              (new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime) -
                // @ts-ignore
                new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime)) /
                MS_PER_DAY
            )}{' '}
            jours
          </>
        ) : null}
      </SubValue>
      <br />
      <Key $width={120}>Date reprise</Key>
      <SubValue>{getDateTime(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime, true)}</SubValue>
      <br />
      {beaconMalfunctionWithDetails.beaconMalfunction?.endOfBeaconMalfunctionReason ? (
        <>
          <Key $width={120}>Raison fin d&apos;avarie</Key>
          <SubValue>
            {
              END_OF_MALFUNCTION_REASON_RECORD[
                beaconMalfunctionWithDetails.beaconMalfunction?.endOfBeaconMalfunctionReason
              ]?.label
            }
          </SubValue>
          <br />
        </>
      ) : null}
      {beaconMalfunctionWithDetails.actions.find(
        action =>
          action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS &&
          action.nextValue === BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED
      ) ? (
        <ActivityDetectedLabel>Activité détectée</ActivityDetectedLabel>
      ) : null}
    </Wrapper>
  ) : null
}

const Wrapper = styled.div`
  margin: 0 10px 10px 20px;
`

const ActivityDetectedLabel = styled.span`
  display: inline-block;
  margin-top: 10px;
  margin-right: 5px;
  padding: 0 8px 0 8px;
  /* TODO Replace this color with a theme color. */
  background: #e1000f 0% 0% no-repeat padding-box;
  border-radius: 11px;
  color: ${p => p.theme.color.white};
  font-size: 13px;
  font-weight: 500;
`

const Key = styled.span<{
  $width?: number
}>`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  width: ${p => (p.$width ? p.$width : '47')}px;
  display: inline-block;
  vertical-align: top;
  padding-top: 4px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
  font-weight: 500;
  vertical-align: bottom;
`
