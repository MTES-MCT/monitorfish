import styled from 'styled-components'

import { getDateTime } from '../../../../../utils'

type EOFMessageProps = {
  message: {
    endOfFishingDatetimeUtc: string
  }
}
export function EOFMessage({ message }: EOFMessageProps) {
  return (
    <>
      {message ? (
        <>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date de fin de pêche</Key>
                  <Value>
                    {message.endOfFishingDatetimeUtc ? (
                      <>
                        {getDateTime(message.endOfFishingDatetimeUtc, true)} <Gray>(UTC)</Gray>
                      </>
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

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
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
