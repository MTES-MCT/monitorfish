import { THEME } from '@mtes-mct/monitor-ui'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

export function LoadingSpinnerWall() {
  return (
    <Wrapper data-cy="loading-spinner-wall">
      <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={100} />
      <p>Chargement...</p>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`
