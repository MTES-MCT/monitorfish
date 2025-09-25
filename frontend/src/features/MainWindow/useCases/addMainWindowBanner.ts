import { bannerStackAdapter, mainWindowBannerActions } from '../slice'

import type { HybridAppThunk } from '@store/types'
import type { BannerStackItem, BannerStackItemProps } from 'types'

/**
 * Add a banner to the main window.
 *
 * @param props Component props of the `<Banner />` to add.
 * @returns ID of the added banner (used to remove it if needed).
 */
export const addMainWindowBanner =
  (props: BannerStackItemProps): HybridAppThunk<number> =>
  (dispatch, getState) => {
    const { bannerStack } = getState().mainWindowBanner
    const nextId = bannerStackAdapter.getSelectors().selectTotal(bannerStack) + 1
    const bannerStackItem: BannerStackItem = { id: nextId, props }

    dispatch(mainWindowBannerActions.addBanner(bannerStackItem))

    return nextId
  }
