import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { ReactComponent as AtSeaSVG } from '../../../icons/Icone_avarie_mer.svg'
import { ReactComponent as AtPortSVG } from '../../../icons/Icone_avarie_quai.svg'
import { ReactComponent as ArrowSVG } from '../../../icons/Picto_fleche-pleine-droite.svg'
import { getDateTime } from '../../../../utils'
import { BeaconMalfunctionVesselStatus } from '../../../../domain/entities/beaconMalfunction/constants'
import { setOpenedBeaconMalfunction } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useDispatch } from 'react-redux'
import BeaconMalfunctionBody from './BeaconMalfunctionBody'
import { getFirstVesselStatus } from '../../../../domain/entities/beaconMalfunction'

const BeaconMalfunction = props => {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails} */
    beaconMalfunctionWithDetails,
    index,
    isLastItem,
    setIsCurrentBeaconMalfunctionDetails
  } = props
  const dispatch = useDispatch()

  return beaconMalfunctionWithDetails
    ? <Wrapper
      key={index}
      isLastItem={isLastItem}
      data-cy={'vessel-beacon-malfunction-single-history'}
    >
      <Title>
        {
          getFirstVesselStatus(beaconMalfunctionWithDetails) === BeaconMalfunctionVesselStatus.AT_PORT
            ? <AtPort/>
            : <AtSea/>
        }
        AVARIE DU {getDateTime(beaconMalfunctionWithDetails.beaconMalfunction.malfunctionStartDateTime, true)}
      </Title>
      <BeaconMalfunctionBody beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}/>
      <SeeMore
        data-cy={'vessel-beacon-malfunction-history-see-more'}
        onClick={() => {
          setIsCurrentBeaconMalfunctionDetails(false)
          dispatch(setOpenedBeaconMalfunction({
            beaconMalfunction: beaconMalfunctionWithDetails,
            showTab: true
          }))
        }}
      >
        voir les détails de l&apos;avarie <Arrow/>
      </SeeMore>
    </Wrapper>
    : null
}

const Arrow = styled(ArrowSVG)`
  margin-left: 5px;
  cursor: pointer;
  vertical-align: sub;
`

const SeeMore = styled.a`
  margin-top: 10px;
  display: block;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.slateGray};
  cursor: pointer;
  padding: 0 10px 10px 20px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  height: 30px;
  padding: 10px 10px 0 20px;
`

const Wrapper = styled.div`
  width: -moz-available;
  width: -webkit-fill-available;
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
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

export default BeaconMalfunction
