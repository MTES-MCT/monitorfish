import { monitorfishMap } from './monitorfishMap'
import { FrontendError } from '../../libs/FrontendError'

export function getMapResolution(): number {
  const resolution = monitorfishMap.getView().getResolution()

  if (!resolution) {
    throw new FrontendError('Map resolution is undefined')
  }

  return resolution
}

export function getMapZoom(): number {
  const zoom = monitorfishMap.getView().getZoom()

  if (!zoom) {
    throw new FrontendError('Map zoom is undefined')
  }

  return zoom
}
