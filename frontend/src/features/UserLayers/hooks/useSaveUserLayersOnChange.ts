import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useMemo, useRef } from 'react'

import { saveUserLayers } from '../useCases/saveUserLayers'
import { getUserLayersFromState } from '../utils'

const SAVE_DEBOUNCE_DELAY_IN_MS = 500

/**
 * Save the user layers on the user profile whenever they change, once they have been loaded.
 */
export function useSaveUserLayersOnChange() {
  const dispatch = useMainAppDispatch()
  const areUserLayersLoaded = useMainAppSelector(state => state.layer.areUserLayersLoaded)
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const selectedRegulatoryLayers = useMainAppSelector(state => state.regulation.selectedRegulatoryLayers)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const lastSavedUserLayersRef = useRef<string | undefined>(undefined)

  const serializedUserLayers = useMemo(
    () => JSON.stringify(getUserLayersFromState(showedLayers, selectedRegulatoryLayers, selectedBaseLayer)),
    [showedLayers, selectedRegulatoryLayers, selectedBaseLayer]
  )

  useEffect(() => {
    if (!areUserLayersLoaded) {
      return undefined
    }

    // The first value is the one just loaded from the user profile
    if (lastSavedUserLayersRef.current === undefined) {
      lastSavedUserLayersRef.current = serializedUserLayers

      return undefined
    }

    if (lastSavedUserLayersRef.current === serializedUserLayers) {
      return undefined
    }

    const timeout = setTimeout(() => {
      lastSavedUserLayersRef.current = serializedUserLayers
      dispatch(saveUserLayers(JSON.parse(serializedUserLayers)))
    }, SAVE_DEBOUNCE_DELAY_IN_MS)

    return () => clearTimeout(timeout)
  }, [areUserLayersLoaded, dispatch, serializedUserLayers])
}
