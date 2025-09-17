import {
  pointerWithin,
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { BeaconMalfunctionVesselStatus, STAGE_RECORD, VESSEL_STATUS } from '@features/BeaconMalfunction/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { createSelector } from '@reduxjs/toolkit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'
import { BeaconMalfunctionDetails } from './BeaconMalfunctionDetails'
import { Droppable } from './Droppable'
import { StageColumn } from './StageColumn'
import { getBeaconMalfunctionsByStage, searchInBeaconMalfunctions } from './utils'
import { VesselStatusSelect } from './VesselStatusSelect'
import { setError } from '../../../../domain/shared_slices/Global'
import { LegacyRsuiteComponentsWrapper } from '../../../../ui/LegacyRsuiteComponentsWrapper'
import SearchIconSVG from '../../../icons/Loupe_dark.svg?react'
import { getAllBeaconMalfunctions } from '../../useCases/getAllBeaconMalfunctions'
import { updateBeaconMalfunctionFromKanban } from '../../useCases/updateBeaconMalfunctionFromKanban'

import type {
  BeaconMalfunction,
  BeaconMalfunctionStageColumnValue,
  BeaconMalfunctionStatusValue
} from '@features/BeaconMalfunction/types'
import type { MainRootState } from '@store'
import type { CSSProperties } from 'react'

const getMemoizedBeaconMalfunctionsByStage = createSelector(
  (state: MainRootState) => state.beaconMalfunction.beaconMalfunctions,
  beaconMalfunctions => getBeaconMalfunctionsByStage(beaconMalfunctions)
)

const baseUrl = window.location.origin

export function BeaconMalfunctionBoard() {
  const dispatch = useMainAppDispatch()
  const { openedBeaconMalfunctionInKanban } = useMainAppSelector(state => state.beaconMalfunction)
  const beaconMalfunctions = useMainAppSelector(state => getMemoizedBeaconMalfunctionsByStage(state))
  const [filteredBeaconMalfunctions, setFilteredBeaconMalfunctions] = useState({})
  const [isDroppedId, setIsDroppedId] = useState<number | undefined>(undefined)
  const [searchedVessel, setSearchedVessel] = useState<string>('')
  const [activeBeaconMalfunction, setActiveBeaconMalfunction] = useState(null)
  const [filteredVesselStatus, setFilteredVesselStatus] = useState<BeaconMalfunctionStatusValue | undefined>()
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
    (beaconMalfunction: BeaconMalfunction | undefined, status: string) => {
      if (!beaconMalfunction) {
        return
      }

      const nextBeaconMalfunction = {
        ...beaconMalfunction,
        vesselStatus: status as BeaconMalfunctionVesselStatus,
        vesselStatusLastModificationDateTime: new Date().toISOString()
      }

      setIsDroppedId(beaconMalfunction.id)
      dispatch(
        updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
          stage: undefined,
          vesselStatus: nextBeaconMalfunction.vesselStatus as BeaconMalfunctionVesselStatus | undefined
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
            updateBeaconMalfunctionFromKanban(beaconId, nextBeaconMalfunction, {
              stage: nextBeaconMalfunction.stage,
              vesselStatus: undefined
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
        <VesselStatusSelect
          isCleanable
          updateVesselStatus={(_, status) =>
            setFilteredVesselStatus(VESSEL_STATUS.find(statusObject => statusObject.value === status))
          }
          vesselStatus={filteredVesselStatus}
        />
      </Header>
      <DndContext
        autoScroll
        collisionDetection={pointerWithin}
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
    borderBottom: `1px ${THEME.color.lightGray} solid`
  },
  backgroundColor: 'white',
  backgroundImage: `url(${baseUrl}${SearchIconSVG})`,
  backgroundPosition: 'bottom 3px right 5px',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 30,
  border: `1px ${THEME.color.lightGray} solid`,
  borderRadius: 0,
  color: THEME.color.gunMetal,
  fontSize: 13,
  height: 40,
  margin: '0 0 5px 5px',
  padding: '0 5px 0 10px',
  width: 310
}

const Wrapper = styled(LegacyRsuiteComponentsWrapper)`
  /* * {
    font-size: 13px !important;
  } */

  .rs-picker-select-menu-item.rs-picker-select-menu-item-active,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-focus,
  .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }
  .rs-btn rs-btn-default rs-picker-toggle {
    background: #1675e0 !important;
  }
  .rs-btn-toggle {
    background: #c8dce6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${THEME.color.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
  .rs-toggle {
    margin-right: 5px;
    margin-left: 5px;
  }
`
const wrapperStyle: CSSProperties = {
  height: 'calc(100vh - 20px)',
  overflowX: 'scroll',
  overflowY: 'hidden',
  padding: '20px 0 0 10px',
  width: 'calc(100vw - 90px)'
}

const Header = styled.div`
  display: flex;
  height: 45px;

  .rs-picker-toggle-wrapper {
    height: 40px !important;
    margin-left: 16px;
  }
`

const Columns = styled.div``
const columnsStyle = {
  display: 'flex'
}
