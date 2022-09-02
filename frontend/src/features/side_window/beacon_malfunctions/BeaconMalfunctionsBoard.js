import React, { useCallback, useEffect, useState } from 'react'
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
import styled from 'styled-components'

import Droppable from './Droppable'
import StageColumn from './StageColumn'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import updateBeaconMalfunctionFromKanban from '../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import getAllBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import { COLORS } from '../../../constants/constants'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getTextForSearch } from '../../../utils'
import { setError } from '../../../domain/shared_slices/Global'
import BeaconMalfunctionDetails from './BeaconMalfunctionDetails'
import BeaconMalfunctionCard from './BeaconMalfunctionCard'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'

const getByStage = (stage, beaconMalfunctions) =>
  beaconMalfunctions
    .filter((item) => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))

const getBeaconMalfunctionsByStage = beaconsMalfunctions => Object.keys(beaconMalfunctionsStages)
  .filter(stage => beaconMalfunctionsStages[stage].isColumn)
  .reduce((previous, stage) => ({
    ...previous,
    [stage]: getByStage(stage, beaconsMalfunctions)
  }), {})

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  state => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions))

const baseUrl = window.location.origin

const BeaconMalfunctionsBoard = ({ baseRef }) => {
  const dispatch = useDispatch()
  const {
    openedBeaconMalfunctionInKanban
  } = useSelector(state => state.beaconMalfunction)
  const beaconMalfunctions = useSelector(state => getMemoizedBeaconMalfunctionsByStage(state))
  const [filteredBeaconMalfunctions, setFilteredBeaconMalfunctions] = useState({})
  const [isDroppedId, setIsDroppedId] = useState(undefined)
  const [searchedVessel, setSearchedVessel] = useState(undefined)
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
    dispatch(getAllBeaconMalfunctions())
  }, [])

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
          [stage]: beaconMalfunctions[stage].filter(beaconMalfunction =>
            getTextForSearch(beaconMalfunction.vesselName).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.ircs).includes(getTextForSearch(searchedVessel)))
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

    return Object.keys(beaconMalfunctionsStages)
      .find((key) => beaconMalfunctionsStages[key]?.code?.includes(stageName))
  }

  const updateVesselStatus = useCallback((beaconMalfunction, status) => {
    const nextBeaconMalfunction = {
      ...beaconMalfunction,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    setIsDroppedId(beaconMalfunction.id)
    dispatch(updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
      vesselStatus: nextBeaconMalfunction.vesselStatus
    }))
  }, [beaconMalfunctions])

  const onDragEnd = useCallback(event => {
    const { active, over } = event

    const previousStage = findStage(active.data.current.stageId)
    const beaconId = active?.id
    const nextStage = findStage(over?.id)

    if (previousStage === beaconMalfunctionsStages.END_OF_MALFUNCTION.code &&
      nextStage !== beaconMalfunctionsStages.ARCHIVED.code) {
      dispatch(setError(new Error('Une avarie archivée ne peut revenir en arrière')))
      setActiveBeaconMalfunction(null)
      return
    }

    if (previousStage === nextStage) {
      setActiveBeaconMalfunction(null)
      return
    }

    if (nextStage) {
      const activeIndex = beaconMalfunctions[previousStage].map(beaconMalfunction => beaconMalfunction.id).indexOf(beaconId)

      if (activeIndex !== -1) {
        const nextBeaconMalfunction = { ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId) }
        nextBeaconMalfunction.stage = nextStage
        nextBeaconMalfunction.vesselStatusLastModificationDateTime = new Date().toISOString()

        dispatch(updateBeaconMalfunctionFromKanban(beaconId, nextBeaconMalfunction, {
          stage: nextBeaconMalfunction.stage
        }))
      }
    }
    setIsDroppedId(beaconId)
    setActiveBeaconMalfunction(null)
  }, [beaconMalfunctions])

  const onDragStart = event => {
    const { active } = event
    const beaconId = active?.id
    const previousStage = findStage(active.data.current.stageId)
    const beaconMalfunction = { ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId) }
    setActiveBeaconMalfunction(beaconMalfunction)
  }

  return (
    <Wrapper style={wrapperStyle}>
      <SearchVesselInput
        style={searchVesselInputStyle}
        baseUrl={baseUrl}
        data-cy={'search-vessel-in-beacon-malfunctions'}
        placeholder={'Rechercher un navire en avarie'}
        type="text"
        value={searchedVessel}
        onChange={e => setSearchedVessel(e.target.value)}/>
      <DndContext
        autoScroll={true}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
        collisionDetection={closestCenter}
      >
        <Columns
          data-cy={'side-window-beacon-malfunctions-columns'}
          style={columnsStyle}
        >
          {Object.keys(beaconMalfunctionsStages)
            .filter(stage => beaconMalfunctionsStages[stage].isColumn)
            .map((stageId) => (
              <Droppable
                key={stageId}
                id={stageId}
                disabled={stageId === beaconMalfunctionsStages.END_OF_MALFUNCTION.code}
              >
                <StageColumn
                  baseRef={baseRef}
                  baseUrl={baseUrl}
                  stage={beaconMalfunctionsStages[stageId]}
                  beaconMalfunctions={filteredBeaconMalfunctions[stageId] || []}
                  updateVesselStatus={updateVesselStatus}
                  isDroppedId={isDroppedId}
                  activeBeaconMalfunction={activeBeaconMalfunction}
                />
              </Droppable>
            ))}
        </Columns>
        <DragOverlay>
          {
            activeBeaconMalfunction
              ? <BeaconMalfunctionCard
                baseUrl={baseUrl}
                beaconMalfunction={activeBeaconMalfunction}
                updateVesselStatus={updateVesselStatus}
                baseRef={baseRef}
                isDragging
              />
              : null
          }
        </DragOverlay>
      </DndContext>
      {
        openedBeaconMalfunctionInKanban
          ? <BeaconMalfunctionDetails
            updateVesselStatus={updateVesselStatus}
            beaconMalfunctionWithDetails={openedBeaconMalfunctionInKanban}
            baseRef={baseRef}
          />
          : null
      }
    </Wrapper>
  )
}

const SearchVesselInput = styled.input``
const searchVesselInputStyle = {
  margin: '0 0 5px 5px',
  backgroundColor: 'white',
  border: `1px ${COLORS.lightGray} solid`,
  borderRadius: 0,
  color: COLORS.gunMetal,
  fontSize: 13,
  height: 40,
  width: 310,
  padding: '0 5px 0 10px',
  flex: 3,
  backgroundImage: `url(${baseUrl}/${SearchIconSVG})`,
  backgroundSize: 30,
  backgroundPosition: 'bottom 3px right 5px',
  backgroundRepeat: 'no-repeat',
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`
  }
}

const Wrapper = styled.div`
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active, .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover, .rs-picker-select-menu-item.rs-picker-select-menu-item-focus, .rs-picker-select-menu-item {
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
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret, .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }
  .rs-btn-toggle {
    background: #C8DCE6 0% 0% no-repeat padding-box;
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
const wrapperStyle = {
  overflowX: 'scroll',
  overflowY: 'hidden',
  height: 'calc(100vh - 20px)',
  padding: '20px 0 0 10px',
  width: 'calc(100vw - 110px)'
}

const Columns = styled.div``
const columnsStyle = {
  display: 'flex'
}

export default BeaconMalfunctionsBoard
