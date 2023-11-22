import { Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { HtmlHTMLAttributes } from 'react'
import type { Promisable } from 'type-fest'

export type DialogProps = HtmlHTMLAttributes<HTMLDivElement> & {
  isCloseButtonHidden?: boolean
  onClose: () => Promisable<void>
  title: string
}
export function OverlayCard({ children, isCloseButtonHidden = false, onClose, title, ...props }: DialogProps) {
  return (
    <StyledMapMenuDialogContainer {...props}>
      <MapMenuDialog.Header>
        <StyledMapMenuDialogTitle title={title}>{title}</StyledMapMenuDialogTitle>
        <MapMenuDialog.CloseButton
          Icon={Icon.Close}
          onClick={onClose}
          style={{ visibility: isCloseButtonHidden ? 'hidden' : 'visible' }}
        />
      </MapMenuDialog.Header>
      {children}
    </StyledMapMenuDialogContainer>
  )
}

const StyledMapMenuDialogContainer = styled(MapMenuDialog.Container)`
  margin: 0;
`

const StyledMapMenuDialogTitle = styled(MapMenuDialog.Title)`
  display: block;
  flex-grow: 1;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`
