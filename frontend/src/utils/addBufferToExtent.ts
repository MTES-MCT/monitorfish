import type { Extent } from 'ol/extent'

// TODO Move that into monitor-ui.
export function addBufferToExtent(extent: Extent, bufferRatio: number): Extent {
  const typedExtent = extent as [number, number, number, number]

  const width = typedExtent[2] - typedExtent[0]
  const height = typedExtent[3] - typedExtent[1]
  const bufferWidth = width * bufferRatio
  const bufferHeight = height * bufferRatio

  const bufferedExtent = [
    typedExtent[0] - bufferWidth,
    typedExtent[1] - bufferHeight,
    typedExtent[2] + bufferWidth,
    typedExtent[3] + bufferHeight
  ]

  return bufferedExtent
}
