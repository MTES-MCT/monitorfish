import React, { useState } from 'react'
import { DndContext, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import styled from 'styled-components'

import { Droppable } from './Droppable'
import { beaconStatusesStages } from './beaconStatuses'
import StageColumn from './StageColumn'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'

const beaconsStatuses = [
  {
    id: 1,
    vesselId: 1,
    internalReferenceNumber: 'FAK000999999',
    vesselStatus: 'AT_SEA',
    stage: 'INITIAL_ENCOUNTER',
    priority: true,
    malfunctionStartDateTime: '2021-12-01T10:10:47.004691Z',
    malfunctionEndDateTime: null,
    vesselStatusLastModificationDateTime: '2021-12-08T10:10:47.004691Z'
  },
  {
    id: 2,
    vesselId: 2,
    internalReferenceNumber: 'U_W0NTFINDME',
    vesselStatus: 'NO_NEWS',
    stage: 'FOUR_HOUR_REPORT',
    priority: false,
    malfunctionStartDateTime: '2021-11-24T10:10:47.004691Z',
    malfunctionEndDateTime: null,
    vesselStatusLastModificationDateTime: '2021-12-01T10:10:47.004691Z'
  },
  {
    id: 3,
    vesselId: 3,
    internalReferenceNumber: 'FR263418260',
    vesselStatus: 'AT_PORT',
    stage: 'INITIAL_ENCOUNTER',
    priority: true,
    malfunctionStartDateTime: '2021-11-17T10:10:47.004691Z',
    malfunctionEndDateTime: null,
    vesselStatusLastModificationDateTime: '2021-11-24T10:10:47.004691Z'
  },
  {
    id: 4,
    vesselId: 4,
    internalReferenceNumber: '',
    vesselStatus: 'AT_SEA',
    stage: 'RELAUNCH_REQUEST',
    priority: true,
    malfunctionStartDateTime: '2021-11-17T10:10:47.004691Z',
    malfunctionEndDateTime: null,
    vesselStatusLastModificationDateTime: '2021-11-24T10:10:47.004691Z'
  }
]

const getByStage = (stage, items) =>
  items.filter((item) => item.stage === stage)

const firstBeaconsStatusesMap = Object.keys(beaconStatusesStages).reduce(
  (previous, stage) => ({
    ...previous,
    [stage]: getByStage(stage, beaconsStatuses)
  }),
  {}
)

console.log(firstBeaconsStatusesMap)

export function BeaconStatusesBoard () {
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
  const [items, setItems] = useState(firstBeaconsStatusesMap)
  const sensors = useSensors(mouseSensor, pointerSensor, touchSensor)

  const findContainer = (id) => {
    if (id in beaconStatusesStages) {
      return id
    }

    return Object.keys(beaconStatusesStages)
      .find((key) => beaconStatusesStages[key]?.code?.includes(id))
  }

  const onDragEnd = event => {
    const { active, over } = event

    const previousContainer = findContainer(active.data.current.stageId)
    const beaconId = active?.id
    const nextContainer = findContainer(over?.id)

    console.log(active, over, previousContainer, nextContainer)

    if (previousContainer === nextContainer) {
      return
    }

    if (nextContainer) {
      const activeIndex = items[previousContainer].map(beaconStatus => beaconStatus.id).indexOf(beaconId)

      if (activeIndex !== -1) {
        const nextBeaconStatus = { ...items[previousContainer].find(beaconStatus => beaconStatus.id === beaconId) }
        nextBeaconStatus.stage = nextContainer

        setItems((items) => ({
          ...items,
          [previousContainer]: items[previousContainer].filter(beaconStatus => beaconStatus.id !== beaconId),
          [nextContainer]: items[nextContainer].concat(nextBeaconStatus)
        }))
      }
    }
  }

  return (
    <Wrapper innerWidth={window.innerWidth}>
      <DndContext
        onDragEnd={onDragEnd}
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
