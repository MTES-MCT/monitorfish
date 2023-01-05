/* eslint-disable react/jsx-props-no-spreading */
/**
 * Modal taken from https://github.com/singularity-ui/core/blob/main/components/Dialog/index.tsx
 */
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

import type { HTMLAttributes } from 'react'

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
  isAbsolute?: boolean
}
function BareDialog({ children, isAbsolute = false, ...props }: DialogProps) {
  return (
    <StyledDialog isAbsolute={isAbsolute} {...props} onClick={e => e.stopPropagation()}>
      <Overlay isAbsolute={isAbsolute} />

      <Window isAbsolute={isAbsolute}>{children}</Window>
    </StyledDialog>
  )
}

BareDialog.displayName = 'Dialog'

export const StyledDialog = styled.div<{
  isAbsolute: boolean
}>`
  position: ${p => (p.isAbsolute ? 'absolute' : 'fixed')};
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  z-index: 9000;
`

const Action = styled.div`
  background-color: ${COLORS.white};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  display: flex;
  flex-direction: column-reverse;
  padding: 8px 8px 8px 8px;
  > button {
    margin-bottom: 2px;
  }
  @media (min-width: 740px) {
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding: 48px 8px 48px 8px;
    > button {
      margin-bottom: 0;
      margin-right: 2px;
    }
  }
`
const Body = styled.div`
  background-color: ${COLORS.white};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  display: flex;
  flex-direction: column;
  padding: 8px 8px 8px 8px;
  text-align: center;
  > p {
    color: ${COLORS.slateGray};
    padding-top: 2px;
  }
  @media (min-width: 740px) {
    padding: 48px 8px 8px 8px;
    text-align: center;
  }
`

const Overlay = styled.div<{
  isAbsolute: boolean
}>`
  background-color: ${COLORS.charcoal};
  bottom: 0;
  left: 0;
  opacity: 0.53;
  position: ${p => (p.isAbsolute ? 'absolute' : 'fixed')};
  right: 0;
  top: 0;
  z-index: 1;
`
const Title = styled.h4`
  font-size: 125%;
  font-weight: 500;
  line-height: 48px;
  padding-bottom: 2px;
  height: 48px;
  color: ${COLORS.white};
  background-color: ${COLORS.charcoal};
  text-align: center;
`
const Window = styled.div<{
  isAbsolute: boolean
}>`
  border-radius: 2px;
  bottom: 100px;
  box-shadow: 4px;
  max-width: 32rem;
  position: ${p => (p.isAbsolute ? 'absolute' : 'fixed')};
  width: calc(100% - 2 * 8px);
  z-index: 1;
  @media (min-width: 740px) {
    bottom: auto;
    min-width: 586px;
  }
`
export const Dialog = Object.assign(BareDialog, {
  Action,
  Body,
  Title
})
