import { useMemo } from 'react'
import styled from 'styled-components'

import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'
import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionVesselStatus,
  VESSEL_STATUS
} from '../../../../domain/entities/beaconMalfunction/constants'
import { setOpenedBeaconMalfunction } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { getDateTime } from '../../../../utils'
import { ReactComponent as AtSeaSVG } from '../../../icons/Icone_avarie_mer.svg'
import { ReactComponent as AtPortSVG } from '../../../icons/Icone_avarie_quai.svg'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../domain/types/beaconMalfunction'
import type { HTMLProps } from 'react'

const MS_PER_DAY = 1000 * 60 * 60 * 24

type YearBeaconMalfunctionsProps = {
  beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails
  isLastItem: boolean
  setIsCurrentBeaconMalfunctionDetails: (boolean) => void
}
export function BeaconMalfunctionCard({
  beaconMalfunctionWithDetails,
  isLastItem,
  setIsCurrentBeaconMalfunctionDetails
}: YearBeaconMalfunctionsProps) {
  const dispatch = useAppDispatch()

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
      isLastItem={isLastItem}
      onClick={() => {
        setIsCurrentBeaconMalfunctionDetails(false)
        dispatch(
          setOpenedBeaconMalfunction({
            beaconMalfunction: beaconMalfunctionWithDetails,
            showTab: true
          })
        )
      }}
      title={"Afficher les détails de l'avarie"}
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
        <Resume>
          Reprise des émissions le{' '}
          {getDateTime(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionEndDateTime, true)}
        </Resume>
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
  margin-left: 37px;
  color: ${p => p.theme.color.gunMetal};
  font-size: 11px;
  margin-top: -5px;
  display: inherit;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  height: 30px;
  padding: 10px 10px 0 10px;
`

const Wrapper = styled.div<
  {
    isLastItem: boolean
  } & HTMLProps<HTMLDivElement>
>`
  background: ${p => p.theme.color.cultured};
  margin: 10px 20px 0px 20px;
  border: 1px solid ${p => p.theme.color.lightGray};
  width: -moz-available;
  width: -webkit-fill-available;
  margin-bottom: ${props => (props.isLastItem ? 10 : 0)}px;
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
