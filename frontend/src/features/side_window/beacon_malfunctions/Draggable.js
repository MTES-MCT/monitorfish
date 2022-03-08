import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from './beaconMalfunctions'

const Draggable = ({ id, stageId, children, isDroppedId, index, verticalScrollRef, horizontalScrollRef }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      stageId: stageId
    },
    disabled: stageId === beaconMalfunctionsStages.ARCHIVED.code
  })

  const style = {
    transform: transform
      ? `translate3d(
        ${transform.x - (index ? 273 : 0) - (horizontalScrollRef?.current?.scrollLeft)}px,
        ${transform.y + (index ? 146 : 0) - (verticalScrollRef?.current?.scrollTop >= 152 ? verticalScrollRef?.current?.scrollTop : 0)}px, 0)`
      : 'unset',
    boxShadow: isDragging ? `0px 0px 10px -3px ${COLORS.gunMetal}` : 'unset',
    zIndex: isDragging ? 9999999 : 'unset',
    position: isDragging ? 'fixed' : 'static',
    margin: '0 10px 8px 10px',
    background: COLORS.background,
    animation: isDroppedId === id ? 'blink 1s' : 'unset',
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
