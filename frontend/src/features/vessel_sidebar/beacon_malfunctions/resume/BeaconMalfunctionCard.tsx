import styled from 'styled-components'

import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'
import { BeaconMalfunctionVesselStatus } from '../../../../domain/entities/beaconMalfunction/constants'
import { setOpenedBeaconMalfunction } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { getDateTime } from '../../../../utils'
import { ReactComponent as AtSeaSVG } from '../../../icons/Icone_avarie_mer.svg'
import { ReactComponent as AtPortSVG } from '../../../icons/Icone_avarie_quai.svg'
import BeaconMalfunctionBody from './BeaconMalfunctionBody'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../domain/types/beaconMalfunction'
import type { HTMLProps } from 'react'

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

  return beaconMalfunctionWithDetails ? (
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
      <BeaconMalfunctionBody beaconMalfunctionWithDetails={beaconMalfunctionWithDetails} />
    </Wrapper>
  ) : null
}

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  height: 30px;
  padding: 10px 10px 0 20px;
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
