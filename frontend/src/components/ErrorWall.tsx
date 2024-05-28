import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedError } from '@libs/DisplayedError'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'

export type ErrorWallProps = Readonly<{
  displayedErrorKey: DisplayedErrorKey
  isAbsolute?: boolean | undefined
}>
export function ErrorWall({ displayedErrorKey, isAbsolute = false }: ErrorWallProps) {
  const dispatch = useMainAppDispatch()
  const displayedErrorStateValue = useMainAppSelector(store => store.displayedError[displayedErrorKey])

  const handleRetry = () => {
    DisplayedError.retryUseCase(dispatch, displayedErrorKey)
  }

  if (!displayedErrorStateValue) {
    return <></>
  }

  return (
    <Wrapper $isAbsolute={isAbsolute} data-cy="first-loader">
      <p>🔌 {displayedErrorStateValue.message}</p>

      {displayedErrorStateValue.hasRetryableUseCase && (
        <Button accent={Accent.PRIMARY} onClick={handleRetry}>
          Réessayer
        </Button>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isAbsolute: boolean
}>`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  ${p =>
    p.$isAbsolute &&
    css`
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    `}

  > .Element-Button {
    margin-top: 12px;
  }
`
