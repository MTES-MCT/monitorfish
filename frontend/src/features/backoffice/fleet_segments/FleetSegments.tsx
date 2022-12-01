import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import SelectPicker from 'rsuite/SelectPicker'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import getFAOAreas from '../../../domain/use_cases/faoAreas/getFAOAreas'
import { addFleetSegmentYear } from '../../../domain/use_cases/fleetSegment/addFleetSegmentYear'
import { createFleetSegment } from '../../../domain/use_cases/fleetSegment/createFleetSegment'
import { getAllFleetSegmentsForBackoffice } from '../../../domain/use_cases/fleetSegment/getAllFleetSegmentsForBackoffice'
import { getFleetSegmentsYearEntries } from '../../../domain/use_cases/fleetSegment/getFleetSegmentsYearEntries'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { theme } from '../../../ui/theme'
import { dayjs } from '../../../utils/dayjs'
import { FleetSegmentsTable } from './FleetSegmentsTable'
import { NewFleetSegmentModal } from './NewFleetSegmentModal'

import type { FleetSegment } from '../../../domain/types/fleetSegment'

const currentYear = dayjs().year()

function getLabeledYear(_year) {
  return { label: `Année ${_year}`, value: _year }
}

export function FleetSegments() {
  const dispatch = useAppDispatch()
  const [fleetSegments, setFleetSegments] = useState<FleetSegment[]>([])
  const [faoAreas, setFAOAreas] = useState([])
  const [year, setYear] = useState<number | undefined>(currentYear)
  const [yearEntries, setYearEntries] = useState([getLabeledYear(currentYear)])
  const [isNewFleetSegmentModalOpen, setIsNewFleetSegmentModalOpen] = useState(false)

  useEffect(() => {
    dispatch(getFAOAreas() as any).then(_faoAreas => setFAOAreas(_faoAreas))
  }, [dispatch])

  const yearsToAdd = useMemo(
    () =>
      _.range(currentYear - 10, currentYear + 10, 1)
        .filter(_year => !yearEntries.map(entry => entry.value).includes(_year))
        .map(_year => ({ label: _year, value: _year })),
    [yearEntries]
  )

  const fetchFleetSegments = useCallback(
    _year => {
      dispatch(getAllFleetSegmentsForBackoffice(_year) as any).then(nextFleetSegments => {
        setYear(_year || currentYear)
        setFleetSegments(nextFleetSegments)
      })
    },
    [dispatch]
  )

  const addYearEntry = useCallback(
    addedYear => {
      dispatch(addFleetSegmentYear(addedYear) as any).then(years => {
        const yearsWithLabel = years.map(_year => getLabeledYear(_year))
        setYearEntries(yearsWithLabel)

        fetchFleetSegments(addedYear)
      })
    },
    [dispatch, fetchFleetSegments]
  )

  useEffect(() => {
    dispatch(getFleetSegmentsYearEntries() as any).then(years => {
      const yearsWithLabel = years.map(_year => getLabeledYear(_year))
      setYearEntries(yearsWithLabel)
    })

    fetchFleetSegments(currentYear)
  }, [dispatch, fetchFleetSegments])

  const openNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(true)
  }, [])

  const closeNewFleetSegmentModal = useCallback(() => {
    setIsNewFleetSegmentModalOpen(false)
  }, [])

  const triggerCreateFleetSegment = useCallback(
    newFleetSegmentData => {
      dispatch(createFleetSegment(newFleetSegmentData, fleetSegments) as any).then(nextFleetSegments => {
        if (nextFleetSegments) {
          setFleetSegments(nextFleetSegments)
        }
      })

      closeNewFleetSegmentModal()
    },
    [dispatch, fleetSegments, closeNewFleetSegmentModal]
  )

  return (
    <Wrapper>
      <Header>
        <Title>Segments de flotte</Title>
        <YearSelectPicker
          cleanable={false}
          data={yearEntries}
          data-cy="fleet-segments-select-year"
          onChange={_year => fetchFleetSegments(_year as number)}
          searchable={false}
          size="xs"
          value={year}
        />
        <AddYear>Ajouter</AddYear>
        <AddYearSelectPicker
          cleanable={false}
          data={yearsToAdd}
          data-cy="fleet-segments-add-year"
          onChange={_year => addYearEntry(_year as number)}
          placeholder={"l'année"}
          searchable={false}
          size="xs"
          value={year}
        />
      </Header>
      {fleetSegments.length ? (
        <>
          <FleetSegmentsTable
            faoAreas={faoAreas}
            fleetSegments={fleetSegments}
            setFleetSegments={setFleetSegments}
            year={year}
          />
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

const AddYear = styled.span`
  margin-top: 12px;
  margin-right: 10px;
  margin-left: auto;
  color: ${COLORS.gunMetal};
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

const YearSelectPicker = styled(SelectPicker)`
  height: fit-content;
  width: fit-content;
  margin-top: 14px;
  margin-right: 20px;
  margin-left: 5px;

  .rs-picker-toggle {
    width: 80px;
  }
`

const AddYearSelectPicker = styled(SelectPicker)`
  height: fit-content;
  width: fit-content;
  margin-top: 10px;
  margin-right: 20px;

  .rs-picker-toggle-placeholder {
    font-size: 13px;
    color: ${COLORS.gunMetal} !important;
  }

  .rs-picker-toggle {
    width: 50px;
  }
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
