import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from './beaconMalfunctions'

const Draggable = ({ id, stageId, children }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id,
    data: {
      stageId: stageId
    },
    disabled: stageId === beaconMalfunctionsStages.ARCHIVED.code
  })

  const style = {
    margin: '0 10px 8px 10px',
    background: COLORS.background,
    color: COLORS.gunMetal,
    cursor: 'move'
  }

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  )
}

export default Draggable
