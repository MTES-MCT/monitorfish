import { COLORS } from '@constants/constants'
import { useDraggable } from '@dnd-kit/core'

import { STAGE_RECORD } from '../../constants'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { role, ...attributesWithoutRole } = attributes

  return (
    /* eslint-disable react/jsx-props-no-spreading */
    <div ref={setNodeRef} style={style} {...listeners} {...attributesWithoutRole}>
      {children}
    </div>
  )
}
