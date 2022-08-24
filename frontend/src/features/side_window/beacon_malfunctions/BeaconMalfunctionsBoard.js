import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { createSelector } from '@reduxjs/toolkit'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'
import getAllBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import updateBeaconMalfunctionFromKanban from '../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import { getTextForSearch } from '../../../utils'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import BeaconMalfunctionDetails from './BeaconMalfunctionDetails'
import Droppable from './Droppable'
import StageColumn from './StageColumn'
import BeaconMalfunctionCard from './BeaconMalfunctionCard'

const getByStage = (stage, beaconMalfunctions) =>
  beaconMalfunctions
    .filter(item => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))

const getBeaconMalfunctionsByStage = beaconsMalfunctions =>
  Object.keys(beaconMalfunctionsStages)
    .filter(stage => beaconMalfunctionsStages[stage].isColumn)
    .reduce(
      (previous, stage) => ({
        ...previous,
        [stage]: getByStage(stage, beaconsMalfunctions),
      }),
      {},
    )

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  state => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions),
)

const baseUrl = window.location.origin

function BeaconMalfunctionsBoard({ baseRef }) {
  const dispatch = useDispatch()
  const { openedBeaconMalfunctionInKanban } = useSelector(state => state.beaconMalfunction)
  const beaconMalfunctions = useSelector(state => getMemoizedBeaconMalfunctionsByStage(state))
  const [filteredBeaconMalfunctions, setFilteredBeaconMalfunctions] = useState({})
  const [isDroppedId, setIsDroppedId] = useState(undefined)
  const [searchedVessel, setSearchedVessel] = useState(undefined)
  const [activeBeaconMalfunction, setActiveBeaconMalfunction] = useState(null)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
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
          [stage]: beaconMalfunctions[stage].filter(
            beaconMalfunction =>
              getTextForSearch(beaconMalfunction.vesselName).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
              getTextForSearch(beaconMalfunction.ircs).includes(getTextForSearch(searchedVessel)),
          ),
        }),
        {},
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
    (beaconMalfunction, status) => {
      const nextBeaconMalfunction = {
        ...beaconMalfunction,
        vesselStatus: status,
        vesselStatusLastModificationDateTime: new Date().toISOString(),
      }

      setIsDroppedId(beaconMalfunction.id)
      dispatch(
        updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
          vesselStatus: nextBeaconMalfunction.vesselStatus,
        }),
      )
    },
    [beaconMalfunctions],
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
            ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId),
          }
          nextBeaconMalfunction.stage = nextStage
          nextBeaconMalfunction.vesselStatusLastModificationDateTime = new Date().toISOString()

          dispatch(
            updateBeaconMalfunctionFromKanban(beaconId, nextBeaconMalfunction, {
              stage: nextBeaconMalfunction.stage,
            }),
          )
        }
      }
      setIsDroppedId(beaconId)
      setActiveBeaconMalfunction(null)
    },
    [beaconMalfunctions],
  )

  const onDragStart = event => {
    const { active } = event
    const beaconId = active?.id
    const previousStage = findStage(active.data.current.stageId)
    const beaconMalfunction = {
      ...beaconMalfunctions[previousStage].find(beaconMalfunction => beaconMalfunction.id === beaconId),
    }
    setActiveBeaconMalfunction(beaconMalfunction)
  }

  return (
    <Wrapper style={wrapperStyle}>
      <SearchVesselInput
        baseUrl={baseUrl}
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
            .map(stageId => (
              <Droppable
                key={stageId}
                disabled={stageId === beaconMalfunctionsStages.END_OF_MALFUNCTION.code}
                id={stageId}
              >
                <StageColumn
                  activeBeaconMalfunction={activeBeaconMalfunction}
                  baseRef={baseRef}
                  baseUrl={baseUrl}
                  beaconMalfunctions={filteredBeaconMalfunctions[stageId] || []}
                  isDroppedId={isDroppedId}
                  stage={beaconMalfunctionsStages[stageId]}
                  updateVesselStatus={updateVesselStatus}
                />
              </Droppable>
            ))}
        </Columns>
        <DragOverlay>
          {activeBeaconMalfunction ? (
            <BeaconMalfunctionCard
              baseRef={baseRef}
              baseUrl={baseUrl}
              beaconMalfunction={activeBeaconMalfunction}
              isDragging
              updateVesselStatus={updateVesselStatus}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      {openedBeaconMalfunctionInKanban ? (
        <BeaconMalfunctionDetails
          baseRef={baseRef}
          beaconMalfunctionWithDetails={openedBeaconMalfunctionInKanban}
          updateVesselStatus={updateVesselStatus}
        />
      ) : null}
    </Wrapper>
  )
}

const SearchVesselInput = styled.input``
const searchVesselInputStyle = {
  backgroundColor: 'white',
  backgroundImage: `url(${baseUrl}/${SearchIconSVG})`,
  border: `1px ${COLORS.lightGray} solid`,
  backgroundPosition: 'bottom 3px right 5px',
  borderRadius: 0,
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`,
  },
  color: COLORS.gunMetal,
  backgroundRepeat: 'no-repeat',
  fontSize: 13,
  backgroundSize: 30,
  margin: '0 0 5px 5px',
  flex: 3,
  height: 40,
  padding: '0 5px 0 10px',
  width: 310,
}

const Wrapper = styled.div``
const wrapperStyle = {
  height: 'calc(100vh - 20px)',
  overflowX: 'scroll',
  overflowY: 'hidden',
  padding: '20px 0 0 10px',
  width: 'calc(100vw - 110px)',
}

const Columns = styled.div``
const columnsStyle = {
  display: 'flex',
}

export default BeaconMalfunctionsBoard
