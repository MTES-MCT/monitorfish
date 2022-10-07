import { useDroppable } from '@dnd-kit/core'

import { COLORS } from '../../../constants/constants'

export function Droppable({ children, disabled, id, index }) {
  const { isOver, setNodeRef } = useDroppable({
    data: {
      index
    },
    disabled,
    id
  })
  const style = {
    background: isOver ? COLORS.lightGray : COLORS.gainsboro,
    height: 'calc(100vh - 100px)',
    margin: '10px 5px',
    transition: '0.5s all'
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}
