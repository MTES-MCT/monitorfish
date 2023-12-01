import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageSpecy, WeightType } from './LogbookMessageSpecy'
import { getCoordinates } from '../../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../utils'
import { buildCatchArray } from '../../../utils'

import type { CatchWithProperties } from '../../../types'

type DISMessageProps = {
  message: {
    catches: {
      species: string
      weight: number
    }[]
    discardDatetimeUtc: string
    latitude: number
    longitude: number
  }
}
export function DISMessage({ message }: DISMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const [catches, setCatches] = useState<CatchWithProperties[]>([])

  useEffect(() => {
    if (message && message.catches) {
      const nextCatches = buildCatchArray(message.catches)

      setCatches(nextCatches)
    } else {
      setCatches([])
    }
  }, [message])

  return (
    <>
      {message ? (
        <>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date opération</Key>
                  <Value>
                    {message.discardDatetimeUtc ? (
                      <>
                        {getDateTime(message.discardDatetimeUtc, true)} <Gray>(UTC)</Gray>
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Position opération</Key>
                  <Value>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {message.latitude && message.longitude ? (
                      getCoordinates([message.longitude, message.latitude], WSG84_PROJECTION, coordinatesFormat)[0]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                    <InlineKey>Lon.</InlineKey>{' '}
                    {message.latitude && message.longitude ? (
                      getCoordinates([message.longitude, message.latitude], WSG84_PROJECTION, coordinatesFormat)[1]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
          <SpeciesList>
            {catches.map((speciesCatch, index) => (
              <LogbookMessageSpecy
                key={`FAR${speciesCatch.species}`}
                isLast={catches.length === index + 1}
                // TODO Fix this type. `speciesCatch` is a `CatchWithProperties` and `specyCatches` expects a `LogbookCatchesBySpecy`.
                specyCatches={speciesCatch as any}
                weightType={WeightType.LIVE}
              />
            ))}
          </SpeciesList>
        </>
      ) : null}
    </>
  )
}

const FirstInlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
  font-size: 13px;
`
const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
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

const InlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
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
`
