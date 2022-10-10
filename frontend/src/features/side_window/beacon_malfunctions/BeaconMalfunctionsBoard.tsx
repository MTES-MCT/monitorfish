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
import { CSSProperties, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'
import getAllBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import updateBeaconMalfunctionFromKanban from '../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { getTextForSearch } from '../../../utils'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'
import { BeaconMalfunctionDetails } from './BeaconMalfunctionDetails'
import { getBeaconMalfunctionsByStage } from './beaconMalfunctions'
import { Droppable } from './Droppable'
import { StageColumn } from './StageColumn'

import type { BeaconMalfunction } from '../../../domain/types/beaconMalfunction'

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  state => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions)
)

const baseUrl = window.location.origin

export function BeaconMalfunctionsBoard() {
  const dispatch = useAppDispatch()
  const { openedBeaconMalfunctionInKanban } = useAppSelector(state => state.beaconMalfunction)
  const beaconMalfunctions = useAppSelector(state => getMemoizedBeaconMalfunctionsByStage(state))
  const [filteredBeaconMalfunctions, setFilteredBeaconMalfunctions] = useState({})
  const [isDroppedId, setIsDroppedId] = useState<number | undefined>(undefined)
  const [searchedVessel, setSearchedVessel] = useState<string>('')
  const [activeBeaconMalfunction, setActiveBeaconMalfunction] = useState(null)
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

    if (!searchedVessel?.length || searchedVessel?.length <= 1) {
      setFilteredBeaconMalfunctions(beaconMalfunctions)

      return
    }

    if (searchedVessel?.length > 1) {
      const nextFilteredItems = Object.keys(beaconMalfunctions).reduce(
        (previous, stage) => ({
          ...previous,
          [stage]: beaconMalfunctions[stage].filter(
            beaconMalfunction =>
              getTextForSearch(beaconMalfunction.vesselName).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.ircs).includes(getTextForSearch(searchedVessel))
          )
        }),
        {}
      )
      setFilteredBeaconMalfunctions(nextFilteredItems)
    }
  }, [beaconMalfunctions, searchedVessel])

  const findStage = stageName => {
    if (stageName in beaconMalfunctionsStages) {
      return stageName
    }

    return Object.keys(beaconMalfunctionsStages).find(key => beaconMalfunctionsStages[key]?.code?.includes(stageName))
  }

  const updateVesselStatus = useCallback(
    (beaconMalfunction: BeaconMalfunction, status) => {
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
      const { active, over } = event

      const previousStage = findStage(active.data.current.stageId)
      const beaconId = active?.id
      const nextStage = findStage(over?.id)

      if (
        previousStage === beaconMalfunctionsStages.END_OF_MALFUNCTION.code &&
        nextStage !== beaconMalfunctionsStages.ARCHIVED.code
      ) {
        dispatch(setError(new Error('Une avarie archivée ne peut revenir en arrière')))
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
      <SearchVesselInput
        data-cy="search-vessel-in-beacon-malfunctions"
        onChange={e => setSearchedVessel(e.target.value)}
        placeholder="Rechercher un navire en avarie"
        style={searchVesselInputStyle}
        type="text"
        value={searchedVessel}
      />
      <DndContext
        autoScroll
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <Columns data-cy="side-window-beacon-malfunctions-columns" style={columnsStyle}>
          {Object.keys(beaconMalfunctionsStages)
            .filter(stage => beaconMalfunctionsStages[stage].isColumn)
            .map((stageId, index) => (
              <Droppable
                key={stageId}
                disabled={stageId === beaconMalfunctionsStages.END_OF_MALFUNCTION.code}
                id={stageId}
                index={index}
              >
                <StageColumn
                  activeBeaconMalfunction={activeBeaconMalfunction}
                  baseUrl={baseUrl}
                  beaconMalfunctions={filteredBeaconMalfunctions[stageId] || []}
                  isDroppedId={!!isDroppedId}
                  stage={beaconMalfunctionsStages[stageId]}
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
  flex: 3,
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
    width: 155px !important;
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
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 27px;
    padding-left: 10px;
    height: 15px;
    padding-top: 5px;
    padding-bottom: 8px;
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

const Columns = styled.div``
const columnsStyle = {
  display: 'flex'
}
