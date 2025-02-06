import { COLORS } from '@constants/constants'
import { BeaconMalfunctionDetailsFollowUp } from '@features/BeaconMalfunction/components/BeaconMalfunctionBoard/BeaconMalfunctionDetailsFollowUp'
import { EquipmentTab } from '@features/BeaconMalfunction/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { setBeaconMalfunctionsTab } from '../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../utils'
import ArrowSVG from '../../icons/Picto_fleche-pleine-droite.svg?react'
import { BeaconMalfunctionBody } from '../../Vessel/components/VesselSidebar/Equipment/resume/BeaconMalfunctionBody'
import { CurrentBeaconMalfunctionBody } from '../../Vessel/components/VesselSidebar/Equipment/resume/CurrentBeaconMalfunctionBody'
import { getFirstVesselStatus } from '../utils'

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
  text-align: left;
`

const Arrow = styled(ArrowSVG)`
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
  margin-top: 10px;
  margin-bottom: 10px;
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
