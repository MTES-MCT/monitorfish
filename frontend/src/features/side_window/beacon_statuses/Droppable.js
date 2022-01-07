import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { COLORS } from '../../../constants/constants'

const Droppable = ({ id, index, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      index: index
    }
  })
  const style = {
    background: isOver ? COLORS.gunMetal : COLORS.gainsboro,
    margin: '10px 5px',
    height: 'calc(100vh - 50px)',
    transition: '0.5s all'
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}

export default Droppable
