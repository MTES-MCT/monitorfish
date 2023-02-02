import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getCoordinates } from '../../../../coordinates'
import { getDateTime } from '../../../../utils'
import { WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { LogbookMessageSpecy,  WeightType } from './LogbookMessageSpecy'
import { buildCatchArray } from '../../../../domain/entities/logbook'
import { useSelector } from 'react-redux'

const Haul = ({ haul, haulNumber, hasManyHauls }) => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [catches, setCatches] = useState([])

  useEffect(() => {
    if (haul?.catches) {
      const catches = buildCatchArray(haul.catches)
      setCatches(catches)
    } else {
      setCatches([])
    }
  }, [haul])

  return <>
    {haul
      ? <>
            {
                hasManyHauls
                  ? <HaulNumber data-cy='logbook-haul-number'>Trait de pêche {haulNumber }</HaulNumber>
                  : null
            }
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Date opération</Key>
                <Value>{haul.farDatetimeUtc
                  ? <>{getDateTime(haul.farDatetimeUtc, true)}{' '}
                    <Gray>(UTC)</Gray></>
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Position opération</Key>
                <Value>
                  <FirstInlineKey>Lat.</FirstInlineKey> {haul.latitude && haul.longitude
                    ? getCoordinates([haul.longitude, haul.latitude], WSG84_PROJECTION, coordinatesFormat)[0]
                    : <NoValue>-</NoValue>}
                  <InlineKey>Lon.</InlineKey> {haul.latitude && haul.longitude
                    ? getCoordinates([haul.longitude, haul.latitude], WSG84_PROJECTION, coordinatesFormat)[1]
                    : <NoValue>-</NoValue>}
                </Value>
              </Field>
            </TableBody>
          </Fields>
          {
            haul.gear
              ? <Gear>
                <SubKey>Engin à bord</SubKey>{' '}
                <SubValue>
                  {
                    haul.gearName
                      ? <>{haul.gearName} ({haul.gear})</>
                      : haul.gear
                  }
                </SubValue><br/>
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
              : null
          }
        </Zone>
        <SpeciesList hasCatches={catches?.length}>
          {
            catches
              .map((speciesCatch, index) => {
                return <LogbookMessageSpecy
                  isLast={catches.length === index + 1}
                  specyCatches={speciesCatch}
                  key={'FAR' + speciesCatch.species}
                  weightType={WeightType.LIVE}
                />
              })
          }
        </SpeciesList>
      </>
      : null}
  </>
}

const HaulNumber = styled.div`
  padding: 5px;
  display: block;
  height: 20px;
  padding-left: 10px;
  margin: 10px -10px 5px -10px;
  background: ${COLORS.lightGray};
`

const FirstInlineKey = styled.div`
  color: ${COLORS.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
  font-size: 13px;
`
const Gray = styled.span`
  color: ${COLORS.gunMetal};
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
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
`

const SpeciesList = styled.ul`
  margin: ${props => props.hasCatches ? 10 : 0}px 0 0 0;
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

const InlineKey = styled.div`
  color: ${COLORS.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
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
`

export default Haul
