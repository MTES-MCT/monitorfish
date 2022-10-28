import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'

function FARMessageResume(props) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])
  const [speciesPresentationAndWeightArray, setSpeciesPresentationAndWeightArray] = useState([])
  const [chartHeight, setChartHeight] = useState(0)
  const [initialChartHeight, setInitialChartHeight] = useState(0)

  useEffect(() => {
    if (props.speciesToWeightOfFAR) {
      const array = Object.keys(props.speciesToWeightOfFAR)
        .map(species => props.speciesToWeightOfFAR[species])
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          }

          return -1
        })
      setSpeciesAndWeightArray(array)
    }
  }, [props.speciesToWeightOfFAR])

  useEffect(() => {
    if (props.speciesAndPresentationToWeightOfFAR && speciesAndWeightArray.length) {
      const array = speciesAndWeightArray.map(species => {
        if (
          props.speciesAndPresentationToWeightOfFAR[species.species] &&
          props.speciesAndPresentationToWeightOfFAR[species.species].length
        ) {
          return props.speciesAndPresentationToWeightOfFAR[species.species].sort((a, b) => {
            if (a.weight < b.weight) {
              return 1
            }

            return -1
          })
        }

        return []
      })

      setSpeciesPresentationAndWeightArray(array)
    }
  }, [props.speciesAndPresentationToWeightOfFAR, speciesAndWeightArray])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getFARMessageResumeTitleText = () =>
    props.totalFARWeight > 0
      ? `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - ${
          props.totalFARWeight
        } kg pêchés au total`
      : `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - aucune capture ${
          props.allFARMessagesAreNotAcknowledged ? 'acquittée' : ''
        }`

  useEffect(() => {
    if (chartHeight !== 0 && initialChartHeight === 0) {
      setInitialChartHeight(chartHeight)
    }
  }, [chartHeight])

  const resetChartHeight = () => {
    setChartHeight(0)
  }

  const increaseChartTotalHeight = number => {
    setChartHeight(initialChartHeight + number)
  }

  const resetInitialChartHeight = () => {
    setChartHeight(initialChartHeight)
  }

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={props.hasNoMessage}
        isNotAcknowledged={props.allFARMessagesAreNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.FAR.code.toString()}
        noContent={!props.hasNoMessage && !props.totalFARWeight}
        onHoverText={props.hasNoMessage ? null : getFARMessageResumeTitleText()}
        setIsOpen={setIsOpen}
        showLogbookMessages={props.showLogbookMessages}
        title={props.hasNoMessage ? null : <>{getFARMessageResumeTitleText()}</>}
      />
      {props.hasNoMessage ? null : (
        <LogbookMessageContent
          chartHeight={chartHeight}
          firstUpdate={firstUpdate}
          id={props.id}
          isOpen={isOpen}
          name={LogbookMessageTypeEnum.FAR.code.toString()}
          species={speciesAndWeightArray && speciesAndWeightArray.length > 0 ? speciesAndWeightArray.length : 1}
        >
          <Zone>
            <WeightInfo>Tous les poids sont vifs.</WeightInfo>
            <SpeciesAndWeightChart
              compareWithTotalWeight
              increaseChartTotalHeight={increaseChartTotalHeight}
              resetChartHeight={resetChartHeight}
              resetInitialChartHeight={resetInitialChartHeight}
              setChartHeight={setChartHeight}
              speciesAndWeightArray={speciesAndWeightArray}
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

const LogbookMessageContent = styled.div`
  background: ${COLORS.white};
  width: inherit;
  height: ${props => (props.isOpen && props.chartHeight ? props.chartHeight + 50 : 0)}px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  transition: all 0.2s;
  margin-bottom: ${props => (props.isOpen ? 5 : -1)}px;
`

export default FARMessageResume
