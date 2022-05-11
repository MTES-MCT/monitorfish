import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Table from 'rsuite/lib/Table'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteCell, ModifiableCell, TagPickerCell } from '../tableCells'
import getAllFleetSegments from '../../../domain/use_cases/fleetSegment/getAllFleetSegments'
import getAllGearCodes from '../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import getFAOAreas from '../../../domain/use_cases/faoAreas/getFAOAreas'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'

const { Column, HeaderCell } = Table

const FleetSegments = () => {
  const dispatch = useDispatch()
  const { fleetSegments } = useSelector(state => state.fleetSegment)
  const { gears } = useSelector(state => state.gear)
  const { species } = useSelector(state => state.species)
  const [faoAreas, setFAOAreas] = useState([])

  useEffect(() => {
    dispatch(getFAOAreas()).then(_faoAreas => setFAOAreas(_faoAreas))
  }, [])

  useEffect(() => {
    if (!fleetSegments?.length) {
      dispatch(getAllFleetSegments())
    }
  }, [fleetSegments])

  useEffect(() => {
    if (!gears?.length) {
      dispatch(getAllGearCodes())
    }
  }, [gears])

  useEffect(() => {
    if (!species?.length) {
      dispatch(getAllSpecies())
    }
  }, [species])

  return (
    <Wrapper>
      <Title>Segments de flotte</Title><br/>
      {
        fleetSegments?.length && gears?.length && species?.length && faoAreas?.length
          ? <Table
            height={830}
            width={1600}
            data={fleetSegments}
            rowHeight={36}
            rowKey={'segment'}
            affixHorizontalScrollbar
            locale={{
              emptyMessage: 'Aucun résultat',
              loading: 'Chargement...'
            }}
          >
            <Column width={70}>
              <HeaderCell>N. impact</HeaderCell>
              <ModifiableCell
                dataKey={'impactRiskFactor'}
                onChange={(id, key, value) => console.log('cell')}
              />
            </Column>

            <Column width={110}>
              <HeaderCell>Segment</HeaderCell>
              <ModifiableCell
                dataKey={'segment'}
                onChange={(id, key, value) => console.log('cell')}
              />
            </Column>

            <Column width={200}>
              <HeaderCell>Nom du segment</HeaderCell>
              <ModifiableCell
                dataKey={'segmentName'}
                onChange={(id, key, value) => console.log('cell')}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Engins</HeaderCell>
              <TagPickerCell
                dataKey={'gears'}
                onChange={(id, key, value) => { console.log(id) }}
                data={gears.map(gear => ({ label: gear.code, value: gear.code }))}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Espèces ciblées</HeaderCell>
              <TagPickerCell
                dataKey={'targetSpecies'}
                onChange={(id, key, value) => { console.log(id) }}
                data={species.map(gear => ({ label: gear.code, value: gear.code }))}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Prises accessoires</HeaderCell>
              <TagPickerCell
                dataKey={'bycatchSpecies'}
                onChange={(id, key, value) => { console.log(id) }}
                data={species.map(species => ({ label: species.code, value: species.code }))}
              />
            </Column>

            <Column width={300}>
              <HeaderCell>FAO</HeaderCell>
              <TagPickerCell
                dataKey={'faoAreas'}
                onChange={(id, key, value) => { console.log(id) }}
                data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
              />
            </Column>

            <Column width={30}>
              <HeaderCell/>
              <DeleteCell
                dataKey="id"
                onClick={(id, key) => {}}
              />
            </Column>
          </Table>
          : <Loading>
            <FulfillingBouncingCircleSpinner
              color={COLORS.grayShadow}
              className={'update-vessels'}
              size={100}/>
            <Text data-cy={'first-loader'}>Chargement...</Text>
          </Loading>
      }
    </Wrapper>
  )
}

const Loading = styled.div`
  margin-top: 200px;
  margin-left: calc(50vw - 200px);
`

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${COLORS.grayShadow};
  bottom: -17px;
  position: relative;
`

const Wrapper = styled.div`
  margin-left: 40px;
  margin-top: 20px;
  height: calc(100vh - 50px);
  
  .rs-picker-input {
    border: none;
    margin-left: 7px;
    margin-top: -3px;
  }
  
  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
  }
  
  .rs-picker-has-value .rs-btn .rs-picker-toggle-value, .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.charcoal};
  }
  
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }
  
  .rs-input:focus{
    background: ${COLORS.charcoal};
    color: ${COLORS.background};
  }
  
  .rs-picker-tag-wrapper {
    width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -10px;
  }
  
  .rs-picker-tag {
    width: 280px;
    background: none;
  }
  
  .rs-picker-toggle-clean {
    visibility: hidden !important;
  }
  
  .rs-picker-toggle-caret {
    visibility: hidden !important;
  }
  
  .rs-picker-toggle-placeholder {
    visibility: hidden !important;
  }
`

const Title = styled.h2`
  font-size: 16px;
  color: #282F3E;
  border-bottom: 2px solid ${COLORS.squareBorder};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`

export default FleetSegments
