import { THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { InfoPoint } from './InfoPoint'

type InfoBoxProps = Readonly<{
  children: any
  className?: string
  isFormOpened?: boolean
  isInfoTextShown?: boolean
  pointer: boolean
  setIsInfoTextShown?: (status: boolean) => void
}>
export function InfoBox({
  children,
  className,
  isFormOpened = false,
  isInfoTextShown = false,
  pointer,
  setIsInfoTextShown
}: InfoBoxProps) {
  const [isShown, setIsShown] = useState(isInfoTextShown ?? false)

  const onMouseLeave = () => {
    if (!isFormOpened) {
      changeDisplayStatus(false)
    }
  }

  const changeDisplayStatus = status => {
    if (setIsInfoTextShown) {
      setIsInfoTextShown(status)
    }
    setIsShown(status)
  }

  return (
    <InfoTextParent $isFormOpened={isFormOpened} $pointer={pointer} className={className} onMouseLeave={onMouseLeave}>
      {isShown || isFormOpened ? (
        <InfoTextWrapper $isFormOpened={isFormOpened} $isInfoTextShown={isShown} onMouseLeave={onMouseLeave}>
          <InfoPoint
            backgroundColor={isShown || isFormOpened ? THEME.color.charcoal : '#ff3392'}
            margin={isShown || isFormOpened ? '3px 0 0 0' : '0px'}
          />
          {children}
        </InfoTextWrapper>
      ) : (
        <InfoPoint onMouseEnter={() => changeDisplayStatus(true)} onMouseOut={() => changeDisplayStatus(true)} />
      )}
    </InfoTextParent>
  )
}

const InfoTextParent = styled.div<{
  $isFormOpened: boolean
  $pointer: boolean
}>`
  display: flex;
  min-height: 14px;
  min-width: 14px;
  position: relative;
  cursor: ${p => (p.$pointer ? 'pointer' : 'default')};
  ${p => (p.$isFormOpened ? 'left: 384px' : '')};
  ${p => (p.$isFormOpened ? 'margin-top: 8px' : '')};
`

const InfoTextWrapper = styled.div<{
  $isFormOpened: boolean
  $isInfoTextShown: boolean
}>`
  display: flex;
  ${p => (p.$isFormOpened ? '' : 'position: absolute;')};
  border: 1px solid ${p => p.theme.color.lightGray};
  background: ${p => p.theme.color.gainsboro} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  padding: 8px 20px 9px 8px;
  ${p => (p.$isInfoTextShown && !p.$isFormOpened ? 'margin-top: -10px;' : '')}
  box-sizing: border-box;
  z-index: 30;
`
