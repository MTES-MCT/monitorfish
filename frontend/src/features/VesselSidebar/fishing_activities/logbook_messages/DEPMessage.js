import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getDateTime } from '../../../../utils'
import { LogbookMessageActivityType } from '../../../../domain/entities/logbook/logbook'

const DEPMessage = props => {
  const getPortName = message => {
    if (message.departurePortName && message.departurePort) {
      return <>{message.departurePortName} ({message.departurePort})</>
    } else if (message.departurePort) {
      return <>{message.departurePort}</>
    }

    return <NoValue>-</NoValue>
  }

  return <>
    {props.message
      ? <>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Date de départ</Key>
                <Value>{props.message.departureDatetimeUtc
                  ? <>{getDateTime(props.message.departureDatetimeUtc, true)}{' '}
                    <Gray>(UTC)</Gray></>
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Port de départ</Key>
                <Value>{getPortName(props.message)}</Value>
              </Field>
              <Field>
                <Key>Activité prévue</Key>
                <Value>{props.message.anticipatedActivity
                  ? <>{LogbookMessageActivityType[props.message.anticipatedActivity]} ({props.message.anticipatedActivity})</>
                  : <NoValue>-</NoValue>}</Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
        <Zone>
          {props.message.gearOnboard && props.message.gearOnboard.length
            ? props.message.gearOnboard.map((gear, index) => {
              return <Gear key={index}>
                <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                <SubValue>
                  {
                    gear.gearName
                      ? <>{gear.gearName} ({gear.gear})</>
                      : gear.gear
                  }
                </SubValue><br/>
                <SubFields>
                  <SubField>
                    <SubKey>Maillage</SubKey>
                    <SubValue>{gear.mesh ? <>{gear.mesh} mm</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField>
                  <SubField>
                    <SubKey>Dimensions</SubKey>
                    <SubValue>{gear.dimensions ? <>{gear.dimensions} m</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField>
                </SubFields>
              </Gear>
            })
            : <NoValue>-</NoValue>}
        </Zone>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Captures à bord</Key>
                <Value>{props.message.speciesOnboard && props.message.speciesOnboard.length
                  ? props.message.speciesOnboard.map(speciesCatch => {
                    return <span key={speciesCatch.species}>
                                        {
                                          speciesCatch.speciesName
                                            ? <>{speciesCatch.speciesName} ({speciesCatch.species})</>
                                            : speciesCatch.species
                                        }
                      {''} - {speciesCatch.weight} kg<br/>
                                    </span>
                  })
                  : <NoValue>-</NoValue>}</Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
      </>
      : null}
  </>
}

const SubFields = styled.div`
  display: flex;
`

const SubField = styled.div`
  flex: 1 1 0;
`

const Gear = styled.div`
  width: -moz-available;
  width: -webkit-fill-available;
  margin: 5px;
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
  padding: 0px 5px 0 5px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
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

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

export default DEPMessage
