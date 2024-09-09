import styled from 'styled-components'

import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { LogbookMessageActivityType } from '../../../../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { DEPMessageValue } from '../../../../Logbook.types'

type DEPMessageProps = Readonly<{
  message: DEPMessageValue
}>
export function DEPMessage({ message }: DEPMessageProps) {
  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de départ</TableKey>
                  <TableValue>{getDatetimeOrDash(message.departureDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Port de départ</TableKey>
                  <TableValue>{getCodeWithNameOrDash(message.departurePort, message.departurePortName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Activité prévue</TableKey>
                  <TableValue>
                    {message.anticipatedActivity ? (
                      <>
                        {LogbookMessageActivityType[message.anticipatedActivity]} ({message.anticipatedActivity})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
          <Zone>
            {message.gearOnboard?.length ? (
              message.gearOnboard.map((gear, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Gear key={index} $isFirst={index === 0}>
                  <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                  <SubValue>{getCodeWithNameOrDash(gear.gear, gear.gearName)}</SubValue>
                  <HorizontalAlign>
                    <HorizontalItem>
                      <SubKey>Maillage</SubKey>
                      <SubValue>{gear.mesh ? <>{gear.mesh} mm</> : <NoValue>-</NoValue>}</SubValue>
                    </HorizontalItem>
                    <HorizontalItem>
                      <SubKey>Dimensions</SubKey>
                      <SubValue>{gear.dimensions ? <>{gear.dimensions} m</> : <NoValue>-</NoValue>}</SubValue>
                    </HorizontalItem>
                  </HorizontalAlign>
                </Gear>
              ))
            ) : (
              <NoValue>-</NoValue>
            )}
          </Zone>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Captures à bord</TableKey>
                  <TableValue>
                    {message.speciesOnboard?.length ? (
                      message.speciesOnboard.map(speciesCatch => (
                        <span key={speciesCatch.species}>
                          {getCodeWithNameOrDash(speciesCatch.species, speciesCatch.speciesName)}- {speciesCatch.weight}{' '}
                          kg
                          <br />
                        </span>
                      ))
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
        </>
      )}
    </>
  )
}

const HorizontalAlign = styled.div`
  display: flex;
  line-height: 21px;
  line-height: 21px;
`

const HorizontalItem = styled.div`
  flex: 1 1 0;
`

const Gear = styled.div<{
  $isFirst: boolean
}>`
  width: -moz-available;
  width: -webkit-fill-available;
  margin-top: ${p => (p.$isFirst ? 0 : 5)}px;
  line-height: 21px;
`

const SubKey = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  display: inline-block;
`

const SubValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-right: 10px;
  display: inline-block;
`
