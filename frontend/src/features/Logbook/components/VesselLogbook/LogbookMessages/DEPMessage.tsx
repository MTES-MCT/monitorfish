import styled from 'styled-components'

import { getDateTime } from '../../../../../utils'
import { LogbookMessageActivityType } from '../../../constants'

// TODO Move that to utils.
function getPortNameFromMessage(message: {
  anticipatedActivity: string
  departureDatetimeUtc: string
  departurePort: string
  departurePortName: string
  gearOnboard: {
    dimensions: number
    gear: string
    gearName: string
    mesh: number
  }[]
  speciesOnboard: {
    species: string
    speciesName: string
    weight: number
  }[]
}): JSX.Element {
  if (message.departurePortName && message.departurePort) {
    return (
      <>
        {message.departurePortName} ({message.departurePort})
      </>
    )
  }
  if (message.departurePort) {
    return <>{message.departurePort}</>
  }

  return <NoValue>-</NoValue>
}

type DEPMessageProps = {
  message: {
    anticipatedActivity: string
    departureDatetimeUtc: string
    departurePort: string
    departurePortName: string
    gearOnboard: {
      dimensions: number
      gear: string
      gearName: string
      mesh: number
    }[]
    speciesOnboard: {
      species: string
      speciesName: string
      weight: number
    }[]
  }
}
export function DEPMessage({ message }: DEPMessageProps) {
  return (
    <>
      {message ? (
        <>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date de départ</Key>
                  <Value>
                    {message.departureDatetimeUtc ? (
                      <>
                        {getDateTime(message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray>
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Port de départ</Key>
                  <Value>{getPortNameFromMessage(message)}</Value>
                </Field>
                <Field>
                  <Key>Activité prévue</Key>
                  <Value>
                    {message.anticipatedActivity ? (
                      <>
                        {LogbookMessageActivityType[message.anticipatedActivity]} ({message.anticipatedActivity})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
          <Zone>
            {message.gearOnboard && message.gearOnboard.length ? (
              message.gearOnboard.map((gear, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Gear key={index}>
                  <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                  <SubValue>
                    {gear.gearName ? (
                      <>
                        {gear.gearName} ({gear.gear})
                      </>
                    ) : (
                      gear.gear
                    )}
                  </SubValue>
                  <br />
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
              ))
            ) : (
              <NoValue>-</NoValue>
            )}
          </Zone>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Captures à bord</Key>
                  <Value>
                    {message.speciesOnboard && message.speciesOnboard.length ? (
                      message.speciesOnboard.map(speciesCatch => (
                        <span key={speciesCatch.species}>
                          {speciesCatch.speciesName ? (
                            <>
                              {speciesCatch.speciesName} ({speciesCatch.species})
                            </>
                          ) : (
                            speciesCatch.species
                          )}
                          - {speciesCatch.weight} kg
                          <br />
                        </span>
                      ))
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
        </>
      ) : null}
    </>
  )
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
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const Fields = styled.table`
  display: table;
  margin: 5px;
  min-width: 40%;
  width: inherit;
`

const Field = styled.tr`
  margin: 5px 5px 0 0;
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
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
  width: 50px;
  display: inline-block;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`
