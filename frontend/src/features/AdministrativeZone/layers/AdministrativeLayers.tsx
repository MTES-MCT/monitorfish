import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useEffect } from 'react'

import { renderAdministrativeLayers } from '../useCases/renderAdministrativeLayers'

/**
 * Renders administrative layers from showedLayers already stored in localStorage on app startup.
 * Subsequent add/remove operations are pushed directly from AdministrativeZones via renderAdministrativeLayers().
 */
export function AdministrativeLayers() {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    dispatch(renderAdministrativeLayers())
  }, [dispatch])

  return null
}
