import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { SpeciesAndWeightChart } from './common/SpeciesAndWeightChart'
import { pluralize } from '../../../../../../utils/pluralize'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

export function FARMessageResume({
  allFARMessagesAreNotAcknowledged,
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

  const farMessageResumeTitleText = useMemo(() => {
    if (totalFARWeight > 0) {
      return `${numberOfMessages} message${numberOfMessages > 1 ? 's' : ''} - ${totalFARWeight} kg pêchés au total`
    }

    if (!allFARMessagesAreNotAcknowledged) {
      return `${numberOfMessages} ${pluralize('message', numberOfMessages)} – aucune capture`
    }

    return `${numberOfMessages} ${pluralize('message', numberOfMessages)} non ${pluralize(
      'acquitté',
      numberOfMessages
    )} – aucune capture`
  }, [totalFARWeight, numberOfMessages, allFARMessagesAreNotAcknowledged])

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
    <>
      <LogbookMessageResumeHeader
        hasNoMessage={false}
        isNotAcknowledged={allFARMessagesAreNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.FAR.code.toString()}
        noContent={!totalFARWeight}
        onHoverText={farMessageResumeTitleText}
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title={<>{farMessageResumeTitleText}</>}
      />
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
  height: ${props => (props.isOpen && props.chartHeight ? props.chartHeight + 50 : 0)}px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  overflow: hidden;
  padding-left: 20px;
  transition: all 0.2s;
  border-top: 1px solid ${p => p.theme.color.lightGray};
`
