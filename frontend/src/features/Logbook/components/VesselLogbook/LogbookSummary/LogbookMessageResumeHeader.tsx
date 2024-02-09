import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import ChevronIconSVG from '../../../../icons/Chevron_simple_gris.svg?react'
import NotAcknowledgedSVG from '../../../../icons/Message_non_acquitte.svg?react'
import ArrowSVG from '../../../../icons/Picto_fleche-pleine-droite.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../constants'

import type { Promisable } from 'type-fest'

type LogbookMessageResumeHeaderProps = {
  hasNoMessage: boolean
  isAlert?: boolean
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
  isAlert = false,
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
        <Wrapper>
          <LogbookMessageTitle
            hasNoMessage={hasNoMessage || noContent}
            isLastItem={isLastItem}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {!(hasNoMessage || noContent) && <ChevronIcon $isOpen={isOpen} name={messageType} />}
            <LogbookMessageName
              hasNoMessage={hasNoMessage || noContent}
              isNotAcknowledged={isNotAcknowledged}
              title={rejectionCause || (isDeleted ? 'Message supprimé' : '')}
            >
              {(isNotAcknowledged ||
                isDeleted) && <NotAcknowledgedOrDeleted data-cy="fishing-resume-not-acknowledged-icon" />}
              {LogbookMessageTypeEnum[messageType].name}
            </LogbookMessageName>
            <LogbookMessageResumeText data-cy="vessel-fishing-resume-title" title={onHoverText || ''}>
              {hasNoMessage ? (
                <Gray>Aucun message</Gray>
              ) : (
                <>
                  {title}
                  {isAlert ? <Red /> : null}
                </>
              )}
            </LogbookMessageResumeText>
            {!hasNoMessage && (
              <ShowThisMessage onClick={() => showLogbookMessages && showLogbookMessages(messageType)} />
            )}
          </LogbookMessageTitle>
        </Wrapper>
      )}
    </>
  )
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  /* TODO Replace this color with a theme color. */
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const ShowThisMessage = styled(ArrowSVG)`
  vertical-align: sub;
  float: right;
  padding: 11px 10px 10px 21px;
  cursor: pointer;
`

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

const LogbookMessageResumeText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin: 5px 5px 5px 5px;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  font-weight: 500;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  max-width: 290px;
  display: inline-block;
  line-break: auto;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
`

const LogbookMessageName = styled.span<{
  hasNoMessage: boolean
  isNotAcknowledged: boolean
}>`
  color: ${p => (p.isNotAcknowledged ? p.theme.color.maximumRed : p.theme.color.slateGray)};
  font-weight: 500;
  margin: 5px 0 5px ${p => (p.hasNoMessage ? '27px' : '0px')};
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  text-transform: uppercase;
`

const Wrapper = styled.div`
  margin: 0;
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${p => p.theme.color.slateGray};
`

const LogbookMessageTitle = styled.div<{
  hasNoMessage: boolean
  isLastItem: boolean
  isOpen: boolean
}>`
  height: 35px;
  width: inherit;
  padding: 0 0 0 20px;
  user-select: none;
  ${p => (!p.hasNoMessage ? 'cursor: pointer;' : null)}
  ${p => (!p.isLastItem || p.isOpen ? `border-bottom: 1px solid ${p.theme.color.lightGray};` : null)}
`

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
  name: string
}>`
  transform: rotate(180deg);
  width: 17px;
  float: left;
  margin-right: 10px;
  margin-top: 12px;

  animation: ${p => (p.$isOpen ? `chevron-${p.name}-resume-opening` : `chevron-${p.name}-resume-closing`)} 0.2s ease
    forwards;

  ${p => `
      @keyframes chevron-${p.name}-resume-opening {
        0%   { transform: rotate(180deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes chevron-${p.name}-resume-closing {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(180deg);   }
      }
      `}
`
