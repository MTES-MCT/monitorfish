import { useDraggable } from '@dnd-kit/core'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStageColumnRecord } from '../../../domain/entities/beaconMalfunction/constants'

export function Draggable({ children, id, stageId }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    data: {
      stageId
    },
    disabled: stageId === beaconMalfunctionsStageColumnRecord.ARCHIVED.code,
    id
  })

  const style = {
    background: COLORS.background,
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
