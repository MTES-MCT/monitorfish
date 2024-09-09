import styled from 'styled-components'

import { CurrentBeaconMalfunctionBody } from './CurrentBeaconMalfunctionBody'
import { COLORS } from '../../../../../../constants/constants'
import { setOpenedBeaconMalfunction } from '../../../../../../domain/shared_slices/BeaconMalfunction'
import { useMainAppDispatch } from '../../../../../../hooks/useMainAppDispatch'
import ArrowSVG from '../../../icons/Picto_fleche-pleine-droite.svg?react'
import { Header, Zone } from '../../common_styles/common.style'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../../../domain/entities/beaconMalfunction/types'
import type { Promisable } from 'type-fest'

type CurrentBeaconMalfunctionProps = {
  currentBeaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails | null | undefined
  setIsCurrentBeaconMalfunctionDetails: (isCurrentBeaconMalfunctionDetails: boolean) => Promisable<void>
}
export function CurrentBeaconMalfunction({
  currentBeaconMalfunctionWithDetails,
  setIsCurrentBeaconMalfunctionDetails
}: CurrentBeaconMalfunctionProps) {
  const dispatch = useMainAppDispatch()

  return currentBeaconMalfunctionWithDetails ? (
    <Zone>
      <Header>
        Avarie en cours
        <ShowBeaconMalfunction
          data-cy="beacon-malfunction-current-see-details"
          onClick={() => {
            setIsCurrentBeaconMalfunctionDetails(true)
            dispatch(
              setOpenedBeaconMalfunction({
                beaconMalfunction: currentBeaconMalfunctionWithDetails,
                showTab: true
              })
            )
          }}
        >
          voir les détails de l&apos;avarie
          <Arrow />
        </ShowBeaconMalfunction>
      </Header>
      <CurrentBeaconMalfunctionBody currentBeaconMalfunctionWithDetails={currentBeaconMalfunctionWithDetails} />
    </Zone>
  ) : null
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
