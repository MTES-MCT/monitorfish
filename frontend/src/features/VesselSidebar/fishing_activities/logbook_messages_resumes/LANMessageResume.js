import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import LogbookMessageResumeHeader from './LogbookMessageResumeHeader'
import { getDateTime } from '../../../../utils'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../domain/entities/logbook/logbook'
import { COMMON_ALERT_TYPE_OPTION } from '../../../../domain/entities/alerts/constants'

const LANMessageResume = props => {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [chartHeight, setChartHeight] = useState(0)

  useEffect(() => {
    if (props.lanMessage) {
      const count = props.lanMessage.catchLanded.reduce(filterSameSpecies(), [])
      const height = count.length > 0 ? count.length * 49 : 0
      setChartHeight(height)
    }
  }, [props.lanMessage])

  const getPortName = message => {
    if (message.portName && message.port) {
      return (
        <>
          {message.portName} ({message.port})
        </>
      )
    } else if (message.port) {
      return <>{message.port}</>
    }

    return <NoValue>-</NoValue>
  }

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getWeightOverToleranceInfo = () => {
    if (
      props.catchesOverToleranceAlert &&
      COMMON_ALERT_TYPE_OPTION.PNO_LAN_WEIGHT_TOLERANCE_ALERT.nameWithAlertDetails
    ) {
      return COMMON_ALERT_TYPE_OPTION.PNO_LAN_WEIGHT_TOLERANCE_ALERT.nameWithAlertDetails(
        props.catchesOverToleranceAlert.percentOfTolerance,
        props.catchesOverToleranceAlert.minimumWeightThreshold
      )
    }

    return ''
  }

  function filterSameSpecies() {
    return (acc, current) => {
      const x = acc.find(item => item.species === current.species)
      if (!x) {
        return acc.concat([current])
      } else {
        return acc
      }
    }
  }

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        isNotAcknowledged={props.isNotAcknowledged}
        isDeleted={props.isDeleted}
        isAlert={!!props.catchesOverToleranceAlert}
        title={
          props.hasNoMessage
            ? null
            : props.catchesOverToleranceAlert
            ? COMMON_ALERT_TYPE_OPTION.PNO_LAN_WEIGHT_TOLERANCE_ALERT.name
            : null
        }
        onHoverText={getWeightOverToleranceInfo()}
        hasNoMessage={props.hasNoMessage}
        showLogbookMessages={props.showLogbookMessages}
        messageType={LogbookMessageTypeEnum.LAN.code.toString()}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        isLastItem={true}
      />
      {props.hasNoMessage ? null : (
        <LogbookMessageContent
          id={props.id}
          chartHeight={chartHeight}
          firstUpdate={firstUpdate}
          isOpen={isOpen}
          name={LogbookMessageTypeEnum.LAN.code.toString()}
        >
          <Zone>
            <Fields withoutMarginBottom={true}>
              <TableBody>
                <Field>
                  <Key>Date de fin de débarquement</Key>
                  <Value>
                    {props.lanMessage.landingDatetimeUtc ? (
                      getDateTime(props.lanMessage.landingDatetimeUtc, true)
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Port de débarquement</Key>
                  <Value>{getPortName(props.lanMessage)}</Value>
                </Field>
              </TableBody>
            </Fields>
            <Fields withoutMarginTop={true} withoutMarginBottom={true}>
              <TableBody>
                <Field>
                  <Key>Poids débarqué</Key>
                  <Value>
                    {props.totalLANWeight ? props.totalLANWeight : <NoValue>-</NoValue>} kg
                    {props.totalPNOWeight ? <> sur les {props.totalPNOWeight} kg annoncés dans le PNO</> : null}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
            <WeightInfo>
              Tous les poids sont vifs.
            </WeightInfo>
            {props.lanMessage.catchLanded?.length ? (
              props.lanMessage.catchLanded.reduce(filterSameSpecies(), []).map((speciesCatch, index) => {
                return (
                  <Species key={index}>
                    <SubKey>Espèce {index + 1}</SubKey>{' '}
                    <SubValue>
                      {speciesCatch.speciesName ? (
                        <>
                          {speciesCatch.speciesName} ({speciesCatch.species})
                        </>
                      ) : (
                        speciesCatch.species
                      )}
                      {props.catchesOverToleranceAlert &&
                      props.catchesOverToleranceAlert.catchesOverTolerance &&
                      props.catchesOverToleranceAlert.catchesOverTolerance.length ? (
                        props.catchesOverToleranceAlert.catchesOverTolerance.some(
                          catchWithAlert => catchWithAlert.lan.species === speciesCatch.species
                        ) ? (
                          <OverWeightTolerance title={getWeightOverToleranceInfo()}>
                            <OverWeightToleranceText>10 %</OverWeightToleranceText>
                          </OverWeightTolerance>
                        ) : null
                      ) : null}
                    </SubValue>
                    <br />
                    <Weights>
                      <Weight>
                        <SubKey>Poids FAR</SubKey>
                        <SubValueWeight
                          withPNOWeight={props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]}
                        >
                          {props.speciesToWeightOfFAR && props.speciesToWeightOfFAR[speciesCatch.species] ? (
                            <span title={`${props.speciesToWeightOfFAR[speciesCatch.species].weight} kg`}>
                              {props.speciesToWeightOfFAR[speciesCatch.species].weight} kg
                            </span>
                          ) : (
                            <NoValue>0 kg</NoValue>
                          )}
                        </SubValueWeight>
                      </Weight>
                      <Weight>
                        <SubKey>Poids PNO</SubKey>
                        <SubValueWeight
                          withPNOWeight={props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]}
                        >
                          {props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species] ? (
                            <span title={`${props.speciesToWeightOfPNO[speciesCatch.species].weight} kg`}>
                              {props.speciesToWeightOfPNO[speciesCatch.species].weight} kg
                            </span>
                          ) : (
                            <NoValue>0 kg</NoValue>
                          )}
                        </SubValueWeight>
                      </Weight>
                      <Weight>
                        <SubKey>Poids LAN</SubKey>
                        <SubValueWeight
                          withPNOWeight={props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]}
                        >
                          {props.speciesToWeightOfLAN && props.speciesToWeightOfLAN[speciesCatch.species] ? (
                            <span title={`${props.speciesToWeightOfLAN[speciesCatch.species].weight} kg`}>
                              {props.speciesToWeightOfLAN[speciesCatch.species].weight} kg
                            </span>
                          ) : (
                            <NoValue>0 kg</NoValue>
                          )}
                        </SubValueWeight>
                      </Weight>
                    </Weights>
                  </Species>
                )
              })
            ) : (
              <Gray>Aucune capture à bord</Gray>
            )}
          </Zone>
        </LogbookMessageContent>
      )}
    </Wrapper>
  )
}

