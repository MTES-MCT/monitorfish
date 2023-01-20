import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { createSelector } from '@reduxjs/toolkit'
import { CSSProperties, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { STAGE_RECORD, VESSEL_STATUS } from '../../../domain/entities/beaconMalfunction/constants'
import { setError } from '../../../domain/shared_slices/Global'
import getAllBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import updateBeaconMalfunctionFromKanban from '../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'
import { BeaconMalfunctionDetails } from './BeaconMalfunctionDetails'
import { getBeaconMalfunctionsByStage, searchInBeaconMalfunctions } from './beaconMalfunctions'
import { Droppable } from './Droppable'
import { StageColumn } from './StageColumn'
import { VesselStatusSelect } from './VesselStatusSelect'

import type {
  BeaconMalfunction,
  BeaconMalfunctionStageColumnValue,
  BeaconMalfunctionStatusValue
} from '../../../domain/entities/beaconMalfunction/types'

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  state => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions)
)

const baseUrl = window.location.origin

export function BeaconMalfunctionsBoard() {
  const dispatch = useMainAppDispatch()
  const { openedBeaconMalfunctionInKanban } = useMainAppSelector(state => state.beaconMalfunction)
  const beaconMalfunctions = useMainAppSelector(state => getMemoizedBeaconMalfunctionsByStage(state))
  const [filteredBeaconMalfunctions, setFilteredBeaconMalfunctions] = useState({})
  const [isDroppedId, setIsDroppedId] = useState<number | undefined>(undefined)
  const [searchedVessel, setSearchedVessel] = useState<string>('')
  const [activeBeaconMalfunction, setActiveBeaconMalfunction] = useState(null)
  const [filteredVesselStatus, setFilteredVesselStatus] = useState<BeaconMalfunctionStatusValue | undefined>()
  const vesselStatusSelectRef = useRef() as MutableRefObject<HTMLDivElement>
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  })

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10
    }
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5
    }
  })
  const sensors = useSensors(mouseSensor, pointerSensor, touchSensor)

  useEffect(() => {
    // @ts-ignore
    dispatch(getAllBeaconMalfunctions())
  }, [dispatch])

  useEffect(() => {
    const timeoutHandle = setTimeout(() => {
      setIsDroppedId(undefined)
    }, 1000)

    return () => {
      clearTimeout(timeoutHandle)
    }
  }, [isDroppedId])

  useEffect(() => {
    if (!beaconMalfunctions) {
      return
    }

    if ((!searchedVessel?.length || searchedVessel?.length <= 1) && !filteredVesselStatus) {
      setFilteredBeaconMalfunctions(beaconMalfunctions)

      return
    }

    const nextFilteredBeaconMalfunctions = searchInBeaconMalfunctions(
      beaconMalfunctions,
      searchedVessel,
      filteredVesselStatus
    )

    setFilteredBeaconMalfunctions(nextFilteredBeaconMalfunctions)
  }, [beaconMalfunctions, searchedVessel, filteredVesselStatus])

  const findStage = stageName => {
    if (stageName in STAGE_RECORD) {
      return stageName
    }

    return Object.keys(STAGE_RECORD).find(key => STAGE_RECORD[key]?.code?.includes(stageName))
  }

  const stages: BeaconMalfunctionStageColumnValue[] = useMemo(
    () =>
      Object.keys(STAGE_RECORD)
        .filter(stage => STAGE_RECORD[stage].isColumn)
        .map(stageId => STAGE_RECORD[stageId]),
    []
  )

  const updateVesselStatus = useCallback(
    (beaconMalfunction: BeaconMalfunction | undefined, status: string | null) => {
      if (!beaconMalfunction) {
        return
      }

      const nextBeaconMalfunction = {
        ...beaconMalfunction,
        vesselStatus: status,
        vesselStatusLastModificationDateTime: new Date().toISOString()
      }

      setIsDroppedId(beaconMalfunction.id)
      dispatch(
        // @ts-ignore
        updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
          vesselStatus: nextBeaconMalfunction.vesselStatus
        })
      )
    },
    [dispatch]
  )

  const onDragEnd = useCallback(
    event => {
      if (!beaconMalfunctions) {
        return
      }

      const { active, over } = event

      const previousStage = findStage(active.data.current.stageId)
      const beaconId = active?.id
      const nextStage = findStage(over?.id)

      if (previousStage === STAGE_RECORD.END_OF_MALFUNCTION.code && nextStage !== STAGE_RECORD.ARCHIVED.code) {
        dispatch(setError(new Error('Une avarie archivée ne peut revenir en arrière')))
        setActiveBeaconMalfunction(null)

        return
      }

      if (previousStage !== STAGE_RECORD.END_OF_MALFUNCTION.code && nextStage === STAGE_RECORD.ARCHIVED.code) {
        dispatch(setError(new Error('Seulement une avarie terminée peut être archivée')))
        setActiveBeaconMalfunction(null)

        return
      }

      if (previousStage === nextStage) {
        setActiveBeaconMalfunction(null)

        return
      }

      if (nextStage) {
        const activeIndex = beaconMalfunctions[previousStage]
          .map(beaconMalfunction => beaconMalfunction.id)
          .indexOf(beaconId)

        if (activeIndex !== -1) {
          const nextBeaconMalfunction = {
            ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId)
          }
          nextBeaconMalfunction.stage = nextStage
          nextBeaconMalfunction.vesselStatusLastModificationDateTime = new Date().toISOString()

          dispatch(
            // @ts-ignore
            updateBeaconMalfunctionFromKanban(beaconId, nextBeaconMalfunction, {
              stage: nextBeaconMalfunction.stage
            })
          )
        }
      }
      setIsDroppedId(beaconId)
      setActiveBeaconMalfunction(null)
    },
    [dispatch, beaconMalfunctions]
  )

  const onDragStart = event => {
    if (!beaconMalfunctions) {
      return
    }

    const { active } = event
    const beaconId = active?.id
    const previousStage = findStage(active.data.current.stageId)
    const nextActiveBeaconMalfunction = {
      ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId)
    }
    setActiveBeaconMalfunction(nextActiveBeaconMalfunction)
  }

  return (
    <Wrapper style={wrapperStyle}>
      <Header>
        <SearchVesselInput
          data-cy="search-vessel-in-beacon-malfunctions"
          onChange={e => setSearchedVessel(e.target.value)}
          placeholder="Rechercher un navire en avarie"
          style={searchVesselInputStyle}
          type="text"
          value={searchedVessel}
        />
        <VesselStatusSelectWrapper ref={vesselStatusSelectRef}>
          <VesselStatusSelect
            beaconMalfunction={undefined}
            domRef={vesselStatusSelectRef}
            isAbsolute={false}
            isCleanable
            marginTop={-35}
            updateVesselStatus={(_, status) =>
              setFilteredVesselStatus(VESSEL_STATUS.find(statusObject => statusObject.value === status))
            }
            vesselStatus={filteredVesselStatus}
          />
        </VesselStatusSelectWrapper>
      </Header>
      <DndContext
        autoScroll
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <Columns data-cy="side-window-beacon-malfunctions-columns" style={columnsStyle}>
          {stages.map(stage => (
            <Droppable
              key={stage.code}
              disabled={stage.code === STAGE_RECORD.END_OF_MALFUNCTION.code}
              id={stage.code}
              index={stage.index}
            >
              <StageColumn
                activeBeaconMalfunction={activeBeaconMalfunction}
                baseUrl={baseUrl}
                beaconMalfunctions={filteredBeaconMalfunctions[stage.code] || []}
                isDroppedId={!!isDroppedId}
                stage={stage}
                updateVesselStatus={updateVesselStatus}
              />
            </Droppable>
          ))}
        </Columns>
        <DragOverlay
          dropAnimation={{
            duration: 0,
            easing: ''
          }}
        >
          {activeBeaconMalfunction ? (
            <BeaconMalfunctionCard
              activeBeaconId={undefined}
              baseUrl={baseUrl}
              beaconMalfunction={activeBeaconMalfunction}
              isDragging
              isDroppedId={undefined}
              isShowed={false}
              updateVesselStatus={updateVesselStatus}
              verticalScrollRef={undefined}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      {openedBeaconMalfunctionInKanban ? (
        <BeaconMalfunctionDetails
          beaconMalfunctionWithDetails={openedBeaconMalfunctionInKanban}
          updateVesselStatus={updateVesselStatus}
        />
      ) : null}
    </Wrapper>
  )
}

const SearchVesselInput = styled.input``
const searchVesselInputStyle = {
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`
  },
  backgroundColor: 'white',
  backgroundImage: `url(${baseUrl}/${SearchIconSVG})`,
  backgroundPosition: 'bottom 3px right 5px',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 30,
  border: `1px ${COLORS.lightGray} solid`,
  borderRadius: 0,
  color: COLORS.gunMetal,
  fontSize: 13,
  height: 40,
  margin: '0 0 5px 5px',
  padding: '0 5px 0 10px',
  width: 310
}

const Wrapper = styled.div`
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-focus,
  .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }
  .rs-picker-select-menu-items {
    overflow-y: unset;
  }
  .rs-picker-select {
    width: 185px !important;
    margin: 8px 10px 0 10px !important;
    height: 30px;
  }
  .rs-list-item {
    box-shadow: unset;
  }
  .rs-btn rs-btn-default rs-picker-toggle {
    background: #1675e0 !important;
  }
  .rs-picker-toggle-wrapper {
    display: block;
  }
  .rs-picker-toggle-placeholder {
    font-size: 13px;
  }
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 27px;
    padding-left: 10px;
    height: 15px;
    padding-top: 5px;
    padding-bottom: 8px;
    width: 152px;
  }
  .rs-picker-toggle.rs-btn {
    padding-left: 5px !important;
  }
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret,
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }
  .rs-btn-toggle {
    background: #c8dce6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${COLORS.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
  .rs-toggle {
    margin-right: 5px;
    margin-left: 5px;
  }
  .rs-toggle > input {
    width: unset;
  }
`
const wrapperStyle: CSSProperties = {
  height: 'calc(100vh - 20px)',
  overflowX: 'scroll',
  overflowY: 'hidden',
  padding: '20px 0 0 10px',
  width: 'calc(100vw - 110px)'
}

const VesselStatusSelectWrapper = styled.div``

const Header = styled.div`
  display: flex;
  height: 45px;
`

const Columns = styled.div``
const columnsStyle = {
  display: 'flex'
}
