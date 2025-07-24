import { sideWindowActions } from '@features/SideWindow/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Sharing } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Level } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'

export function useDisplayWarningWhenEditingSharedGroup(sharing?: Sharing) {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    let id: number
    if (sharing === Sharing.SHARED) {
      id = dispatch(
        addSideWindowBanner({
          children:
            'Attention, vous êtes en train de modifier un groupe partagé. Toutes vos modifications seront visibles par tous les utilisateurs ayant accès au groupe.',
          isClosable: true,
          isFixed: true,
          level: Level.WARNING,
          withAutomaticClosing: false
        })
      )
    }

    return () => {
      if (id) {
        dispatch(sideWindowActions.removeBanner(id))
      }
    }
  }, [dispatch, sharing])
}
