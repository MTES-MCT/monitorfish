import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageSpecy, WeightType } from './LogbookMessageSpecy'
import { COLORS } from '../../../../../constants/constants'
import { getDate, getDateTime } from '../../../../../utils'
import { LogbookMessagePNOPurposeType } from '../../../constants'
import { buildCatchArray, getTotalPNOWeight } from '../../../utils'

function PNOMessage(props) {
  const [catches, setCatches] = useState([])
  const [totalPNOWeight, setTotalPNOWeight] = useState(null)

  useEffect(() => {
    if (props.message && props.message.catchOnboard) {
      const catches = buildCatchArray(props.message.catchOnboard)
      setCatches(catches)

      const totalPNOWeight = getTotalPNOWeight({ message: props.message })
      setTotalPNOWeight(totalPNOWeight)
    } else {
      setCatches([])
      setTotalPNOWeight(null)
    }
  }, [props.message])

  return (
    <>
      {props.message ? (
        <>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date prévue d&apos;arrivée</Key>
                  <Value>
                    {props.message.predictedArrivalDatetimeUtc ? (
                      <>
                        {getDateTime(props.message.predictedArrivalDatetimeUtc, true)} <Gray>(UTC)</Gray>
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Date de début de la marée</Key>
                  <Value>
                    {props.message.tripStartDate ? <>{getDate(props.message.tripStartDate)}</> : <NoValue>-</NoValue>}
                  </Value>
                </Field>
                <Field>
                  <Key>Port d&apos;arrivée</Key>
                  <Value>
                    {props.message.port && props.message.portName ? (
                      <>
                        {props.message.portName} ({props.message.port})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Raison du préavis</Key>
                  <Value>
                    {props.message.purpose ? (
                      <>
                        {LogbookMessagePNOPurposeType[props.message.purpose]} ({props.message.purpose})
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
          </Zone>
          <SpeciesList>
            {catches.map((speciesCatch, index) => (
              <LogbookMessageSpecy
                key={`PNO${speciesCatch.species}`}
                isLast={catches.length === index + 1}
                specyCatches={speciesCatch}
                weightType={WeightType.LIVE}
              />
            ))}
          </SpeciesList>
        </>
      ) : null}
    </>
  )
}

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const SpeciesList = styled.ul`
  margin: 10px 0 0 0;
  padding: 0;
  width: -moz-available;
  width: -webkit-fill-available;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  display: table;
  margin: 5px;
  min-width: 40%;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Field = styled.tr`
  margin: 5px 5px 0 0;
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
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
  width: 50px;
  display: inline-block;
`

export default PNOMessage
