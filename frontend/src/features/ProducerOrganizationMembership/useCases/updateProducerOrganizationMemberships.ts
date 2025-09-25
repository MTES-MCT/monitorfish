import { producerOrganizationMembershipApi } from '@features/ProducerOrganizationMembership/apis'
import { getNextMembershipsFromFile } from '@features/ProducerOrganizationMembership/useCases/utils/utils'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import type { BackofficeAppThunk } from '@store'

export const updateProducerOrganizationMemberships =
  (file: File): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const nextMemberships = await getNextMembershipsFromFile(file)

      await dispatch(
        producerOrganizationMembershipApi.endpoints.setProducerOrganizationMemberships.initiate(nextMemberships)
      ).unwrap()
    } catch (err) {
      dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.BACKOFFICE_PRODUCER_ORGANIZATION_ERROR))
    }
  }
