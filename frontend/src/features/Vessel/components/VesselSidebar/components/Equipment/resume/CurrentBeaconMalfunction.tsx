import { COLORS } from '@constants/constants'
import {
  SidebarHeader,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common_styles/common.style'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import styled from 'styled-components'

import { CurrentBeaconMalfunctionBody } from './CurrentBeaconMalfunctionBody'
import { setOpenedBeaconMalfunction } from '../../../../../../../domain/shared_slices/BeaconMalfunction'
import ArrowSVG from '../../../../../../icons/Picto_fleche-pleine-droite.svg?react'

import type { BeaconMalfunctionResumeAndDetails } from '@features/BeaconMalfunction/types'
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
    <StyledSidebarZone>
      <SidebarHeader>
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
      </SidebarHeader>
      <CurrentBeaconMalfunctionBody currentBeaconMalfunctionWithDetails={currentBeaconMalfunctionWithDetails} />
    </StyledSidebarZone>
  ) : null
}

const StyledSidebarZone = styled(SidebarZone)`
  margin-bottom: 10px;
`

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
