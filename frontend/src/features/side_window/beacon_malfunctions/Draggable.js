import { useDraggable } from '@dnd-kit/core'
import React from 'react'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'

function Draggable({ children, id, stageId }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    data: {
      stageId,
    },
    disabled: stageId === beaconMalfunctionsStages.ARCHIVED.code,
    id,
  })

  const style = {
    background: COLORS.background,
    color: COLORS.gunMetal,
    cursor: 'move',
    margin: '0 10px 8px 10px',
  }

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  )
}

export default Draggable
