import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'
import { BeaconMalfunctionsTab } from '../../../../domain/entities/beaconMalfunction/constants'
import { setBeaconMalfunctionsTab } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { getDateTime } from '../../../../utils'
import { ReactComponent as ArrowSVG } from '../../../icons/Picto_fleche-pleine-droite.svg'
import { BeaconMalfunctionDetailsFollowUp } from '../../../side_window/beacon_malfunctions/BeaconMalfunctionDetailsFollowUp'
import BeaconMalfunctionDetailBody from '../resume/BeaconMalfunctionBody'
import CurrentBeaconMalfunctionBody from '../resume/CurrentBeaconMalfunctionBody'

type BeaconMalfunctionDetailsProps = {
  isCurrentBeaconMalfunctionDetails: boolean
}
export function BeaconMalfunctionDetails({ isCurrentBeaconMalfunctionDetails }: BeaconMalfunctionDetailsProps) {
  const { openedBeaconMalfunction } = useAppSelector(state => state.beaconMalfunction)
  const dispatch = useAppDispatch()

  const navigateToResume = () => dispatch(setBeaconMalfunctionsTab(BeaconMalfunctionsTab.RESUME))

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
          <BeaconMalfunctionDetailBody beaconMalfunctionWithDetails={openedBeaconMalfunction} />
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
  padding: 5px;
`

const Arrow = styled(ArrowSVG)`
  vertical-align: sub;
  transform: rotate(180deg);
  margin-right: 5px;
  margin-left: 5px;
`

const Previous = styled.a`
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.slateGray};
  cursor: pointer;
  display: inline-block;
`

const Zone = styled.div`
  margin: 10px 5px 5px 5px;
  padding-bottom: 10px;
  text-align: left;
  background: ${COLORS.white};
  width: 480px;
`

const Title = styled.div`
  color: ${COLORS.white};
  background: ${COLORS.charcoal};
  padding: 8.5px 10px 8px 20px;
  font-size: 0.8rem;
  width: 450px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 10px;
`
