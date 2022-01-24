import React, { useCallback, useEffect, useState } from 'react'
import { DndContext, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import styled from 'styled-components'

import Droppable from './Droppable'
import { beaconStatusesStages } from './beaconStatuses'
import StageColumn from './StageColumn'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import updateBeaconStatus from '../../../domain/use_cases/updateBeaconStatus'
import getAllBeaconStatuses from '../../../domain/use_cases/getAllBeaconStatuses'
import { COLORS } from '../../../constants/constants'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getTextForSearch } from '../../../utils'
import { closeBeaconStatus } from '../../../domain/shared_slices/BeaconStatus'
import { setError } from '../../../domain/shared_slices/Global'
import BeaconStatusDetails from './BeaconStatusDetails'

const getByStage = (stage, beaconStatuses) =>
  beaconStatuses
    .filter((item) => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))

const getBeaconStatusesByStage = beaconsStatuses => Object.keys(beaconStatusesStages).reduce(
  (previous, stage) => ({
    ...previous,
    [stage]: getByStage(stage, beaconsStatuses)
  }), {})

const getMemoizedBeaconStatusesByStage = createSelector(
  state => state.beaconStatus.beaconStatuses,
  beaconStatuses => getBeaconStatusesByStage(beaconStatuses))

const baseUrl = window.location.origin

const BeaconStatusesBoard = ({ setIsOverlayed, isOverlayed }) => {
  const dispatch = useDispatch()
  const {
    openedBeaconStatus
  } = useSelector(state => state.beaconStatus)
  const beaconStatuses = useSelector(state => getMemoizedBeaconStatusesByStage(state))
  const [allDroppableDisabled, setAllDroppableDisabled] = useState(false)
  const [filteredBeaconStatuses, setFilteredBeaconStatuses] = useState({})
  const [isDroppedId, setIsDroppedId] = useState(undefined)
  const [searchedVessel, setSearchedVessel] = useState(undefined)
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
    dispatch(getAllBeaconStatuses())
  }, [])

  useEffect(() => {
    if (setIsOverlayed) {
      setIsOverlayed(!!openedBeaconStatus)
    }
  }, [openedBeaconStatus])

  useEffect(() => {
    if (!isOverlayed && openedBeaconStatus) {
      dispatch(closeBeaconStatus())
    }
  }, [isOverlayed])

  useEffect(() => {
    const timeoutHandle = setTimeout(() => {
      setIsDroppedId(undefined)
    }, 1000)

    return () => {
      clearTimeout(timeoutHandle)
    }
  }, [isDroppedId])

  useEffect(() => {
    if (!beaconStatuses) {
      return
    }

    if (!searchedVessel?.length || searchedVessel?.length <= 1) {
      setFilteredBeaconStatuses(beaconStatuses)
      return
    }

    if (searchedVessel?.length > 1) {
      const nextFilteredItems = Object.keys(beaconStatuses).reduce(
        (previous, stage) => ({
          ...previous,
          [stage]: beaconStatuses[stage].filter(beaconStatus =>
            getTextForSearch(beaconStatus.vesselName).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconStatus.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconStatus.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconStatus.ircs).includes(getTextForSearch(searchedVessel)))
        }),
        {}
      )
      setFilteredBeaconStatuses(nextFilteredItems)
    }
  }, [beaconStatuses, searchedVessel])

  const findStage = stageName => {
    if (stageName in beaconStatusesStages) {
      return stageName
    }

    return Object.keys(beaconStatusesStages)
      .find((key) => beaconStatusesStages[key]?.code?.includes(stageName))
  }

  const updateVesselStatus = useCallback((stage, beaconStatus, status) => {
    const nextBeaconStatus = {
      ...beaconStatus,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    setIsDroppedId(beaconStatus.id)
    dispatch(updateBeaconStatus(beaconStatus.id, nextBeaconStatus, {
      vesselStatus: nextBeaconStatus.vesselStatus
    }))
  }, [beaconStatuses])

  const onDragEnd = useCallback(event => {
    const { active, over } = event

    const previousStage = findStage(active.data.current.stageId)
    const beaconId = active?.id
    const nextStage = findStage(over?.id)

    if (previousStage === beaconStatusesStages.RESUMED_TRANSMISSION.code) {
      dispatch(setError(new Error('Une avarie en REPRISE DES ÉMISSIONS ne peut revenir en arrière')))
      return
    }

    if (previousStage === nextStage) {
      return
    }

    if (nextStage) {
      const activeIndex = beaconStatuses[previousStage].map(beaconStatus => beaconStatus.id).indexOf(beaconId)

      if (activeIndex !== -1) {
        const nextBeaconStatus = { ...beaconStatuses[previousStage].find(beaconStatus => beaconStatus.id === beaconId) }
        nextBeaconStatus.stage = nextStage
        nextBeaconStatus.vesselStatusLastModificationDateTime = new Date().toISOString()

        dispatch(updateBeaconStatus(beaconId, nextBeaconStatus, {
          stage: nextBeaconStatus.stage
        }))
      }
    }
    setIsDroppedId(beaconId)
  }, [beaconStatuses])

  const onDragStart = useCallback(event => {
    const { active } = event

    const previousStage = findStage(active.data.current.stageId)
    setAllDroppableDisabled(previousStage === beaconStatusesStages.RESUMED_TRANSMISSION.code)
  }, [])

  return (
    <Wrapper innerWidth={window.innerWidth} style={wrapperStyle}>
      <SearchVesselInput
        style={searchVesselInputStyle}
        baseUrl={baseUrl}
        data-cy={'search-vessel-in-beacon-statuses'}
        placeholder={'Rechercher un navire en avarie'}
        type="text"
        value={searchedVessel}
        onChange={e => setSearchedVessel(e.target.value)}/>
      <DndContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <Columns
          data-cy={'side-window-beacon-statuses-columns'}
          style={columnsStyle}
        >
          {Object.keys(beaconStatusesStages).map((stageId) => (
            <Droppable key={stageId} id={stageId} disabled={allDroppableDisabled}>
              <StageColumn
                baseUrl={baseUrl}
                stage={beaconStatusesStages[stageId]}
                beaconStatuses={filteredBeaconStatuses[stageId] || []}
                updateVesselStatus={updateVesselStatus}
                isDroppedId={isDroppedId}
              />
            </Droppable>
          ))}
        </Columns>
      </DndContext>
      <BeaconStatusDetails
        updateStageVesselStatus={updateVesselStatus}
        beaconStatus={openedBeaconStatus?.beaconStatus}
        comments={openedBeaconStatus?.comments || []}
        actions={openedBeaconStatus?.actions || []}
      />
    </Wrapper>
  )
}

const SearchVesselInput = styled.input``

const Wrapper = styled.div``
const wrapperStyle = {
  overflowX: 'scroll',
  height: 'calc(100vh - 20px)',
  padding: '20px 0 0 10px'
}

const Columns = styled.div``
const columnsStyle = {
  display: 'flex'
}

const searchVesselInputStyle = {
  margin: '0 0 5px 5px',
  backgroundColor: 'white',
  border: 'none',
  borderBottom: `1px ${COLORS.lightGray} solid`,
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

export default BeaconStatusesBoard
