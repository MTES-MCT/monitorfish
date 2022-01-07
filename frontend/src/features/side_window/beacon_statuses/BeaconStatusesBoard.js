import React, { useEffect, useState } from 'react'
import { DndContext, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import styled from 'styled-components'

import Droppable from './Droppable'
import { beaconStatusesStages } from './beaconStatuses'
import StageColumn from './StageColumn'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { useDispatch, useSelector } from 'react-redux'
import updateBeaconStatus from '../../../domain/use_cases/updateBeaconStatus'
import getAllBeaconStatuses from '../../../domain/use_cases/getAllBeaconStatuses'

const getByStage = (stage, items) =>
  items
    .filter((item) => item.stage === stage)
    .sort((a, b) => a.vesselStatusLastModificationDateTime?.localeCompare(b.vesselStatusLastModificationDateTime))

const getBeaconStatusesByStage = beaconsStatuses => Object.keys(beaconStatusesStages).reduce(
  (previous, stage) => ({
    ...previous,
    [stage]: getByStage(stage, beaconsStatuses)
  }),
  {}
)

const BeaconStatusesBoard = () => {
  const dispatch = useDispatch()
  const { beaconStatuses } = useSelector(state => state.beaconStatus)
  const [items, setItems] = useState(getBeaconStatusesByStage(beaconStatuses))
  const [isDroppedId, setIsDroppedId] = useState(undefined)
  const [doNotUpdateBoard, setDoNotUpdateBoard] = useState(undefined)
  const baseUrl = window.location.origin
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  })
  console.log(doNotUpdateBoard)
  console.log(beaconStatuses, items, 'items')

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
    if (beaconStatuses) {
      setItems(getBeaconStatusesByStage(beaconStatuses))
    }
  }, [beaconStatuses])

  const findStage = stageName => {
    if (stageName in beaconStatusesStages) {
      return stageName
    }

    return Object.keys(beaconStatusesStages)
      .find((key) => beaconStatusesStages[key]?.code?.includes(stageName))
  }

  const updateVesselStatus = (stage, beaconStatus, status) => {
    const nextBeaconStatus = { ...beaconStatus, vesselStatus: status }

    setItems(items => ({
      ...items,
      [stage]: [
        nextBeaconStatus,
        ...items[stage].filter(stageBeaconStatus => stageBeaconStatus.id !== beaconStatus.id)
      ]
    }))

    setIsDroppedId(beaconStatus.id)
    dispatch(updateBeaconStatus(beaconStatus.id, { vesselStatus: nextBeaconStatus.vesselStatus }))
  }

  const onDragEnd = event => {
    setDoNotUpdateBoard(false)
    const { active, over } = event

    const previousStage = findStage(active.data.current.stageId)
    const beaconId = active?.id
    const nextStage = findStage(over?.id)

    if (previousStage === nextStage) {
      return
    }

    if (nextStage) {
      const activeIndex = items[previousStage].map(beaconStatus => beaconStatus.id).indexOf(beaconId)

      if (activeIndex !== -1) {
        const nextBeaconStatus = { ...items[previousStage].find(beaconStatus => beaconStatus.id === beaconId) }
        nextBeaconStatus.stage = nextStage

        setItems(items => ({
          ...items,
          [previousStage]: items[previousStage].filter(beaconStatus => beaconStatus.id !== beaconId),
          [nextStage]: [
            nextBeaconStatus,
            ...items[nextStage]
          ]
        }))

        dispatch(updateBeaconStatus(beaconId, { stage: nextBeaconStatus.stage }))
      }
    }
    setIsDroppedId(beaconId)
  }

  return (
    <Wrapper innerWidth={window.innerWidth}>
      <DndContext
        onDragEnd={onDragEnd}
        onDragStart={() => setDoNotUpdateBoard(true)}
        sensors={sensors}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <Columns>
          {Object.keys(beaconStatusesStages).map((stageId) => (
            <Droppable key={stageId} id={stageId}>
              <StageColumn
                baseUrl={baseUrl}
                stage={beaconStatusesStages[stageId]}
                beaconStatuses={items[stageId]}
                updateVesselStatus={updateVesselStatus}
                isDroppedId={isDroppedId}
              />
            </Droppable>
          ))}
        </Columns>
      </DndContext>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  overflow-x: scroll;
  height: 100vh;
`

const Columns = styled.div`
  display: flex;
`

export default BeaconStatusesBoard
