import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDateTime } from '../../../../utils'
import BeaconMalfunctionDetailBody from '../resume/BeaconMalfunctionBody'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { ReactComponent as ArrowSVG } from '../../../icons/Picto_fleche-pleine-droite.svg'
import { setBeaconMalfunctionsTab } from '../../../../domain/shared_slices/BeaconStatus'
import { BeaconMalfunctionsTab } from '../../../../domain/entities/beaconStatus'
import BeaconStatusDetailsFollowUp from '../../../side_window/beacon_statuses/BeaconStatusDetailsFollowUp'

const BeaconMalfunctionDetails = () => {
  const {
    /** @type {BeaconStatusWithDetails || null} */
    openedBeaconMalfunction
  } = useSelector(state => state.beaconStatus)
  const dispatch = useDispatch()

  const navigateToResume = () => dispatch(setBeaconMalfunctionsTab(BeaconMalfunctionsTab.RESUME))

  return <Wrapper>
    <Arrow onClick={navigateToResume}/>
    <Previous onClick={navigateToResume}>
      Revenir au résumé des avaries
    </Previous>
    <Zone>
      <Title>
        Résumé de l&apos;avarie du {getDateTime(openedBeaconMalfunction.beaconStatus.malfunctionStartDateTime)}
      </Title>
      <BeaconMalfunctionDetailBody beaconMalfunctionWithDetails={openedBeaconMalfunction}/>
    </Zone>
    <Zone>
      <Title>
        Main courante de l&apos;avarie
      </Title>
      <BeaconStatusDetailsFollowUp
        smallSize
        comments={openedBeaconMalfunction.comments}
        actions={openedBeaconMalfunction.actions}
        beaconStatusId={openedBeaconMalfunction?.beaconStatus.id}
      />
    </Zone>
  </Wrapper>
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
  margin: 10px 5px 0 5px;
  padding-bottom: 5px;
  text-align: left;
  background: ${COLORS.background};
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

export default BeaconMalfunctionDetails
