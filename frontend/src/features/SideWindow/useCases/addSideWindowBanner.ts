import { bannerStackAdapter, sideWindowActions } from '../slice'

import type { SideWindow } from '../SideWindow.types'
import type { MainAppThunk } from '@store'

/**
 * Add a banner to the side window.
 *
 * @param props Component props of the `<Banner />` to add.
 * @returns ID of the added banner (used to remove it if needed).
 */
export const addSideWindowBanner =
  (props: SideWindow.BannerStackItemProps): MainAppThunk<number> =>
  (dispatch, getState) => {
    const { bannerStack } = getState().sideWindow
    const nextId = bannerStackAdapter.getSelectors().selectTotal(bannerStack) + 1
    const bannerStackItem: SideWindow.BannerStackItem = { id: nextId, props }

    dispatch(sideWindowActions.addBanner(bannerStackItem))

    return nextId
  }
