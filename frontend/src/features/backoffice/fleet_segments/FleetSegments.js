import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Table } from 'rsuite'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteCell, INPUT_TYPE, ModifiableCell, TagPickerCell } from '../tableCells'
import getAllFleetSegments from '../../../domain/use_cases/fleetSegment/getAllFleetSegments'
import getAllGearCodes from '../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import getFAOAreas from '../../../domain/use_cases/faoAreas/getFAOAreas'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import * as fleetSegmentUseCase from '../../../domain/use_cases/fleetSegment'
import { NewFleetSegmentModal } from './NewFleetSegmentModal'
import { theme } from '../../../ui/theme'

const { Column, HeaderCell } = Table

const FleetSegments = () => {
  const dispatch = useDispatch()
  const doNotUpdateScrollRef = useRef(false)
  const fleetSegments = useSelector(state => state.fleetSegment.fleetSegments)
  const gears = useSelector(state => state.gear.gears)
  const species = useSelector(state => state.species.species)
  const [faoAreas, setFAOAreas] = useState([])
  const [isNewFleetSegmentModalOpen, setIsNewFleetSegmentModalOpen] = useState(false)

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

  const closeNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(false)
  }, [])

  const createFleetSegment = (newFleetSegmentData) => {
    dispatch(fleetSegmentUseCase.createFleetSegment(newFleetSegmentData))

    closeNewFleetSegmentModal()
  }

  const deleteFleetSegment = (id) => {
    doNotUpdateScrollRef.current = true

    dispatch(fleetSegmentUseCase.deleteFleetSegment(id))
  }

  const handleChangeModifiableKey = (segment, key, value) => {
    if (!segment || !key) {
      return
    }

    const updateJSON = {
      segment: null,
      segmentName: null,
      impactRiskFactor: null,
      gears: null,
      faoAreas: null,
      targetSpecies: null,
      bycatchSpecies: null
    }
    updateJSON[key] = value

    dispatch(fleetSegmentUseCase.updateFleetSegment(segment, updateJSON))
  }

  const openNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(true)
  }, [])

  return (
    <Wrapper>
      <Header>
        <Title>Segments de flotte</Title><br/>
        <AddSegment
          data-cy={'open-create-fleet-segment-modal'}
          onClick={openNewFleetSegmentModal}
        >
          Ajouter un segment
        </AddSegment>
      </Header>
      {
        fleetSegments?.length && gears?.length && species?.length && faoAreas?.length
          ? <Table
            height={document.body.clientHeight < 900 ? document.body.clientHeight - 100 : 830}
            width={document.body.clientWidth < 1800 ? document.body.clientWidth - 200 : 1600}
            data={fleetSegments}
            rowHeight={36}
            rowKey={'segment'}
            affixHorizontalScrollbar
            onDataUpdated={() => { doNotUpdateScrollRef.current = true }}
            shouldUpdateScroll={!doNotUpdateScrollRef.current}
            locale={{
              emptyMessage: 'Aucun résultat',
              loading: 'Chargement...'
            }}
          >
            <Column width={70}>
              <HeaderCell>N. impact</HeaderCell>
              <ModifiableCell
                dataKey={'impactRiskFactor'}
                id={'segment'}
                maxLength={3}
                inputType={INPUT_TYPE.DOUBLE}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
              />
            </Column>

            <Column width={110}>
              <HeaderCell>Segment</HeaderCell>
              <ModifiableCell
                dataKey={'segment'}
                id={'segment'}
                maxLength={null}
                inputType={INPUT_TYPE.STRING}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value?.replace(/[ ]/g, ''))}
              />
            </Column>

            <Column width={200}>
              <HeaderCell>Nom du segment</HeaderCell>
              <ModifiableCell
                dataKey={'segmentName'}
                id={'segment'}
                maxLength={null}
                inputType={INPUT_TYPE.STRING}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Engins</HeaderCell>
              <TagPickerCell
                dataKey={'gears'}
                id={'segment'}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
                data={gears.map(gear => ({ label: gear.code, value: gear.code }))}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Espèces ciblées</HeaderCell>
              <TagPickerCell
                dataKey={'targetSpecies'}
                id={'segment'}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
                data={species.map(gear => ({ label: gear.code, value: gear.code }))}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Prises accessoires</HeaderCell>
              <TagPickerCell
                dataKey={'bycatchSpecies'}
                id={'segment'}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
                data={species.map(species => ({ label: species.code, value: species.code }))}
              />
            </Column>

            <Column width={300}>
              <HeaderCell>FAO</HeaderCell>
              <TagPickerCell
                dataKey={'faoAreas'}
                id={'segment'}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, key, value)}
                data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
              />
            </Column>

            <Column width={30}>
              <HeaderCell/>
              <DeleteCell
                dataKey="segment"
                id="segment"
                onClick={deleteFleetSegment}
              />
            </Column>
          </Table>
          : <Loading>
            <FulfillingBouncingCircleSpinner
              color={theme.color.lightGray}
              className={'update-vessels'}
              size={100}/>
          </Loading>
      }

      {isNewFleetSegmentModalOpen && <NewFleetSegmentModal
        faoAreasList={faoAreas}
        onCancel={closeNewFleetSegmentModal}
        onSubmit={createFleetSegment}
      />}
    </Wrapper>
  )
}

const Header = styled.div`
  display: flex;
  margin-bottom: 10px;
`

const AddSegment = styled.a`
  height: fit-content;
  width: fit-content;
  margin-top: 10px;
  margin-right: 20px;
  margin-left: auto;
  text-decoration: underline;
  color: ${COLORS.gunMetal};
  cursor: pointer;
`

const Loading = styled.div`
  margin-top: 200px;
  margin-left: calc(50vw - 200px);
`

const Wrapper = styled.div`
  margin-left: 40px;
  margin-top: 20px;
  height: calc(100vh - 50px);
  width: calc(100vw - 200px);

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
    color: ${COLORS.white};
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
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`

export default FleetSegments
