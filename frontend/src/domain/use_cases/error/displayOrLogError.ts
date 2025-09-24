import { WindowContext } from '@api/constants'
import { addBackOfficeBanner } from '@features/BackOffice/useCases/addBackOfficeBanner'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { DisplayedError } from '@libs/DisplayedError'
import { Level } from '@mtes-mct/monitor-ui'

import { displayedErrorActions, type DisplayedErrorState, INITIAL_STATE } from '../../shared_slices/DisplayedError'

import type { MainAppUseCase } from '@store'

/**
 * Dispatch:
 * - A Banner error if the use-case was triggered by the cron
 * - A displayedError to be shown in the vessel sidebar if the use-case was triggered by the user
 */
export const displayOrLogError =
  (
    error: any,
    retryableUseCase: MainAppUseCase | undefined,
    isFromUserAction: boolean,
    errorBoundaryKey: keyof DisplayedErrorState,
    context: WindowContext = WindowContext.MainWindow
  ) =>
  async dispatch => {
    // eslint-disable-next-line no-console
    console.log(error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)

    /**
     * If the use-case was triggered by the cron, we only log an error with a Banner
     */
    if (!isFromUserAction) {
      const bannerProps = {
        children: errorMessage,
        closingDelay: 3000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      }
      console.error(error) // eslint-disable-line no-console
      if (context === WindowContext.BackOffice) {
        dispatch(addBackOfficeBanner(bannerProps))
      } else if (context === WindowContext.SideWindow) {
        dispatch(addSideWindowBanner(bannerProps))
      } else {
        dispatch(addMainWindowBanner(bannerProps))
      }

      return
    }

    /**
     * Else, the use-case was a user action, we show a fallback error UI to the user.
     * We first check if the `displayedErrorBoundary` is correct (included in the DisplayedErrorState type)
     */
    if (!Object.keys(INITIAL_STATE).includes(errorBoundaryKey)) {
      return
    }

    const displayedError = new DisplayedError(errorBoundaryKey, errorMessage, retryableUseCase)
    dispatch(displayedErrorActions.set({ [errorBoundaryKey]: displayedError }))
  }
