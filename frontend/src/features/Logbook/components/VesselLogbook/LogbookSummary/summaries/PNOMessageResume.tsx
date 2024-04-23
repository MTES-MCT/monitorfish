import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { getDateTime } from '@utils/getDateTime'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { SpeciesAndWeightChart } from './common/SpeciesAndWeightChart'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { getCodeWithNameOrDash, getDatetimeOrDash } from '../../LogbookMessages/messages/utils'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

import type { SpeciesInsight, SpeciesToSpeciesInsight } from '../../../../types'

type PNOMessageResumeProps = Readonly<{
  hasNoMessage?: boolean
  id: string
  isDeleted: boolean
  isNotAcknowledged: boolean
  pnoMessage: {
    message: {
      catchOnboard: {
        species: string
        speciesName: string
        weight: number
      }[]
      port: string
      portName: string
      predictedArrivalDatetimeUtc: string
      purpose: string
    }
    reportDateTime: string
  }
  showLogbookMessages: (messageType: string) => void
  speciesToWeightOfFAR: SpeciesToSpeciesInsight | undefined
  speciesToWeightOfPNO: SpeciesToSpeciesInsight | undefined
  totalFARAndDEPWeight: number
  totalPNOWeight: number
}>
export function PNOMessageResume({
  hasNoMessage = false,
  id,
  isDeleted,
  isNotAcknowledged = false,
  pnoMessage,
  showLogbookMessages,
  speciesToWeightOfFAR,
  speciesToWeightOfPNO,
  totalFARAndDEPWeight,
  totalPNOWeight
}: PNOMessageResumeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [chartHeight, setChartHeight] = useState(0)
  const [boxHeight, setBoxHeight] = useState(0)

  const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState<SpeciesInsight[]>([])
  const [speciesNotLandedArray, setSpeciesNotLandedArray] = useState<SpeciesInsight[]>([])
  const [totalWeightNotLanded, setTotalWeightNotLanded] = useState(null)

  useEffect(() => {
    if (pnoMessage && speciesToWeightOfPNO && speciesToWeightOfFAR) {
      const pnoSpeciesAndWeight = Object.keys(speciesToWeightOfPNO)
        .map(speciesToWeightKey => speciesToWeightOfPNO[speciesToWeightKey] as SpeciesInsight)
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          }

          return -1
        })
      setSpeciesAndWeightArray(pnoSpeciesAndWeight)

      const nextSpeciesNotLandedArray = Object.keys(speciesToWeightOfFAR)
        .map(
          speciesToWeightKey =>
            speciesToWeightOfFAR[speciesToWeightKey] as {
              species: string
              speciesName: string
              weight: number
            }
        )
        .filter(
          speciesToWeight =>
            !pnoMessage.message.catchOnboard.some(landedSpecies => landedSpecies.species === speciesToWeight.species)
        )
        .sort((a, b) => {
          if (a.weight < b.weight) {
            return 1
          }

          return -1
        })
      setSpeciesNotLandedArray(nextSpeciesNotLandedArray)
      setBoxHeight(nextSpeciesNotLandedArray.length ? nextSpeciesNotLandedArray.length * 18 : 0)

      setTotalWeightNotLanded(getTotalFARNotLandedWeight(nextSpeciesNotLandedArray))
    }
  }, [pnoMessage, speciesToWeightOfPNO, speciesToWeightOfFAR])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  // TODO Move that to a utils file.
  function getTotalFARNotLandedWeight(_speciesNotLandedArray) {
    return _speciesNotLandedArray.reduce((subAccumulator, speciesCatch) => subAccumulator + speciesCatch.weight, 0)
  }

  // TODO Move that to a utils file.
  const getPercentOfTotalWeight = (speciesAndWeightNotLanded, speciesAndWeightTotal) =>
    parseFloat(((speciesAndWeightNotLanded * 100) / speciesAndWeightTotal).toFixed(1))

  // TODO Move that to a utils file.
  const getPNOMessageResumeTitleText = () =>
    `${pnoMessage.message.portName ? pnoMessage.message.portName : pnoMessage.message.port}, prévu le ${getDateTime(
      pnoMessage.message.predictedArrivalDatetimeUtc,
      true
    )} (UTC)`

  const getPNOMessageResumeTitle = () => (
    <>
      {pnoMessage.message.portName ? pnoMessage.message.portName : pnoMessage.message.port}, prévu le{' '}
      {getDateTime(pnoMessage.message.predictedArrivalDatetimeUtc, true)} <Gray>(UTC)</Gray>
    </>
  )

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={hasNoMessage}
        isDeleted={isDeleted}
        isNotAcknowledged={isNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.PNO.code.toString()}
        onHoverText={hasNoMessage ? null : getPNOMessageResumeTitleText()}
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title={hasNoMessage ? null : getPNOMessageResumeTitle()}
      />
      {!hasNoMessage && (
        <LogbookMessageContent
          chartHeight={chartHeight + boxHeight}
          id={id}
          isOpen={isOpen}
          speciesNotLandedArray={speciesNotLandedArray}
        >
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date de saisie</Key>
                  <Value>{getDatetimeOrDash(pnoMessage.reportDateTime)}</Value>
                </Field>
                <Field>
                  <Key>Port d&apos;arrivée</Key>
                  <Value>{getCodeWithNameOrDash(pnoMessage.message.port, pnoMessage.message.portName)}</Value>
                </Field>
                <Field>
                  <Key>Raison du préavis</Key>
                  <Value>
                    {pnoMessage.message.purpose ? (
                      <>
                        {PriorNotification.PURPOSE_LABEL[pnoMessage.message.purpose]} ({pnoMessage.message.purpose})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Poids total</Key>
                  <Value>{totalPNOWeight ? <>{totalPNOWeight} kg</> : <NoValue>-</NoValue>}</Value>
                </Field>
              </TableBody>
            </Fields>
            <WeightInfo>Tous les poids sont vifs.</WeightInfo>
            <SpeciesAndWeightChart
              compareWithTotalWeight
              setChartHeight={setChartHeight}
              speciesAndWeightArray={speciesAndWeightArray}
            />
            {!!speciesNotLandedArray && speciesNotLandedArray.length > 0 ? (
              <SpeciesNotLanded>
                Poids des captures non débarquées ({getPercentOfTotalWeight(totalWeightNotLanded, totalFARAndDEPWeight)}
                %)
                {!!speciesNotLandedArray && speciesNotLandedArray.length > 0 ? (
                  speciesNotLandedArray.map(speciesCatch => (
                    <IndividualSpeciesNotLanded key={speciesCatch.species}>
                      {getCodeWithNameOrDash(speciesCatch.species, speciesCatch.speciesName)}- {speciesCatch.weight} kg
                      <br />
                    </IndividualSpeciesNotLanded>
                  ))
                ) : (
                  <NoValue>-</NoValue>
                )}
              </SpeciesNotLanded>
            ) : null}
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

const IndividualSpeciesNotLanded = styled.div`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  height: 18px;
`

const SpeciesNotLanded = styled.div`
  background: ${p => p.theme.color.gainsboro};
  padding: 10px 15px 10px 15px;
  width: max-content;
  margin: 10px 5px 5px 5px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 5px 5px 5px 5px;
  width: inherit;
  display: table;
  margin: 0;
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
  color: ${p => p.theme.color.slateGray};
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
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
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
  color: ${p => p.theme.color.slateGray};
`

const LogbookMessageContent = styled.div<{
  chartHeight: number
  isOpen: boolean
  speciesNotLandedArray: any
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  opacity: ${p => (p.isOpen ? 1 : 0)};
  height: ${p => (p.isOpen ? p.chartHeight + 160 + (p.speciesNotLandedArray?.length ? 55 : 0) : 0)}px;
  transition: 0.2s all;
  margin-bottom: ${p => (p.isOpen ? 5 : -1)}px;
`
