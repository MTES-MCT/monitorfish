import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getDateTime } from '../../../../utils'
import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus, END_OF_MALFUNCTION_REASON_RECORD,
  VESSEL_STATUS
} from '../../../../domain/entities/beaconMalfunction/constants'
import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const BeaconMalfunctionBody = props => {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails} */
    beaconMalfunctionWithDetails
  } = props

  return beaconMalfunctionWithDetails
    ? <Wrapper>
      <Key width={120}>Dernière pos.</Key>
      <SubValue>
        {VESSEL_STATUS.find(status => status.value === getFirstVesselStatus(beaconMalfunctionWithDetails))?.label}
      </SubValue><br/>
      <Key width={120}>Durée avarie</Key>
      <SubValue>
        {
          beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime &&
          beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime
            ? <>{Math.floor(
              (new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime) -
              new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime)) / MS_PER_DAY)}{' '}jours</>
            : null
        }
      </SubValue><br/>
      <Key width={120}>Date reprise</Key>
      <SubValue>
        {getDateTime(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime, true)}
      </SubValue><br/>
      {
        beaconMalfunctionWithDetails.beaconMalfunction?.endOfBeaconMalfunctionReason
          ? <>
            <Key width={120}>Raison fin d&apos;avarie</Key>
            <SubValue>
              {END_OF_MALFUNCTION_REASON_RECORD[beaconMalfunctionWithDetails.beaconMalfunction?.endOfBeaconMalfunctionReason]?.label}
            </SubValue><br/>
          </>
          : null
      }
      {
        beaconMalfunctionWithDetails.actions.find(action =>
          action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS && action.nextValue === BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED)
          ? <ActivityDetectedLabel>Activité détectée</ActivityDetectedLabel>
          : null
      }
    </Wrapper>
    : null
}

const Wrapper = styled.div`
  margin: 0 10px 10px 20px;
`

const ActivityDetectedLabel = styled.span`
  display: inline-block;
  margin-top: 10px;
  margin-right: 5px;
  padding: 0 8px 0 8px;
  background: #E1000F 0% 0% no-repeat padding-box;
  border-radius: 11px;
  color: ${COLORS.white};
  font-size: 13px;
  font-weight: 500;
`

const Key = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  width: ${props => props.width ? props.width : '47'}px;
  display: inline-block;
  vertical-align: top;
  padding-top: 4px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
  font-weight: 500;
  vertical-align: bottom;
`

export default BeaconMalfunctionBody
