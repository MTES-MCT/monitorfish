import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { getCodeWithNameOrDash, getDatetimeOrDash, getValueOrDash } from '../../LogbookMessages/messages/utils'
import { LogbookMessageResumeHeader } from '../LogbookMessageResumeHeader'

import type { Promisable } from 'type-fest'

type LANMessageResumeProps = {
  hasNoMessage?: boolean
  isDeleted: boolean
  isNotAcknowledged: boolean
  lanMessage: any
  showLogbookMessages: (messageType: string) => Promisable<void>
  speciesToWeightOfFAR: any
  speciesToWeightOfLAN: any
  speciesToWeightOfPNO: any
  totalLANWeight: number
  totalPNOWeight: number
}
export function LANMessageResume({
  hasNoMessage = false,
  isDeleted,
  isNotAcknowledged,
  lanMessage,
  showLogbookMessages,
  speciesToWeightOfFAR,
  speciesToWeightOfLAN,
  speciesToWeightOfPNO,
  totalLANWeight,
  totalPNOWeight
}: LANMessageResumeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [chartHeight, setChartHeight] = useState(0)

  useEffect(() => {
    if (lanMessage) {
      const count = lanMessage.catchLanded.reduce(filterSameSpecies(), [])
      const height = count.length > 0 ? count.length * 49 : 0
      setChartHeight(height)
    }
  }, [lanMessage])

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  function filterSameSpecies() {
    return (acc, current) => {
      const x = acc.find(item => item.species === current.species)
      if (!x) {
        return acc.concat([current])
      }

      return acc
    }
  }

  return (
    <Wrapper>
      <LogbookMessageResumeHeader
        hasNoMessage={hasNoMessage}
        isDeleted={isDeleted}
        isLastItem
        isNotAcknowledged={isNotAcknowledged}
        isOpen={isOpen}
        messageType={LogbookMessageTypeEnum.LAN.code.toString()}
        onHoverText=""
        setIsOpen={setIsOpen}
        showLogbookMessages={showLogbookMessages}
        title=""
      />
      {!hasNoMessage && (
        <LogbookMessageContent chartHeight={chartHeight} isOpen={isOpen}>
          <Zone>
            <Fields withoutMarginBottom>
              <TableBody>
                <Field>
                  <Key>Date de fin de débarquement</Key>
                  <Value>{getDatetimeOrDash(lanMessage.landingDatetimeUtc)}</Value>
                </Field>
                <Field>
                  <Key>Port de débarquement</Key>
                  <Value>{getCodeWithNameOrDash(lanMessage.port, lanMessage.portName)}</Value>
                </Field>
              </TableBody>
            </Fields>
            <Fields withoutMarginBottom withoutMarginTop>
              <TableBody>
                <Field>
                  <Key>Poids débarqué</Key>
                  <Value>
                    {getValueOrDash(totalLANWeight)} kg
                    {!!totalPNOWeight && <> sur les {totalPNOWeight} kg annoncés dans le PNO</>}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
            <WeightInfo>Tous les poids sont vifs.</WeightInfo>
            {lanMessage.catchLanded?.length ? (
              lanMessage.catchLanded.reduce(filterSameSpecies(), []).map((speciesCatch, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Species key={index}>
                  <SubKey>Espèce {index + 1}</SubKey>{' '}
                  <SubValue>{getCodeWithNameOrDash(speciesCatch.species, speciesCatch.speciesName)}</SubValue>
                  <br />
                  <Weights>
                    <Weight>
                      <SubKey>Poids FAR</SubKey>
                      <SubValueWeight
                        $withPNOWeight={speciesToWeightOfPNO && speciesToWeightOfPNO[speciesCatch.species]}
                      >
                        {speciesToWeightOfFAR && speciesToWeightOfFAR[speciesCatch.species] ? (
                          <span title={`${speciesToWeightOfFAR[speciesCatch.species].weight} kg`}>
                            {speciesToWeightOfFAR[speciesCatch.species].weight} kg
                          </span>
                        ) : (
                          <NoValue>0 kg</NoValue>
                        )}
                      </SubValueWeight>
                    </Weight>
                    <Weight>
                      <SubKey>Poids PNO</SubKey>
                      <SubValueWeight
                        $withPNOWeight={speciesToWeightOfPNO && speciesToWeightOfPNO[speciesCatch.species]}
                      >
                        {speciesToWeightOfPNO && speciesToWeightOfPNO[speciesCatch.species] ? (
                          <span title={`${speciesToWeightOfPNO[speciesCatch.species].weight} kg`}>
                            {speciesToWeightOfPNO[speciesCatch.species].weight} kg
                          </span>
                        ) : (
                          <NoValue>0 kg</NoValue>
                        )}
                      </SubValueWeight>
                    </Weight>
                    <Weight>
                      <SubKey>Poids LAN</SubKey>
                      <SubValueWeight
                        $withPNOWeight={speciesToWeightOfPNO && speciesToWeightOfPNO[speciesCatch.species]}
                      >
                        {speciesToWeightOfLAN && speciesToWeightOfLAN[speciesCatch.species] ? (
                          <span title={`${speciesToWeightOfLAN[speciesCatch.species].weight} kg`}>
                            {speciesToWeightOfLAN[speciesCatch.species].weight} kg
                          </span>
                        ) : (
                          <NoValue>0 kg</NoValue>
                        )}
                      </SubValueWeight>
                    </Weight>
                  </Weights>
                </Species>
              ))
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

const Weights = styled.div`
  display: flex;
`

const Weight = styled.div`
  flex: 1 1 0;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
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
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
  font-weight: 500;
`

const SubValueWeight = styled.span<{
  $withPNOWeight?: boolean
}>`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
  max-width: ${p => (p.$withPNOWeight ? '50' : '90')}px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
  font-weight: 500;
`

const TableBody = styled.tbody``

const Fields = styled.table<{
  withoutMarginBottom?: boolean
  withoutMarginTop?: boolean
}>`
  padding: 0px 5px ${p => (p.withoutMarginBottom ? '0' : '5px')} 5px;
  width: inherit;
  display: table;
  margin: 0;
  margin-top: ${p => (p.withoutMarginTop ? '0' : '5px')};
  margin-bottom: ${p => (p.withoutMarginBottom ? '0' : '5px')};
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
  color: ${p => p.theme.color.slateGray};
`

const LogbookMessageContent = styled.div<{
  chartHeight: number
  isOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  width: inherit;
  opacity: ${p => (p.isOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  height: ${p => (p.isOpen ? p.chartHeight + 105 + 30 : 0)}px;
  transition: 0.2s all;
`
