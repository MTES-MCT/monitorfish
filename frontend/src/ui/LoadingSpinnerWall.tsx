import { THEME } from '@mtes-mct/monitor-ui'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { ReactComponent as VesselSVG } from '../features/icons/Icone_navire.svg'

export type LoadingSpinnerWallProps = {
  isVesselShowed?: boolean
  message?: string
}
export function LoadingSpinnerWall({ isVesselShowed = false, message = 'Chargement...' }: LoadingSpinnerWallProps) {
  return (
    <Wrapper data-cy="first-loader">
      <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={48} />
      {isVesselShowed && <BigVessel />}
      <p style={{ marginTop: isVesselShowed ? '-12px' : '16px' }}>{message}</p>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`

const BigVessel = styled(VesselSVG)`
  position: relative;
  top: -37px;
  width: 25px;
`
