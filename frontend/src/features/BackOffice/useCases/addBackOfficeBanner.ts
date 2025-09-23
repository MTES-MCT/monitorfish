import { bannerStackAdapter, backOfficeActions } from '../slice'

import type { BackofficeAppThunk } from '@store'
import type { BannerStackItem, BannerStackItemProps } from 'types'

/**
 * Add a banner to the backoffice.
 *
 * @param props Component props of the `<Banner />` to add.
 * @returns ID of the added banner (used to remove it if needed).
 */
export const addBackOfficeBanner =
  (props: BannerStackItemProps): BackofficeAppThunk<number> =>
  (dispatch, getState) => {
    const { bannerStack } = getState().backOffice
    const nextId = bannerStackAdapter.getSelectors().selectTotal(bannerStack) + 1
    const bannerStackItem: BannerStackItem = { id: nextId, props }

    dispatch(backOfficeActions.addBanner(bannerStackItem))

    return nextId
  }
