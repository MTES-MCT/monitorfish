import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { Button, customDayjs, Select, THEME } from '@mtes-mct/monitor-ui'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { CreateOrEditFleetSegmentModal } from './CreateOrEditFleetSegmentModal'
import { FleetSegmentsTable } from './FleetSegmentsTable'
import getFAOAreas from '../../../../domain/use_cases/faoAreas/getFAOAreas'
import { theme } from '../../../../ui/theme'
import { BackOfficeTitle } from '../../../BackOffice/components/BackOfficeTitle'
import { addFleetSegmentYear } from '../../useCases/addFleetSegmentYear'
import { createFleetSegment } from '../../useCases/createFleetSegment'
import { deleteFleetSegment as deleteFleetSegmentAction } from '../../useCases/deleteFleetSegment'
import { getFleetSegmentsYearEntries } from '../../useCases/getFleetSegmentsYearEntries'
import { updateFleetSegment } from '../../useCases/updateFleetSegment'

import type { FleetSegment, UpdateFleetSegment } from '../../types'

export function FleetSegmentsBackoffice() {
  const currentYear = customDayjs().year()
  const dispatch = useBackofficeAppDispatch()
  const [fleetSegments, setFleetSegments] = useState<FleetSegment[]>([])
  const [faoAreas, setFAOAreas] = useState<string[]>([])
  const [year, setYear] = useState<number>(currentYear)
  const [yearEntries, setYearEntries] = useState([getLabeledYear(currentYear)])
  const [isNewFleetSegmentModalOpen, setIsNewFleetSegmentModalOpen] = useState(false)
  const [editedFleetSegment, setEditedFleetSegment] = useState<FleetSegment | undefined>()

  useEffect(() => {
    dispatch(getFAOAreas()).then(_faoAreas => setFAOAreas(_faoAreas || []))
  }, [dispatch])

  const yearsToAdd = useMemo(
    () =>
      _.range(currentYear - 10, currentYear + 10, 1)
        .filter(_year => !yearEntries.map(entry => entry.value).includes(_year))
        .map(_year => ({ label: String(_year), value: String(_year) })),
    [yearEntries, currentYear]
  )

  const fetchFleetSegments = useCallback(
    async (_year?: number) => {
      const { data: nextFleetSegments } = await dispatch(fleetSegmentApi.endpoints.getFleetSegments.initiate(_year))

      setFleetSegments(nextFleetSegments ?? [])
      if (_year) {
        setYear(_year)
      }
    },
    [dispatch]
  )

  const addYearEntry = useCallback(
    async addedYear => {
      const nextYears = await dispatch(addFleetSegmentYear(addedYear))

      const yearsWithLabel = nextYears.map(_year => getLabeledYear(_year))
      setYearEntries(yearsWithLabel)
      await fetchFleetSegments(addedYear)
    },
    [dispatch, fetchFleetSegments]
  )

  useEffect(() => {
    if (fleetSegments.length) {
      return
    }

    dispatch(getFleetSegmentsYearEntries()).then(years => {
      const yearsWithLabel = years ? years.map(_year => getLabeledYear(_year)) : []
      setYearEntries(yearsWithLabel)
    })

    fetchFleetSegments(currentYear)
  }, [dispatch, fleetSegments.length, fetchFleetSegments, currentYear])

  const openNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(true)
  }, [])

  const openEditFleetSegmentModal = useCallback((fleetSegment: FleetSegment) => {
    setIsNewFleetSegmentModalOpen(true)
    setEditedFleetSegment(fleetSegment)
  }, [])

  const closeCreateOrEditFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(false)
    setEditedFleetSegment(undefined)
  }, [])

  const onCreateFleetSegment = useCallback(
    async newFleetSegmentData => {
      const nextFleetSegments = await dispatch(createFleetSegment(newFleetSegmentData, fleetSegments))

      setFleetSegments(nextFleetSegments ?? [])
      closeCreateOrEditFleetSegmentModal()
    },
    [dispatch, fleetSegments, closeCreateOrEditFleetSegmentModal]
  )

  const onUpdateFleetSegment = useCallback(
    async (segment: string, _year: number, nextFleetSegment: UpdateFleetSegment) => {
      const nextFleetSegments = await dispatch(updateFleetSegment(segment, _year, nextFleetSegment, fleetSegments))
      if (nextFleetSegments) {
        setFleetSegments(nextFleetSegments)
        closeCreateOrEditFleetSegmentModal()
      }
    },
    [dispatch, fleetSegments, closeCreateOrEditFleetSegmentModal]
  )

  const onDeleteFleetSegment = useCallback(
    async segment => {
      const nextFleetSegments = await dispatch(deleteFleetSegmentAction(segment, year))
      if (nextFleetSegments) {
        setFleetSegments(nextFleetSegments)
      }
    },
    [dispatch, year]
  )

  return (
    <Wrapper>
      <Header>
        <TitleBox>
          <BackOfficeTitle>Segments de flotte</BackOfficeTitle>
          <YearSelectPicker
            cleanable={false}
            isLabelHidden
            label="Année"
            name="fleet-segments-select-year"
            onChange={_year => fetchFleetSegments(_year as number)}
            options={yearEntries}
            placeholder="Année"
            popupWidth={100}
            value={year}
          />
        </TitleBox>

        <AddYearBox>
          <AddYear>Ajouter</AddYear>
          <Select
            cleanable={false}
            isLabelHidden
            label="l'année"
            name="fleet-segments-add-year"
            onChange={_year => addYearEntry(Number(_year))}
            options={yearsToAdd}
            placeholder="l'année"
            value={undefined}
          />
        </AddYearBox>
      </Header>

      {fleetSegments.length ? (
        <>
          <FleetSegmentsTable
            faoAreas={faoAreas}
            fleetSegments={fleetSegments}
            onDeleteFleetSegment={onDeleteFleetSegment}
            openEditFleetSegmentModal={openEditFleetSegmentModal}
          />

          <AddSegmentButton onClick={openNewFleetSegmentModal}>Ajouter un segment</AddSegmentButton>
        </>
      ) : (
        <Loading>
          <FulfillingBouncingCircleSpinner className="update-vessels" color={theme.color.lightGray} size={100} />
        </Loading>
      )}

      {isNewFleetSegmentModalOpen && (
        <CreateOrEditFleetSegmentModal
          faoAreasList={faoAreas}
          onCancel={closeCreateOrEditFleetSegmentModal}
          onCreate={onCreateFleetSegment}
          onUpdate={onUpdateFleetSegment}
          updatedFleetSegment={editedFleetSegment}
          year={year}
        />
      )}
    </Wrapper>
  )
}

function getLabeledYear(_year) {
  return { label: `Année ${_year}`, value: _year }
}

const Wrapper = styled.div`
  flex-grow: 1;
  margin: 20px 20px 20px 40px;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  .rs-picker-input {
    border: none;
    margin-left: 7px;
    margin-top: -3px;
  }
`

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`

const AddYear = styled.span`
  color: ${THEME.color.gunMetal};
  margin-right: 10px;
`

const AddSegmentButton = styled(Button)`
  margin-top: 12px;
`

const YearSelectPicker = styled(Select)`
  margin-left: 16px;
`

const Loading = styled.div`
  margin-left: calc(50vw - 200px);
  margin-top: 200px;
`

const TitleBox = styled.div`
  align-items: flex-start;
  display: flex;
`

const AddYearBox = styled.div`
  align-items: center;
  display: flex;
`
