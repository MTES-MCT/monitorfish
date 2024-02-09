import { useState } from 'react'
import styled from 'styled-components'

import { pluralize } from '../../../../../../utils/pluralize'
import {
  LogbookMessageType as LogbookMessageTypeEnum,
  LogbookProtectedSpeciesHealthState,
  LogbookProtectedSpeciesSex
} from '../../../../constants'
import { getCodeWithNameOrDash, getValueOrDash } from '../../LogbookMessages/messages/utils'
import { FirstInlineKey, SecondInlineKey } from '../../LogbookMessages/styles'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

import type { CPSMessageValue } from '../../../../Logbook.types'
import type { Promisable } from 'type-fest'

type CPSMessageResumeProps = {
  cpsMessages: CPSMessageValue[]
  hasNoMessageAcknowledged: boolean
  numberOfSpecies: number
  showLogbookMessages: (messageType: string) => Promisable<void>
}
export function CPSMessageResume({
  cpsMessages,
  hasNoMessageAcknowledged,
  numberOfSpecies,
  showLogbookMessages
}: CPSMessageResumeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const species = cpsMessages.map(cps => cps.catches).flat()

  const resumeTitleText = hasNoMessageAcknowledged
    ? `${cpsMessages.length} ${pluralize('message', cpsMessages.length)} non ${pluralize(
        'acquitté',
        cpsMessages.length
      )}`
    : `${cpsMessages.length} ${pluralize('message', cpsMessages.length)} - ${numberOfSpecies} ${pluralize(
        'espèces',
        numberOfSpecies
      )}`

  return (
    <>
      <Wrapper>
        <LogbookMessageResumeHeader
          hasNoMessage={cpsMessages.length === 0}
          isNotAcknowledged={hasNoMessageAcknowledged}
          isOpen={isOpen}
          messageType={LogbookMessageTypeEnum.CPS.code}
          onHoverText={resumeTitleText}
          setIsOpen={setIsOpen}
          showLogbookMessages={showLogbookMessages}
          title={resumeTitleText}
        />
        {!!cpsMessages.length && (
          <LogbookMessageContent $isOpen={isOpen} numberOfSpecies={species.length}>
            {species.map((specy, index) => (
              <Species>
                <StyledFirstInlineKey>Espèce {index + 1}</StyledFirstInlineKey>
                {getCodeWithNameOrDash(specy.species, specy.speciesName)}
                <br />
                <StyledFirstInlineKey>Nombre</StyledFirstInlineKey>
                {getValueOrDash(specy.nbFish)}
                <StyledSecondInlineKey>Sexe</StyledSecondInlineKey>
                {getValueOrDash(specy.sex && LogbookProtectedSpeciesSex[specy.sex])}
                <StyledSecondInlineKey>Poids</StyledSecondInlineKey>
                {getValueOrDash(specy.weight && `${specy.weight} kg`)}
                <br />
                <StyledFirstInlineKey>État de santé</StyledFirstInlineKey>
                {getValueOrDash(specy.healthState && LogbookProtectedSpeciesHealthState[specy.healthState])}
                <br />
              </Species>
            ))}
          </LogbookMessageContent>
        )}
      </Wrapper>
    </>
  )
}

const StyledFirstInlineKey = styled(FirstInlineKey)`
  line-height: 21px;
  margin-right: 10px;
`

const StyledSecondInlineKey = styled(SecondInlineKey)`
  line-height: 21px;
  margin-right: 10px;
  margin-left: 15px;
`

const Species = styled.div`
  margin: 10px 10px 10px 15px;
`

const Wrapper = styled.li`
  margin: 0;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
`

const LogbookMessageContent = styled.div<{
  $isOpen: boolean
  numberOfSpecies: number
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${p => (p.$isOpen ? 1 : 0)};
  height: ${p => (p.$isOpen ? p.numberOfSpecies * 80 : 0)}px;
  transition: 0.2s all;
  margin-bottom: ${p => (p.$isOpen ? 5 : -1)}px;
`
