import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook'

const FARMessageResume = props => {
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
          } else {
            return -1
          }
        })
      setSpeciesAndWeightArray(array)
    }
  }, [props.speciesToWeightOfFAR])

  useEffect(() => {
    if (props.speciesAndPresentationToWeightOfFAR && speciesAndWeightArray.length) {
      const array = speciesAndWeightArray.map(species => {
        if (props.speciesAndPresentationToWeightOfFAR[species.species] && props.speciesAndPresentationToWeightOfFAR[species.species].length) {
          return props.speciesAndPresentationToWeightOfFAR[species.species].sort((a, b) => {
            if (a.weight < b.weight) {
              return 1
            } else {
              return -1
            }
          })
        } else {
          return []
        }
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
      ? `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - ${props.totalFARWeight} kg pêchés au total`
      : `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - aucune capture`

  const getFARMessageResumeTitle = () => {
    return props.totalFARWeight > 0
      ? <>{props.numberOfMessages} message{props.numberOfMessages > 1 ? 's' : ''} - {props.totalFARWeight} kg pêchés au
        total</>
      : <>{props.numberOfMessages} message{props.numberOfMessages > 1 ? 's' : ''} - aucune capture</>
  }

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

  return <Wrapper>
    <LogbookMessageResumeHeader
      onHoverText={props.hasNoMessage ? null : getFARMessageResumeTitleText()}
      title={props.hasNoMessage ? null : getFARMessageResumeTitle()}
      hasNoMessage={props.hasNoMessage}
      noContent={!props.hasNoMessage && !props.totalFARWeight}
      showLogbookMessages={props.showLogbookMessages}
      messageType={LogbookMessageTypeEnum.FAR.code.toString()}
      setIsOpen={setIsOpen}
      isOpen={isOpen}/>
    {
      props.hasNoMessage
        ? null
        : <LogbookMessageContent
          id={props.id}
          chartHeight={chartHeight}
          species={(speciesAndWeightArray && speciesAndWeightArray.length > 0) ? speciesAndWeightArray.length : 1}
          firstUpdate={firstUpdate}
          isOpen={isOpen}
          name={LogbookMessageTypeEnum.FAR.code.toString()}>
          <Zone>
            <SpeciesAndWeightChart
              setChartHeight={setChartHeight}
              resetChartHeight={resetChartHeight}
              compareWithTotalWeight={true}
              speciesAndWeightArray={speciesAndWeightArray}
              speciesPresentationAndWeightArray={speciesPresentationAndWeightArray}
              increaseChartTotalHeight={increaseChartTotalHeight}
              resetInitialChartHeight={resetInitialChartHeight}
            />
          </Zone>
        </LogbookMessageContent>
    }
  </Wrapper>
}

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
  background: ${COLORS.background};
  width: inherit;
  height: ${props => props.isOpen && props.chartHeight ? props.chartHeight + 20 : 0}px;
  opacity: ${props => props.isOpen ? 1 : 0};
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${COLORS.gray};
  transition: all 0.2s;
  margin-bottom: ${props => props.isOpen ? 5 : -1}px;
`

export default FARMessageResume
