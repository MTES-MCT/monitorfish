import { useDraggable } from '@dnd-kit/core'

import { COLORS } from '../../../constants/constants'
import { STAGE_RECORD } from '../../../domain/entities/beaconMalfunction/constants'

export function Draggable({ children, id, stageId }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    data: {
      stageId
    },
    disabled: stageId === STAGE_RECORD.ARCHIVED.code,
    id
  })

  const style = {
    background: COLORS.white,
    color: COLORS.gunMetal,
    cursor: 'move',
    margin: '0 10px 8px 10px'
  }

  return (
    /* eslint-disable react/jsx-props-no-spreading */
    <button ref={setNodeRef} style={style} type="button" {...listeners} {...attributes}>
      {children}
    </button>
  )
}
