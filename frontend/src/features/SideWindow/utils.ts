import { getPseudoRandomString } from '@mtes-mct/monitor-ui'

import type { SideWindow } from './SideWindow.types'

export function getFullPathFromPath(path: SideWindow.Path): SideWindow.FullPath {
  if ('id' in path) {
    // Edit a new entity
    if (path.id === 'new') {
      return {
        ...path,
        id: undefined,
        isNew: true,
        key: getPseudoRandomString()
      }
    }

    // Edit an existing entity
    return {
      ...path,
      id: path.id,
      isNew: false,
      key: undefined
    }
  }

  // Other menu
  return {
    ...path,
    id: undefined,
    isNew: false,
    key: undefined
  }
}
