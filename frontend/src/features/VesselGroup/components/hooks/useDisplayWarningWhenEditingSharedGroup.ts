import { mainWindowActions } from '@features/MainWindow/slice'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { sideWindowActions } from '@features/SideWindow/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Sharing } from '@features/VesselGroup/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Level } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'

export function useDisplayWarningWhenEditingSharedGroup(sharing?: Sharing, isMainWindow?: boolean) {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    let id: number
    if (sharing === Sharing.SHARED) {
      const message =
        'Attention, vous êtes en train de modifier un groupe partagé. Toutes vos modifications seront visibles par tous les utilisateurs ayant accès au groupe.'
      if (isMainWindow) {
        id = dispatch(
          addMainWindowBanner({
            children: message,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: false
          })
        )
      } else {
        id = dispatch(
          addSideWindowBanner({
            children: message,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: false
          })
        )
      }
    }

    return () => {
      if (id) {
        if (isMainWindow) {
          dispatch(mainWindowActions.removeBanner(id))
        } else {
          dispatch(sideWindowActions.removeBanner(id))
        }
      }
    }
  }, [dispatch, sharing, isMainWindow])
}
