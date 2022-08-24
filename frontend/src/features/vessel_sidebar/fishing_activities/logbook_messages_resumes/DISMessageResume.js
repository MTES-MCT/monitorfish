import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'

function DISMessageResume(props) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])
  const [chartHeight, setChartHeight] = useState(0)

  useEffect(() => {
    if (props.speciesToWeightOfDIS) {
      const array = Object.keys(props.speciesToWeightOfDIS)
        .map(species => props.speciesToWeightOfDIS[species])
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          } 
            return -1
          
        })
      setSpeciesAndWeightArray(array)
    }
  }, [props.speciesToWeightOfDIS])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDISMessageResumeTitleText = () =>
    props.totalDISWeight > 0
      ? `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - ${
          props.totalDISWeight
        } kg rejetés au total`
      : `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - aucun rejet ${
          props.allDISMessagesAreNotAcknowledged ? 'acquitté' : ''
        }`

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={props.hasNoMessage}
      isNotAcknowledged={props.allDISMessagesAreNotAcknowledged}
      isOpen={isOpen}
      messageType={LogbookMessageTypeEnum.DIS.code.toString()}
      noContent={!props.hasNoMessage && !props.totalDISWeight}
      onHoverText={props.hasNoMessage ? null : getDISMessageResumeTitleText()}
      setIsOpen={setIsOpen}
      showLogbookMessages={props.showLogbookMessages}
      title={props.hasNoMessage ? null : <>{getDISMessageResumeTitleText()}</>}/>
      />
      {props.hasNoMessage ? null : (
        <LogbookMessageContent
          chartHeight={chartHeight}
          firstUpdate={firstUpdate}
          id={props.id}
          isOpen={isOpen}
          name={LogbookMessageTypeEnum.DIS.code.toString()}
          species={(speciesAndWeightArray && speciesAndWeightArray.length > 0) ? speciesAndWeightArray.length : 1}>
          <Zone>
            <WeightInfo>Tous les poids sont vifs.</WeightInfo>
            <SpeciesAndWeightChart
              compareWithTotalWeight={true}
              setChartHeight={setChartHeight}
              speciesAndWeightArray={speciesAndWeightArray}
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
  background: ${COLORS.background};
  width: inherit;
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${COLORS.gray};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  height: ${props => (props.isOpen && props.chartHeight ? props.chartHeight + 50 : 0)}px;
  transition: 0.2s all;
  margin-bottom: ${props => (props.isOpen ? 5 : -1)}px;
`

export default DISMessageResume
