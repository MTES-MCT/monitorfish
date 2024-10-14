import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import styled from 'styled-components'

import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { COLORS } from '../../../../../../constants/constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type RTPMessageProps = Readonly<{
  messageValue: Logbook.RtpMessageValue
}>
export function RTPMessage({ messageValue }: RTPMessageProps) {
  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de retour</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.returnDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Port d&apos;arrivée</TableKey>
                  <TableValue>{getCodeWithNameOrDash(messageValue.port, messageValue.portName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Raison du retour</TableKey>
                  <TableValue>
                    {messageValue.reasonOfReturn ? (
                      <>
                        {PriorNotification.PURPOSE_LABEL[messageValue.reasonOfReturn]} ({messageValue.reasonOfReturn})
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
            {messageValue.gearOnboard?.length ? (
              messageValue.gearOnboard.map((gear, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Gear key={index}>
                  <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                  <SubValue>{getCodeWithNameOrDash(gear.gear, gear.gearName)}</SubValue>
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
        </>
      )}
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
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
`
