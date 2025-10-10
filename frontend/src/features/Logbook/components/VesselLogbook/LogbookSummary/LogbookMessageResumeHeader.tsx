import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import { Accent, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import NotAcknowledgedSVG from '../../../../icons/Message_non_acquitte.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../constants'

import type { Promisable } from 'type-fest'

type LogbookMessageResumeHeaderProps = {
  hasNoMessage: boolean
  isDeleted?: boolean
  isLastItem?: boolean
  isNotAcknowledged: boolean
  isOpen: boolean
  messageType: string
  noContent?: boolean
  onHoverText: string | null
  rejectionCause?: string | undefined
  setIsOpen: (isOpen: boolean) => void
  showLogbookMessages?: (messageType: string) => Promisable<void>
  title: JSX.Element | string | null
}

export function LogbookMessageResumeHeader({
  hasNoMessage,
  isDeleted = false,
  isLastItem = false,
  isNotAcknowledged,
  isOpen,
  messageType,
  noContent = false,
  onHoverText,
  rejectionCause,
  setIsOpen,
  showLogbookMessages,
  title
}: LogbookMessageResumeHeaderProps) {
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (messageType && isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen, messageType])

  return (
    <>
      {messageType && (
        <Wrapper $isLastItem={isLastItem} $isOpen={isOpen}>
          {!(hasNoMessage || noContent) && <Chevron isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />}

          <LogbookMessageTitle as={hasNoMessage || noContent ? 'div' : 'button'} onClick={() => setIsOpen(!isOpen)}>
            <LogbookMessageName
              $hasNoMessage={hasNoMessage || noContent}
              $isNotAcknowledged={isNotAcknowledged}
              title={rejectionCause ?? (isDeleted ? 'Message supprimé' : '')}
            >
              {(isNotAcknowledged || isDeleted) && (
                <NotAcknowledgedOrDeleted data-cy="fishing-resume-not-acknowledged-icon" />
              )}
              {LogbookMessageTypeEnum[messageType].name}
            </LogbookMessageName>
            <LogbookMessageResumeText data-cy="vessel-fishing-resume-title" title={onHoverText ?? ''}>
              {hasNoMessage ? <Gray>Aucun message</Gray> : <>{title}</>}
            </LogbookMessageResumeText>
          </LogbookMessageTitle>
          {!hasNoMessage && (
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.FilledArrow}
              onClick={() => showLogbookMessages && showLogbookMessages(messageType)}
              size={Size.SMALL}
              title="Voir le message"
            />
          )}
        </Wrapper>
      )}
    </>
  )
}

const NotAcknowledgedOrDeleted = styled(NotAcknowledgedSVG)`
  width: 12px;
  vertical-align: text-bottom;
  margin-right: 5px;
  margin-bottom: 1px;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const LogbookMessageTitle = styled(TransparentButton)`
  display: flex;
`

const LogbookMessageResumeText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin: 5px 5px 5px 5px;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  font-weight: 500;
  max-width: 290px;
  line-break: auto;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
`

const LogbookMessageName = styled.span<{
  $hasNoMessage: boolean
  $isNotAcknowledged: boolean
}>`
  color: ${p => (p.$isNotAcknowledged ? p.theme.color.maximumRed : p.theme.color.slateGray)};
  font-weight: 500;
  margin: 5px 0 5px ${p => (p.$hasNoMessage ? '35px' : '0px')};
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  text-transform: uppercase;
`

const Wrapper = styled.div<{
  $isLastItem: boolean
  $isOpen: boolean
}>`
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  color: ${p => p.theme.color.slateGray};
  height: 34px;
`

const Chevron = styled(ChevronIconButton)`
  svg {
    color: ${p => p.theme.color.charcoal};
  }
`
