import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessageSpecy, WeightType } from './LogbookMessageSpecy'
import { getCoordinates } from '../../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../utils'
import { buildCatchArray } from '../../../utils'

import type { CatchWithProperties } from '../../../types'

export function Haul({ hasManyHauls, haul, haulNumber }) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const [catches, setCatches] = useState<CatchWithProperties[]>([])

  useEffect(() => {
    if (haul?.catches) {
      const nextCatches = buildCatchArray(haul.catches)

      setCatches(nextCatches)
    } else {
      setCatches([])
    }
  }, [haul])

  return (
    <>
      {haul ? (
        <>
          {hasManyHauls ? <HaulNumber data-cy="logbook-haul-number">Trait de pêche {haulNumber}</HaulNumber> : null}
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date opération</Key>
                  <Value>
                    {haul.farDatetimeUtc ? (
                      <>
                        {getDateTime(haul.farDatetimeUtc, true)} <Gray>(UTC)</Gray>
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
                    {haul.latitude && haul.longitude ? (
                      getCoordinates([haul.longitude, haul.latitude], WSG84_PROJECTION, coordinatesFormat)[0]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                    <InlineKey>Lon.</InlineKey>{' '}
                    {haul.latitude && haul.longitude ? (
                      getCoordinates([haul.longitude, haul.latitude], WSG84_PROJECTION, coordinatesFormat)[1]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
            {haul.gear ? (
              <Gear>
                <SubKey>Engin à bord</SubKey>{' '}
                <SubValue>
                  {haul.gearName ? (
                    <>
                      {haul.gearName} ({haul.gear})
                    </>
                  ) : (
                    haul.gear
                  )}
                </SubValue>
                <br />
                <SubFields>
                  <SubField>
                    <SubKey>Maillage</SubKey>
                    <SubValue>{haul.mesh ? <>{haul.mesh} mm</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField>
                  <SubField>
                    <SubKey>Dimensions</SubKey>
                    <SubValue>{haul.size ? <>{haul.size}</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField>
                </SubFields>
              </Gear>
            ) : null}
          </Zone>
          <SpeciesList $hasCatches={!!catches?.length}>
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

const HaulNumber = styled.div`
  padding: 5px;
  display: block;
  height: 20px;
  padding-left: 10px;
  margin: 10px -10px 5px -10px;
  background: ${p => p.theme.color.lightGray};
`

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

const SubFields = styled.div`
  display: flex;
`

const SubField = styled.div`
  flex: 1 1 0;
`

const Gear = styled.div`
  margin: 0 5px 5px 5px;
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
`

const SpeciesList = styled.ul<{
  $hasCatches: boolean
}>`
  margin: ${p => (p.$hasCatches ? 10 : 0)}px 0 0 0;
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
