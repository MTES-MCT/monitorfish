import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Title, Zone } from '../../common_styles/common.style'
import { ReactComponent as ArrowSVG } from '../../../icons/Picto_fleche-pleine-droite.svg'
import { setOpenedBeaconMalfunction } from '../../../../domain/shared_slices/BeaconStatus'
import CurrentBeaconMalfunctionBody from './CurrentBeaconMalfunctionBody'
import { useDispatch } from 'react-redux'

const CurrentBeaconMalfunction = props => {
  const {
    /** @type {BeaconStatusWithDetails} */
    currentBeaconMalfunctionWithDetails,
    setIsCurrentBeaconMalfunctionDetails
  } = props
  const dispatch = useDispatch()

  return currentBeaconMalfunctionWithDetails
    ? <Zone>
      <Title>
        Avarie en cours
        <ShowBeaconMalfunction
          data-cy={'beacon-malfunction-current-see-details'}
          onClick={() => {
            setIsCurrentBeaconMalfunctionDetails(true)
            dispatch(setOpenedBeaconMalfunction(currentBeaconMalfunctionWithDetails))
          }}
        >
          voir les détails de l&apos;avarie
          <Arrow/>
        </ShowBeaconMalfunction>
      </Title>
      <CurrentBeaconMalfunctionBody
        currentBeaconMalfunctionWithDetails={currentBeaconMalfunctionWithDetails}
      />
    </Zone>
    : null
}

const Arrow = styled(ArrowSVG)`
  margin-left: 5px;
  vertical-align: text-bottom;
`

const ShowBeaconMalfunction = styled.a`
  text-align: right;
  text-decoration: underline;
  font-size: 11px;
  line-height: 10px;
  color: ${COLORS.slateGray};
  margin-left: auto;
  cursor: pointer;
  width: 150px;
  margin-top: 4px;
`

export default CurrentBeaconMalfunction
