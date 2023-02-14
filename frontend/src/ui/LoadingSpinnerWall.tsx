import { THEME } from '@mtes-mct/monitor-ui'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

export type LoadingSpinnerWallProps = {
  message?: string
}
export function LoadingSpinnerWall({ message = 'Chargement...' }: LoadingSpinnerWallProps) {
  return (
    <Wrapper data-cy="loading-spinner-wall">
      <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={48} />
      <p style={{ marginTop: '16px' }}>{message}</p>
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
