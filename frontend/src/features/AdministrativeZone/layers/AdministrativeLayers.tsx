import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useEffect } from 'react'

import { renderAdministrativeLayers } from '../useCases/renderAdministrativeLayers'

/**
 * Renders administrative layers from showedLayers already in the state when the map is mounted.
 * On app startup, they are rendered once the user layers are loaded (see `getAllRegulatoryLayers()`).
 * Subsequent add/remove operations are pushed directly from AdministrativeZones via renderAdministrativeLayers().
 */
export function AdministrativeLayers() {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    dispatch(renderAdministrativeLayers())
  }, [dispatch])

  return null
}
