import { bannerStackAdapter, mainWindowActions } from '../slice'

import type { BannerStackItem, BannerStackItemProps } from '../types'
import type { MainAppThunk } from '@store'

/**
 * Add a banner to the main window.
 *
 * @param props Component props of the `<Banner />` to add.
 * @returns ID of the added banner (used to remove it if needed).
 */
export const addMainWindowBanner =
  (props: BannerStackItemProps): MainAppThunk<number> =>
  (dispatch, getState) => {
    const { bannerStack } = getState().mainWindow
    const nextId = bannerStackAdapter.getSelectors().selectTotal(bannerStack) + 1
    const bannerStackItem: BannerStackItem = { id: nextId, props }

    dispatch(mainWindowActions.addBanner(bannerStackItem))

    return nextId
  }
