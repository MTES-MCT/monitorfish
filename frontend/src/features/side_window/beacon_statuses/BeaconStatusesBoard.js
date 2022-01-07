import React, { useState } from 'react'
import { DndContext, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import styled from 'styled-components'

import Droppable from './Droppable'
import { beaconStatusesStages } from './beaconStatuses'
import StageColumn from './StageColumn'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { useSelector } from 'react-redux'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

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
  const { beaconStatuses } = useSelector(state => state.beaconStatus, (a, b) => shallowEqual(a, b) || doNotUpdateBoard)
  const [items, setItems] = useState(getBeaconStatusesByStage(beaconStatuses))
  const [isDroppedId, setIsDroppedId] = useState(undefined)
  const [doNotUpdateBoard, setDoNotUpdateBoard] = useState(undefined)
  const baseUrl = window.location.origin
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

  const findContainer = (id) => {
    if (id in beaconStatusesStages) {
      return id
    }

    return Object.keys(beaconStatusesStages)
      .find((key) => beaconStatusesStages[key]?.code?.includes(id))
  }

  const updateVesselStatus = (stage, beaconStatus, status) => {
    const nextBeaconStatus = { ...beaconStatus, vesselStatus: status, vesselStatusLastModificationDateTime: new Date().toISOString() }

    setItems((items) => ({
      ...items,
      [stage]: [
        nextBeaconStatus,
        ...items[stage].filter(stageBeaconStatus => stageBeaconStatus.id !== beaconStatus.id)
      ]
    }))
    setIsDroppedId(beaconStatus.id)
    // TODO Update the vessel beacon status with a PUT request to the API
  }

  const onDragEnd = event => {
    setDoNotUpdateBoard(false)
    const { active, over } = event

    const previousContainer = findContainer(active.data.current.stageId)
    const beaconId = active?.id
    const nextContainer = findContainer(over?.id)

    if (previousContainer === nextContainer) {
      return
    }

    if (nextContainer) {
      const activeIndex = items[previousContainer].map(beaconStatus => beaconStatus.id).indexOf(beaconId)

      if (activeIndex !== -1) {
        const nextBeaconStatus = { ...items[previousContainer].find(beaconStatus => beaconStatus.id === beaconId) }
        nextBeaconStatus.stage = nextContainer
        nextBeaconStatus.vesselStatusLastModificationDateTime = new Date().toISOString()

        setItems((items) => ({
          ...items,
          [previousContainer]: items[previousContainer].filter(beaconStatus => beaconStatus.id !== beaconId),
          [nextContainer]: [
            nextBeaconStatus,
            ...items[nextContainer]
          ]
        }))

        // TODO Update the vessel beacon status with a PUT request to the API
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
