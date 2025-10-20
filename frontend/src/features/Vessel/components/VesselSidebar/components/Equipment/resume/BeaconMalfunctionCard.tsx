import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMemo } from 'react'
import styled from 'styled-components'

import { setOpenedBeaconMalfunction } from '../../../../../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../../../../../utils'
import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  VESSEL_STATUS
} from '../../../../../../BeaconMalfunction/constants'
import { getFirstVesselStatus, getMalfunctionStartDateText } from '../../../../../../BeaconMalfunction/utils'
import AtSeaSVG from '../../../../../../icons/Icone_avarie_mer.svg?react'
import AtPortSVG from '../../../../../../icons/Icone_avarie_quai.svg?react'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../../../BeaconMalfunction/types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

type YearBeaconMalfunctionsProps = {
  beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails
  setIsCurrentBeaconMalfunctionDetails: (boolean) => void
}

export function BeaconMalfunctionCard({
  beaconMalfunctionWithDetails,
  setIsCurrentBeaconMalfunctionDetails
}: YearBeaconMalfunctionsProps) {
  const dispatch = useMainAppDispatch()

  const lastPositionPlace = useMemo(
    () =>
      VESSEL_STATUS.find(status => status.value === getFirstVesselStatus(beaconMalfunctionWithDetails))?.label?.replace(
        'Navire',
        ''
      ),
    [beaconMalfunctionWithDetails]
  )

  const lengthInDays = useMemo(
    () =>
      beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime &&
      beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime ? (
        <>
          {Math.floor(
            (new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime).getTime() -
              new Date(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime).getTime()) /
              MS_PER_DAY
          )}{' '}
          jours
        </>
      ) : (
        'En cours'
      ),
    [beaconMalfunctionWithDetails]
  )

  return (
    <Wrapper
      data-cy="vessel-beacon-malfunction-single-history"
      onClick={() => {
        setIsCurrentBeaconMalfunctionDetails(false)
        dispatch(
          setOpenedBeaconMalfunction({
            beaconMalfunction: beaconMalfunctionWithDetails,
            showTab: true
          })
        )
      }}
      title="Afficher les détails de l'avarie"
    >
      <Title>
        {getFirstVesselStatus(beaconMalfunctionWithDetails) === BeaconMalfunctionVesselStatus.AT_PORT ? (
          <AtPort />
        ) : (
          <AtSea />
        )}
        AVARIE DU {getDateTime(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime, true)}
      </Title>
      <Body>
        <LastPositionInfo>Dernière position {lastPositionPlace}</LastPositionInfo>
        <Resume>{getMalfunctionStartDateText(beaconMalfunctionWithDetails.beaconMalfunction)}</Resume>
        <Length>Durée : {lengthInDays}</Length>
        <DetectedActivity>Activité détectée</DetectedActivity>
        {beaconMalfunctionWithDetails.actions.find(
          action =>
            action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS &&
            action.nextValue === BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED
        ) && <DetectedActivity>Activité détectée</DetectedActivity>}
      </Body>
    </Wrapper>
  )
}

const Length = styled.span`
  margin-top: 10px;
  font-weight: 500;
  display: inline-block;
  background: ${p => p.theme.color.gainsboro};
  border-radius: 1px;
  width: fit-content;
  padding: 2px 8px;
  margin-left: 37px;
`

const DetectedActivity = styled.span`
  margin-top: 10px;
  margin-left: 10px;
  font-weight: 500;
  display: inline-block;
  background: ${p => p.theme.color.maximumRed};
  border-radius: 1px;
  width: fit-content;
  padding: 2px 8px;
  color: ${p => p.theme.color.cultured};
`

const Resume = styled.span`
  margin-top: 10px;
  font-weight: 500;
  display: block;
  margin-left: 37px;
`

const LastPositionInfo = styled.span`
  color: ${p => p.theme.color.gunMetal};
  display: inherit;
  font-size: 11px;
  line-height: 1;
  margin: -5px 0 0 37px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  height: 30px;
  padding: 10px 10px 0 10px;
`

const Wrapper = styled.div`
  background: ${p => p.theme.color.cultured};
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 100%;
  cursor: pointer;
`

const AtSea = styled(AtSeaSVG)`
  width: 26px;
  margin: 3px 10px 0 0;
  vertical-align: bottom;
`

const AtPort = styled(AtPortSVG)`
  width: 26px;
  margin: 3px 10px 0 0;
  vertical-align: bottom;
`

const Body = styled.div`
  margin: 0 10px 15px 10px;
`
