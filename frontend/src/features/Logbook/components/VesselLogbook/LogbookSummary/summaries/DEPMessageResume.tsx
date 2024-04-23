import { getDateTime } from '@utils/getDateTime'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { getCodeWithNameOrDash } from '../../LogbookMessages/messages/utils'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

import type { DEPMessageValue } from '../../../../Logbook.types'
import type { Promisable } from 'type-fest'

type DEPMessageResumeProps = Readonly<{
  depMessage: DEPMessageValue
  hasNoMessage?: boolean
  isDeleted: boolean
  isNotAcknowledged: boolean
  rejectionCause: string | undefined
  showLogbookMessages: (messageType: string) => Promisable<void>
}>
export function DEPMessageResume({
  depMessage,
  hasNoMessage = false,
  isDeleted,
  isNotAcknowledged,
  rejectionCause,
  showLogbookMessages
}: DEPMessageResumeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDEPMessageResumeTitleText = () =>
    `${depMessage.departurePortName ? depMessage.departurePortName : depMessage.departurePort} le ${getDateTime(
      depMessage.departureDatetimeUtc,
      true
    )} (UTC)`

  const getDEPMessageResumeTitle = () => (
    <>
      {depMessage.departurePortName ? depMessage.departurePortName : depMessage.departurePort} le{' '}
      {getDateTime(depMessage.departureDatetimeUtc, true)} <Gray>(UTC)</Gray>
    </>
  )

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={hasNoMessage}
        isDeleted={isDeleted}
        isNotAcknowledged={isNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.DEP.code.toString()}
        onHoverText={hasNoMessage ? null : getDEPMessageResumeTitleText()}
        rejectionCause={rejectionCause}
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title={hasNoMessage ? null : getDEPMessageResumeTitle()}
      />
      {!hasNoMessage && (
        <LogbookMessageContent
          $gearOnboard={depMessage.gearOnboard ? depMessage.gearOnboard.length : 1}
          $isOpen={isOpen}
          speciesOnboard={depMessage.speciesOnboard?.length > 0 ? depMessage.speciesOnboard.length : 1}
        >
          <Zone>
            {depMessage.gearOnboard?.length ? (
              depMessage.gearOnboard.map((gear, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Gear key={`${gear.gear}-${index}`}>
                  <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                  <SubValue>{getCodeWithNameOrDash(gear.gear, gear.gearName)}</SubValue>
                  <br />
                  <SubKey>Maillage</SubKey>
                  <SubValue>{gear.mesh ? <>{gear.mesh} mm</> : <NoValue>-</NoValue>}</SubValue>
                  <SubKey>Dimensions</SubKey>
                  <SubValue>{gear.dimensions ? <>{gear.dimensions} m</> : <NoValue>-</NoValue>}</SubValue>
                  <br />
                </Gear>
              ))
            ) : (
              <NoValue>Pas d&apos;engins à bord</NoValue>
            )}
            <Fields>
              <TableBody>
                <Field>
                  <Key>Captures à bord</Key>
                  <Value>
                    {depMessage.speciesOnboard?.length ? (
                      depMessage.speciesOnboard.map(speciesCatch => (
                        <span key={speciesCatch.species}>
                          {getCodeWithNameOrDash(speciesCatch.species, speciesCatch.speciesName)}- {speciesCatch.weight}{' '}
                          kg
                          <br />
                        </span>
                      ))
                    ) : (
                      <NoValue>aucune</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
        </LogbookMessageContent>
      )}
    </Wrapper>
  )
}

const Gear = styled.div`
  margin-top: 5px;
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  margin-right: 5px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
  font-weight: 500;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin-left: 15px;
  margin-right: 10px;
  margin-top: 10px;
  text-align: left;
`

const Fields = styled.table`
  display: table;
  margin: 15px 0 5px 0;
  width: inherit;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
  line-height: normal;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const Wrapper = styled.li`
  margin: 0;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
  color: ${p => p.theme.color.slateGray};
`

const LogbookMessageContent = styled.div<{
  $gearOnboard: number
  $isOpen: boolean
  speciesOnboard: number
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${p => (p.$isOpen ? 1 : 0)};
  height: ${p => (p.$isOpen ? p.speciesOnboard * 22 + p.$gearOnboard * 50 + 20 : 0)}px;
  transition: 0.2s all;
  margin-bottom: ${p => (p.$isOpen ? 5 : -1)}px;
`
