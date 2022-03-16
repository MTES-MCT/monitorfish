import React, { useCallback, useEffect, useState } from 'react'
import { DndContext, DragOverlay, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import styled from 'styled-components'

import Droppable from './Droppable'
import { beaconMalfunctionsStages } from './beaconMalfunctions'
import StageColumn from './StageColumn'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import updateBeaconMalfunctionFromKanban from '../../../domain/use_cases/updateBeaconMalfunctionFromKanban'
import getAllBeaconMalfunctions from '../../../domain/use_cases/getAllBeaconMalfunctions'
import { COLORS } from '../../../constants/constants'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getTextForSearch } from '../../../utils'
import { setError } from '../../../domain/shared_slices/Global'
import BeaconMalfunctionDetails from './BeaconMalfunctionDetails'
import BeaconMalfunctionCard from './BeaconMalfunctionCard'

const getByStage = (stage, beaconMalfunctions) =>
  beaconMalfunctions
    .filter((item) => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))

const getBeaconMalfunctionsByStage = beaconsMalfunctions => Object.keys(beaconMalfunctionsStages).reduce(
  (previous, stage) => ({
    ...previous,
    [stage]: getByStage(stage, beaconsMalfunctions)
  }), {})

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  state => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions))

const baseUrl = window.location.origin

const BeaconMalfunctionsBoard = () => {
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
      >
        <Columns
          data-cy={'side-window-beacon-malfunctions-columns'}
          style={columnsStyle}
        >
          {Object.keys(beaconMalfunctionsStages).map((stageId) => (
            <Droppable
              key={stageId}
              id={stageId}
              disabled={stageId === beaconMalfunctionsStages.END_OF_MALFUNCTION.code}
            >
              <StageColumn
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
                isDragging
              />
              : null
          }
        </DragOverlay>
      </DndContext>
      <BeaconMalfunctionDetails
        updateVesselStatus={updateVesselStatus}
        beaconMalfunction={openedBeaconMalfunctionInKanban?.beaconMalfunction}
        resume={openedBeaconMalfunctionInKanban?.resume}
        comments={openedBeaconMalfunctionInKanban?.comments || []}
        actions={openedBeaconMalfunctionInKanban?.actions || []}
      />
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

const Wrapper = styled.div``
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