const WeightInfo = styled.span`
  margin: 10px 0 0 5px;
  width: 100%;
`

const OverWeightToleranceText = styled.span`
  vertical-align: text-top;
  line-height: 9px;
  margin: 0 0 0 3px;
`

const OverWeightTolerance = styled.span`
  border-radius: 11px;
  background: #e1000f;
  font-size: 11px;
  color: ${p => p.theme.color.white};
  margin: 7px 7px 7px 5px;
  height: 17px;
  padding: 3px 5px 0px 2px;
`

const Weights = styled.div`
  display: flex;
`

const Weight = styled.div`
  flex: 1 1 0;
`

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
  font-size: 13px;
  text-align: center;
  width: -moz-available;
  width: -webkit-fill-available;
`

const Species = styled.div`
  margin-top: 10px;
  margin-left: 5px;
  width: -moz-available;
  width: -webkit-fill-available;
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
  font-weight: 500;
`

const SubValueWeight = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
  max-width: ${props => (props.withPNOWeight ? '50' : '90')}px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
  font-weight: 500;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 0px 5px ${props => (props.withoutMarginBottom ? '0' : '5px')} 5px;
  width: inherit;
  display: table;
  margin: 0;
  line-height: 0.2em;
  margin-top: ${props => (props.withoutMarginTop ? '0' : '5px')};
  margin-bottom: ${props => (props.withoutMarginBottom ? '0' : '5px')};
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
  line-height: normal;
`

const Zone = styled.div`
  margin: 10px 10px 10px 10px;
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
  background: ${p => p.theme.color.white};
  width: inherit;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  height: ${props => (props.isOpen ? props.chartHeight + 105 + 30 : 0)}px;
  transition: 0.2s all;
`

export default LANMessageResume
