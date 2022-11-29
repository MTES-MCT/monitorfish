import { useCallback, useEffect, useRef, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import { Table } from 'rsuite'
import SelectPicker from 'rsuite/SelectPicker'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import getFAOAreas from '../../../domain/use_cases/faoAreas/getFAOAreas'
import { createFleetSegment } from '../../../domain/use_cases/fleetSegment/createFleetSegment'
import { deleteFleetSegment } from '../../../domain/use_cases/fleetSegment/deleteFleetSegment'
import { getAllFleetSegmentsForBackoffice } from '../../../domain/use_cases/fleetSegment/getAllFleetSegmentsForBackoffice'
import { getFleetSegmentsYearEntries } from '../../../domain/use_cases/fleetSegment/getFleetSegmentsYearEntries'
import { updateFleetSegment } from '../../../domain/use_cases/fleetSegment/updateFleetSegment'
import getAllGearCodes from '../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { useWindowResize } from '../../../hooks/useWindowResize'
import { theme } from '../../../ui/theme'
import { dayjs } from '../../../utils/dayjs'
import { DeleteCell, INPUT_TYPE, ModifiableCell, TagPickerCell } from '../tableCells'
import { NewFleetSegmentModal } from './NewFleetSegmentModal'

import type { FleetSegment } from '../../../domain/types/fleetSegment'

const { Column, HeaderCell } = Table

const currentYear = dayjs().year()

export function FleetSegments() {
  const dispatch = useAppDispatch()
  const [fleetSegments, setFleetSegments] = useState<FleetSegment[]>([])
  const gears = useAppSelector(state => state.gear.gears)
  const species = useAppSelector(state => state.species.species)
  const [year, setYear] = useState<number | undefined>(currentYear)
  const [yearEntries, setYearEntries] = useState([{ label: `Année ${currentYear}`, value: currentYear }])
  const doNotUpdateScrollRef = useRef(false)
  const [faoAreas, setFAOAreas] = useState([])
  const [isNewFleetSegmentModalOpen, setIsNewFleetSegmentModalOpen] = useState(false)
  const [updatedInput, setUpdatedInput] = useState(undefined)
  const doNotUpdateRef = useRef(false)

  const { height, width } = useWindowResize()

  const getFleetSegments = useCallback(
    _year => {
      dispatch(getAllFleetSegmentsForBackoffice(_year) as any).then(nextFleetSegments => {
        setYear(_year || currentYear)
        setFleetSegments(nextFleetSegments)
      })
    },
    [dispatch]
  )

  useEffect(() => {
    dispatch(getFAOAreas() as any).then(_faoAreas => setFAOAreas(_faoAreas))

    dispatch(getFleetSegmentsYearEntries() as any).then(years => {
      const yearsWithLabel = years.map(_year => ({ label: `Année ${_year}`, value: _year }))
      setYearEntries(yearsWithLabel)
    })

    getFleetSegments(currentYear)
  }, [dispatch, getFleetSegments])

  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore
      document.querySelector(`[data-cy="${updatedInput}"]`)?.focus()
      doNotUpdateRef.current = false
    }, 100)
  }, [fleetSegments, updatedInput])

  useEffect(() => {
    if (!gears?.length) {
      dispatch(getAllGearCodes() as any)
    }
  }, [dispatch, gears])

  useEffect(() => {
    if (!species?.length) {
      dispatch(getAllSpecies() as any)
    }
  }, [dispatch, species])

  const closeNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(false)
  }, [])

  const triggerCreateFleetSegment = newFleetSegmentData => {
    dispatch(createFleetSegment(newFleetSegmentData) as any)

    closeNewFleetSegmentModal()
  }

  const triggerDeleteFleetSegment = (segment, _year) => {
    doNotUpdateScrollRef.current = true

    dispatch(deleteFleetSegment(segment, _year) as any)
  }

  const handleChangeModifiableKeyWithThrottle = (segment, _year, key, value) => {
    if (doNotUpdateRef.current) {
      return
    }

    doNotUpdateRef.current = true
    handleChangeModifiableKey(segment, _year, key, value)
  }

  const handleChangeModifiableKey = (segment, _year, key, value) => {
    if (!segment || !key) {
      return
    }

    const updateJSON = {
      bycatchSpecies: null,
      faoAreas: null,
      gears: null,
      impactRiskFactor: null,
      segment: null,
      segmentName: null,
      targetSpecies: null,
      year: null
    }
    updateJSON[key] = value

    dispatch(updateFleetSegment(segment, _year, updateJSON) as any).then(updatedFleetSegment => {
      const nextFleetSegments = fleetSegments
        .filter(_segment => _segment.segment !== segment)
        .concat(updatedFleetSegment)
        .sort((a, b) => a.segment.localeCompare(b.segment))
      setFleetSegments(nextFleetSegments)
    })
  }

  const openNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(true)
  }, [])

  return (
    <Wrapper>
      <Header>
        <Title>Segments de flotte</Title>
        <br />
        <StyledSelectPicker
          cleanable={false}
          data={yearEntries}
          onChange={_year => getFleetSegments(_year as number)}
          searchable={false}
          size="xs"
          value={year}
        />
        <AddYear data-cy="open-create-fleet-segment-modal" onClick={openNewFleetSegmentModal}>
          Ajouter l&apos;année
        </AddYear>
      </Header>
      {fleetSegments?.length && gears?.length && species?.length && faoAreas?.length ? (
        <>
          <Table
            affixHorizontalScrollbar
            data={fleetSegments}
            height={height < 900 ? height - 120 : 830}
            locale={{
              emptyMessage: 'Aucun résultat',
              loading: 'Chargement...'
            }}
            onDataUpdated={() => {
              doNotUpdateScrollRef.current = true
            }}
            rowHeight={36}
            rowKey="segment"
            shouldUpdateScroll={!doNotUpdateScrollRef.current}
            width={width < 1800 ? width - 200 : 1600}
          >
            <Column width={70}>
              <HeaderCell>N. impact</HeaderCell>
              <ModifiableCell
                afterChange={tag => setUpdatedInput(tag)}
                dataKey="impactRiskFactor"
                id="segment"
                inputType={INPUT_TYPE.DOUBLE}
                maxLength={3}
                onChange={(segment, key, value) => handleChangeModifiableKeyWithThrottle(segment, year, key, value)}
              />
            </Column>

            <Column width={110}>
              <HeaderCell>Segment</HeaderCell>
              <ModifiableCell
                afterChange={tag => setUpdatedInput(tag)}
                dataKey="segment"
                id="segment"
                inputType={INPUT_TYPE.STRING}
                maxLength={null}
                onChange={(segment, key, value) =>
                  handleChangeModifiableKeyWithThrottle(segment, year, key, value?.replace(/[ ]/g, ''))
                }
              />
            </Column>

            <Column width={200}>
              <HeaderCell>Nom du segment</HeaderCell>
              <ModifiableCell
                afterChange={undefined}
                dataKey="segmentName"
                id="segment"
                inputType={INPUT_TYPE.STRING}
                maxLength={null}
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Engins</HeaderCell>
              <TagPickerCell
                data={gears.map(gear => ({ label: gear.code, value: gear.code }))}
                dataKey="gears"
                id="segment"
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Espèces ciblées</HeaderCell>
              <TagPickerCell
                data={species.map(gear => ({ label: gear.code, value: gear.code }))}
                dataKey="targetSpecies"
                id="segment"
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
              />
            </Column>

            <Column width={290}>
              <HeaderCell>Prises accessoires</HeaderCell>
              <TagPickerCell
                data={species.map(_species => ({ label: _species.code, value: _species.code }))}
                dataKey="bycatchSpecies"
                id="segment"
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
              />
            </Column>

            <Column width={300}>
              <HeaderCell>FAO</HeaderCell>
              <TagPickerCell
                data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
                dataKey="faoAreas"
                id="segment"
                onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
              />
            </Column>

            <Column width={30}>
              <HeaderCell> </HeaderCell>
              <DeleteCell
                dataKey="year"
                id="segment"
                onClick={(segment, _year) => triggerDeleteFleetSegment(segment, _year)}
              />
            </Column>
          </Table>
          <AddSegment data-cy="open-create-fleet-segment-modal" onClick={openNewFleetSegmentModal}>
            Ajouter un segment
          </AddSegment>
        </>
      ) : (
        <Loading>
          <FulfillingBouncingCircleSpinner className="update-vessels" color={theme.color.lightGray} size={100} />
        </Loading>
      )}
      {isNewFleetSegmentModalOpen && (
        <NewFleetSegmentModal
          faoAreasList={faoAreas}
          onCancel={closeNewFleetSegmentModal}
          onSubmit={triggerCreateFleetSegment}
          year={year}
        />
      )}
    </Wrapper>
  )
}

const Header = styled.div`
  display: flex;
  margin-bottom: 10px;
`

const AddYear = styled.a`
  height: fit-content;
  width: fit-content;
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 40px;
  text-decoration: underline;
  color: ${COLORS.gunMetal};
  cursor: pointer;
`

const AddSegment = styled.a`
  height: fit-content;
  width: fit-content;
  margin-top: 10px;
  text-decoration: underline;
  color: ${COLORS.gunMetal};
  cursor: pointer;
  display: block;
`

const StyledSelectPicker = styled(SelectPicker)`
  height: fit-content;
  width: fit-content;
  margin-top: 10px;
  margin-right: 20px;
  margin-left: auto;
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
`

const Title = styled.h2`
  font-size: 16px;
  color: #282f3e;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`
