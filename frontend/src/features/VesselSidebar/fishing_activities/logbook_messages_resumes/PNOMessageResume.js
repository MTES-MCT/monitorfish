import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import SpeciesAndWeightChart from './SpeciesAndWeightChart'
import { getDateTime } from '../../../../utils'
import { LogbookMessagePNOPurposeType, LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook/logbook'

const PNOMessageResume = props => {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [chartHeight, setChartHeight] = useState(0)
  const [boxHeight, setBoxHeight] = useState(0)

  const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])
  const [speciesNotLandedArray, setSpeciesNotLandedArray] = useState([])
  const [totalWeightNotLanded, setTotalWeightNotLanded] = useState(null)

  useEffect(() => {
    if (props.pnoMessage && props.speciesToWeightOfPNO && props.speciesToWeightOfFAR) {
      const pnoSpeciesAndWeight = Object.keys(props.speciesToWeightOfPNO)
        .map(speciesToWeightKey => props.speciesToWeightOfPNO[speciesToWeightKey])
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          } else {
            return -1
          }
        })
      setSpeciesAndWeightArray(pnoSpeciesAndWeight)

      const speciesNotLandedArray = Object.keys(props.speciesToWeightOfFAR)
        .map(speciesToWeightKey => props.speciesToWeightOfFAR[speciesToWeightKey])
        .filter(speciesToWeight => {
          return !props.pnoMessage.message.catchOnboard
            .some(landedSpecies => landedSpecies.species === speciesToWeight.species)
        })
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          } else {
            return -1
          }
        })
      setSpeciesNotLandedArray(speciesNotLandedArray)
      setBoxHeight(speciesNotLandedArray.length ? speciesNotLandedArray.length * 18 : 0)

      setTotalWeightNotLanded(getTotalFARNotLandedWeight(speciesNotLandedArray))
    }
  }, [props.pnoMessage, props.speciesToWeightOfPNO, props.speciesToWeightOfFAR])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  function getTotalFARNotLandedWeight (speciesNotLandedArray) {
    return speciesNotLandedArray.reduce((subAccumulator, speciesCatch) => {
      return subAccumulator + speciesCatch.weight
    }, 0)
  }

  const getPercentOfTotalWeight = (speciesAndWeightNotLanded, speciesAndWeightTotal) => {
    return parseFloat(((speciesAndWeightNotLanded * 100) / speciesAndWeightTotal).toFixed(1))
  }

  const getPNOMessageResumeTitleText = () => {
    return `${props.pnoMessage.message.portName ? props.pnoMessage.message.portName : props.pnoMessage.message.port}, prévu le ${getDateTime(props.pnoMessage.message.predictedArrivalDatetimeUtc, true)} (UTC)`
  }

  const getPNOMessageResumeTitle = () => {
    return <>{props.pnoMessage.message.portName ? props.pnoMessage.message.portName : props.pnoMessage.message.port}
      ,{' '} prévu le {getDateTime(props.pnoMessage.message.predictedArrivalDatetimeUtc, true)} <Gray>(UTC)</Gray></>
  }

  return <Wrapper>
    <LogbookMessageResumeHeader
      isNotAcknowledged={props.isNotAcknowledged}
      isDeleted={props.isDeleted}
      id={props.id}
      onHoverText={props.hasNoMessage ? null : getPNOMessageResumeTitleText()}
      title={props.hasNoMessage ? null : getPNOMessageResumeTitle()}
      hasNoMessage={props.hasNoMessage}
      showLogbookMessages={props.showLogbookMessages}
      messageType={LogbookMessageTypeEnum.PNO.code.toString()}
      setIsOpen={setIsOpen}
      isOpen={isOpen}/>
    {
      props.hasNoMessage
        ? null
        : <LogbookMessageContent
          id={props.id}
          chartHeight={chartHeight + boxHeight}
          speciesNotLandedArray={speciesNotLandedArray}
          firstUpdate={firstUpdate}
          isOpen={isOpen}
          name={LogbookMessageTypeEnum.PNO.code.toString()}>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date de saisie</Key>
                  <Value>{props.pnoMessage.reportDateTime
                    ? <>Le {getDateTime(props.pnoMessage.reportDateTime, true)}{' '}
                      <Gray>(UTC)</Gray></>
                    : <NoValue>-</NoValue>}</Value>
                </Field>
                <Field>
                  <Key>Port d&apos;arrivée</Key>
                  <Value>{props.pnoMessage.message.port && props.pnoMessage.message.portName
                    ? <>{props.pnoMessage.message.portName} ({props.pnoMessage.message.port})</>
                    : <NoValue>-</NoValue>}</Value>
                </Field>
                <Field>
                  <Key>Raison du préavis</Key>
                  <Value>{props.pnoMessage.message.purpose
                    ? <>{LogbookMessagePNOPurposeType[props.pnoMessage.message.purpose]} ({props.pnoMessage.message.purpose})</>
                    : <NoValue>-</NoValue>}</Value>
                </Field>
                <Field>
                  <Key>Poids total</Key>
                  <Value>{props.totalPNOWeight
                    ? <>{props.totalPNOWeight} kg</>
                    : <NoValue>-</NoValue>}</Value>
                </Field>
              </TableBody>
            </Fields>
            <WeightInfo>
              Tous les poids sont vifs.
            </WeightInfo>
            <SpeciesAndWeightChart
              setChartHeight={setChartHeight}
              compareWithTotalWeight={true}
              speciesAndWeightArray={speciesAndWeightArray}
            />
            {
              speciesNotLandedArray && speciesNotLandedArray.length
                ? <SpeciesNotLanded>
                  Poids des captures non débarquées
                  ({getPercentOfTotalWeight(totalWeightNotLanded, props.totalFARAndDEPWeight)}%)
                  {speciesNotLandedArray && speciesNotLandedArray.length
                    ? speciesNotLandedArray.map(speciesCatch => {
                      return <IndividualSpeciesNotLanded key={speciesCatch.species}>
                        {
                          speciesCatch.speciesName
                            ? <>{speciesCatch.speciesName} ({speciesCatch.species})</>
                            : speciesCatch.species
                        }
                        {''} - {speciesCatch.weight} kg<br/>
                      </IndividualSpeciesNotLanded>
                    })
                    : <NoValue>-</NoValue>}
                </SpeciesNotLanded>
                : null
            }
          </Zone>
        </LogbookMessageContent>
    }
  </Wrapper>
}

const WeightInfo = styled.span`
  margin: 0 0 10px 5px;
  width: 100%;
`

const IndividualSpeciesNotLanded = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  height: 18px;
`

const SpeciesNotLanded = styled.div`
  background: ${COLORS.gainsboro};
  padding: 10px 15px 10px 15px;
  width: max-content;
  margin: 10px 5px 5px 5px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 5px 5px 5px 5px;
  width: inherit;
  display: table;
  margin: 0;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
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
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const Zone = styled.div`
  margin: 0 10px 10px 10px;
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
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${props => props.isOpen ? 1 : 0};
  height: ${props => props.isOpen
    ? props.chartHeight + 160 + (props.speciesNotLandedArray?.length ? 55 : 0)
    : 0
  }px;
  transition: 0.2s all;
  margin-bottom: ${props => props.isOpen ? 5 : -1}px;
`

export default PNOMessageResume
