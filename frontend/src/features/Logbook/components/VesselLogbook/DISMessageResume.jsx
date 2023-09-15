import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../constants'

const DISMessageResume = props => {
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
          } else {
            return -1
          }
        })
      setSpeciesAndWeightArray(array)
    }
  }, [props.speciesToWeightOfDIS])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDISMessageResumeTitleText = () => props.totalDISWeight > 0
    ? `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - ${props.totalDISWeight} kg rejetés au total`
    : `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - aucun rejet ${props.allDISMessagesAreNotAcknowledged ? 'acquitté' : ''}`

  return <Wrapper>
    <LogbookMessageResumeHeader
      isNotAcknowledged={props.allDISMessagesAreNotAcknowledged}
      onHoverText={getDISMessageResumeTitleText()}
      title={<>{getDISMessageResumeTitleText()}</>}
      hasNoMessage={false}
      noContent={!props.totalDISWeight}
      showLogbookMessages={props.showLogbookMessages}
      messageType={LogbookMessageTypeEnum.DIS.code.toString()}
      setIsOpen={setIsOpen}
      isOpen={isOpen}/>
    {
      <LogbookMessageContent
        id={props.id}
        chartHeight={chartHeight}
        species={(speciesAndWeightArray && speciesAndWeightArray.length > 0) ? speciesAndWeightArray.length : 1}
        firstUpdate={firstUpdate}
        isOpen={isOpen}
        name={LogbookMessageTypeEnum.DIS.code.toString()}>
        <Zone>
          <WeightInfo>
            Tous les poids sont vifs.
          </WeightInfo>
          <SpeciesAndWeightChart
            setChartHeight={setChartHeight}
            compareWithTotalWeight={true}
            speciesAndWeightArray={speciesAndWeightArray}
          />
        </Zone>
      </LogbookMessageContent>
    }
  </Wrapper>
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
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${props => props.isOpen ? 1 : 0};
  height: ${props => props.isOpen && props.chartHeight
    ? props.chartHeight + 50
    : 0
  }px;
  transition: 0.2s all;
  margin-bottom: ${props => props.isOpen ? 5 : -1}px;
`

export default DISMessageResume
