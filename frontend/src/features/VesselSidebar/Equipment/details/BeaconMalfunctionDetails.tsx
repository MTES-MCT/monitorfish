import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'
import { EquipmentTab } from '../../../../domain/entities/beaconMalfunction/constants'
import { setBeaconMalfunctionsTab } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../utils'
import ArrowSVG from '../../../icons/Picto_fleche-pleine-droite.svg?react'
import { BeaconMalfunctionDetailsFollowUp } from '../../../SideWindow/BeaconMalfunctionBoard/BeaconMalfunctionDetailsFollowUp'
import { BeaconMalfunctionBody } from '../resume/BeaconMalfunctionBody'
import { CurrentBeaconMalfunctionBody } from '../resume/CurrentBeaconMalfunctionBody'

type BeaconMalfunctionDetailsProps = {
  isCurrentBeaconMalfunctionDetails: boolean
}
export function BeaconMalfunctionDetails({ isCurrentBeaconMalfunctionDetails }: BeaconMalfunctionDetailsProps) {
  const openedBeaconMalfunction = useMainAppSelector(state => state.beaconMalfunction.openedBeaconMalfunction)
  const dispatch = useMainAppDispatch()

  const navigateToResume = () => dispatch(setBeaconMalfunctionsTab(EquipmentTab.RESUME))

  return (
    <Wrapper data-cy="vessel-malfunctions-details">
      <Arrow onClick={navigateToResume} />
      <Previous data-cy="beacon-malfunction-back-to-resume" onClick={navigateToResume}>
        Revenir au résumé des avaries
      </Previous>
      {isCurrentBeaconMalfunctionDetails ? (
        <Zone data-cy="beacon-malfunction-current-details">
          <Title>Résumé de l&apos;avarie en cours</Title>
          <CurrentBeaconMalfunctionBody currentBeaconMalfunctionWithDetails={openedBeaconMalfunction} />
        </Zone>
      ) : (
        <Zone data-cy="beacon-malfunction-details">
          <Title>
            Résumé de l&apos;avarie du{' '}
            {getDateTime(openedBeaconMalfunction?.beaconMalfunction?.malfunctionStartDateTime, true)}
          </Title>
          <BeaconMalfunctionBody beaconMalfunctionWithDetails={openedBeaconMalfunction} />
        </Zone>
      )}
      <Zone data-cy="beacon-malfunction-details-follow-up">
        <Title>Main courante de l&apos;avarie</Title>
        {openedBeaconMalfunction && (
          <BeaconMalfunctionDetailsFollowUp
            beaconMalfunctionWithDetails={openedBeaconMalfunction}
            firstStatus={getFirstVesselStatus(openedBeaconMalfunction)}
            smallSize
          />
        )}
      </Zone>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 5px;
  text-align: left;
`

const Arrow = styled(ArrowSVG)`
  margin-left: 5px;
  margin-right: 5px;
  transform: rotate(180deg);
  vertical-align: sub;
`

const Previous = styled.a`
  color: ${COLORS.slateGray};
  cursor: pointer;
  display: inline-block;
  font-size: 13px;
  text-align: left;
  text-decoration: underline;
`

const Zone = styled.div`
  background: ${COLORS.white};
  margin: 10px 5px 5px;
  padding-bottom: 10px;
  text-align: left;
  width: 480px;
`

const Title = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.white};
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 10px;
  padding: 8.5px 10px 8px 20px;
  width: 450px;
`
