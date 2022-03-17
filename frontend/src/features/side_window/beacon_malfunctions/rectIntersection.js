// Github Issue
// https://github.com/clauderic/dnd-kit/issues/483

function getIntersectionRatio (entry, target) {
  const top = Math.max(target.top, entry.offsetTop)
  const left = Math.max(target.left, entry.offsetLeft)
  const right = Math.min(
    target.left + target.width,
    entry.offsetLeft + entry.width
  )
  const bottom = Math.min(
    target.top + target.height,
    entry.offsetTop + entry.height
  )
  const width = Math.abs(right - left)
  const height = Math.abs(bottom - top)

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height
    const entryArea = entry.width * entry.height
    const intersectionArea = width * height
    const intersectionRatio =
      intersectionArea / (targetArea + entryArea - intersectionArea)

    const ratio = Number(intersectionRatio.toFixed(4))
    return ratio
  }

  return 0
}

export const rectIntersection = args => {
  const { active, droppableContainers } = args
  let maxIntersectionRatio = 0
  let maxIntersectingDroppableContainer = null

  const { translated } = active.rect.current

  if (!translated) return maxIntersectingDroppableContainer
  for (let i = 0; i < droppableContainers.length; i += 1) {
    const droppableContainer = droppableContainers[i]
    const {
      rect: { current: rect },
      node
    } = droppableContainer

    if (rect) {
      const computedRect = translated
      computedRect.top += node.current?.scrollTop || 0
      computedRect.bottom += node.current?.scrollTop || 0
      const intersectionRatio = getIntersectionRatio(rect, computedRect)

      if (intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = intersectionRatio
        maxIntersectingDroppableContainer = droppableContainer.id
      }
    }
  }

  return maxIntersectingDroppableContainer
}
