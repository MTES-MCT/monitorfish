import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'
import { COLORS } from '../../../../constants/constants'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook/constants'

export function FARMessageResume({
  allFARMessagesAreNotAcknowledged,
  hasNoMessage,
  id,
  numberOfMessages,
  showLogbookMessages,
  speciesAndPresentationToWeightOfFAR,
  speciesToWeightOfFAR,
  totalFARWeight
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [chartHeight, setChartHeight] = useState(0)
  const [initialChartHeight, setInitialChartHeight] = useState(0)

  const orderedSpeciesAndWeightArray = useMemo(() => {
    if (!speciesToWeightOfFAR) {
      return []
    }

    return Object.keys(speciesToWeightOfFAR)
      .map(species => speciesToWeightOfFAR[species])
      .sort((a, b) => {
        if (a.weight < b.weight) {
          return 1
        }

        return -1
      })
  }, [speciesToWeightOfFAR])

  const speciesPresentationAndWeightArray = useMemo(
    () =>
      orderedSpeciesAndWeightArray.map(species => {
        if (!speciesAndPresentationToWeightOfFAR[species.species]?.length) {
          return []
        }

        return speciesAndPresentationToWeightOfFAR[species.species].sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          }

          return -1
        })
      }),
    [orderedSpeciesAndWeightArray, speciesAndPresentationToWeightOfFAR]
  )

  const farMessageResumeTitleText =
    totalFARWeight > 0
      ? `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - ${totalFARWeight} kg pêchés au total`
      : `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - aucune capture ${
          allFARMessagesAreNotAcknowledged ? 'acquittée' : ''
        }`

  useEffect(() => {
    if (chartHeight !== 0 && initialChartHeight === 0) {
      setInitialChartHeight(chartHeight)
    }
  }, [chartHeight, initialChartHeight])

  const increaseChartTotalHeight = useCallback(
    number => {
      setChartHeight(initialChartHeight + number)
    },
    [initialChartHeight]
  )

  const resetInitialChartHeight = useCallback(() => {
    setChartHeight(initialChartHeight)
  }, [initialChartHeight])

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={hasNoMessage}
        isNotAcknowledged={allFARMessagesAreNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.FAR.code.toString()}
        noContent={!hasNoMessage && !totalFARWeight}
        onHoverText={!hasNoMessage && farMessageResumeTitleText}
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title={!hasNoMessage && <>{farMessageResumeTitleText}</>}
      />
      {!hasNoMessage && (
        <LogbookMessageContent chartHeight={chartHeight} id={id} isOpen={isOpen}>
          <Zone>
            <WeightInfo>Tous les poids sont vifs.</WeightInfo>
            <SpeciesAndWeightChart
              compareWithTotalWeight
              increaseChartTotalHeight={increaseChartTotalHeight}
              resetInitialChartHeight={resetInitialChartHeight}
              setChartHeight={setChartHeight}
              speciesAndWeightArray={orderedSpeciesAndWeightArray}
              speciesPresentationAndWeightArray={speciesPresentationAndWeightArray}
            />
          </Zone>
        </LogbookMessageContent>
      )}
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
  color: ${COLORS.slateGray};
`

const LogbookMessageContent = styled.div<{
  chartHeight: number
  isOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  height: ${props => (props.isOpen && props.chartHeight ? props.chartHeight + 50 : 0)}px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  transition: all 0.2s;
  margin-bottom: ${props => (props.isOpen ? 5 : -1)}px;
`
