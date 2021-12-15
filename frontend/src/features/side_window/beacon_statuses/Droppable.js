import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export function Droppable (props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
    data: {
      index: props.index
    }
  })
  const style = {
    color: isOver ? 'green' : undefined
  }

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  )
}
