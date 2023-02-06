import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getDateTime } from '../../../../utils'

const EOFMessage = props => {
  return <>
    {props.message
      ? <>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Date de fin de pêche</Key>
                <Value>{props.message.endOfFishingDatetimeUtc
                  ? <>{getDateTime(props.message.endOfFishingDatetimeUtc, true)}{' '}
                    <Gray>(UTC)</Gray></>
                  : <NoValue>-</NoValue>}</Value>
              </Field>

            </TableBody>
          </Fields>
        </Zone>
      </>
      : null}
  </>
}

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
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

export default EOFMessage
