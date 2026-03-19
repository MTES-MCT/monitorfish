import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { SpeciesAndWeightChart } from './common/SpeciesAndWeightChart'
import { pluralize } from '../../../../../../utils/pluralize'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

import type { SpeciesInsight, SpeciesToSpeciesInsight } from '../../../../types'

type DISMessageResumeProps = {
  allDISMessagesAreNotAcknowledged: boolean
  id: string
  numberOfMessages: number
  showLogbookMessages: (messageType: string) => void
  speciesToWeightOfDIS: SpeciesToSpeciesInsight | undefined
  totalDISWeight: number
}

export function DISMessageResume({
  allDISMessagesAreNotAcknowledged,
  id,
  numberOfMessages,
  showLogbookMessages,
  speciesToWeightOfDIS,
  totalDISWeight
}: DISMessageResumeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [chartHeight, setChartHeight] = useState(0)

  const speciesAndWeightArray = useMemo(() => {
    if (!speciesToWeightOfDIS) {
      return []
    }

    return Object.keys(speciesToWeightOfDIS)
      .map(species => speciesToWeightOfDIS[species] as SpeciesInsight)
      .sort((a, b) => (a.weight < b.weight ? 1 : -1))
  }, [speciesToWeightOfDIS])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDISMessageResumeTitleText = () =>
    totalDISWeight > 0
      ? `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - ${totalDISWeight} kg rejetés au total`
      : `${numberOfMessages} ${pluralize('message', numberOfMessages)} ${
          allDISMessagesAreNotAcknowledged && `non ${pluralize('acquitté', numberOfMessages)}`
        } – aucun rejet`

  return (
    <>
      <LogbookMessageResumeHeader
        hasNoMessage={false}
        isNotAcknowledged={allDISMessagesAreNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.DIS.code.toString()}
        noContent={!totalDISWeight}
        onHoverText={getDISMessageResumeTitleText()}
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title={<>{getDISMessageResumeTitleText()}</>}
      />
      <LogbookMessageContent chartHeight={chartHeight} id={id} isOpen={isOpen}>
        <Zone>
          <WeightInfo>Tous les poids sont vifs.</WeightInfo>
          <SpeciesAndWeightChart
            compareWithTotalWeight
            setChartHeight={setChartHeight}
            speciesAndWeightArray={speciesAndWeightArray}
          />
        </Zone>
      </LogbookMessageContent>
    </>
  )
}

const WeightInfo = styled.span`
  margin: 0 0 10px 5px;
  width: 100%;
`

const Zone = styled.div`
  margin: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const LogbookMessageContent = styled.div<{
  chartHeight: number
  isOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  overflow: hidden;
  padding-left: 20px;
  opacity: ${p => (p.isOpen ? 1 : 0)};
  height: ${p => (p.isOpen && p.chartHeight ? p.chartHeight + 50 : 0)}px;
  transition: 0.2s all;
  border-top: 1px solid ${p => p.theme.color.lightGray};
`
