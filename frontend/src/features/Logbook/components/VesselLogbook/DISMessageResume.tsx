import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageResumeHeader } from './LogbookMessageResumeHeader'
import { SpeciesAndWeightChart } from './SpeciesAndWeightChart'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../constants'

import type { SpeciesInsight, SpeciesToSpeciesInsight } from '../../types'

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
  const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState<SpeciesInsight[]>([])
  const [chartHeight, setChartHeight] = useState(0)

  useEffect(() => {
    if (speciesToWeightOfDIS) {
      const nextSpeciesAndWeightArray = Object.keys(speciesToWeightOfDIS)
        .map(species => speciesToWeightOfDIS[species] as SpeciesInsight)
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          }

          return -1
        })
      setSpeciesAndWeightArray(nextSpeciesAndWeightArray)
    }
  }, [speciesToWeightOfDIS])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDISMessageResumeTitleText = () =>
    totalDISWeight > 0
      ? `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - ${totalDISWeight} kg rejetés au total`
      : `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - aucun rejet ${
          allDISMessagesAreNotAcknowledged ? 'acquitté' : ''
        }`

  return (
    <Wrapper>
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
    </Wrapper>
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

const Wrapper = styled.li`
  margin: 0;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
  color: ${p => p.theme.color.slateGray};
`

const LogbookMessageContent = styled.div<{
  chartHeight: number
  isOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${p => (p.isOpen ? 1 : 0)};
  height: ${p => (p.isOpen && p.chartHeight ? p.chartHeight + 50 : 0)}px;
  transition: 0.2s all;
  margin-bottom: ${p => (p.isOpen ? 5 : -1)}px;
`
