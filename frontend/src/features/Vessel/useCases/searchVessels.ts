import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { vesselApi } from '../vesselApi'

import type { Vessel } from '../Vessel.types'
import type { MainAppThunk } from '@store'
import type Fuse from 'fuse.js'

export const searchVessel =
  (
    searchQuery: string,
    isVesselIdRequiredFromResults: boolean,
    fuseVesselIdentitiesFromMap: Fuse<Vessel.VesselIdentity> | undefined,
    displayedErrorKey: DisplayedErrorKey
  ): MainAppThunk<Promise<Vessel.VesselIdentity[]>> =>
  async dispatch => {
    try {
      const foundVesselsFromMap = fuseVesselIdentitiesFromMap?.search(searchQuery).map(result => result.item) ?? []

      const queryParams = {
        searched: searchQuery.toUpperCase()
      }
      const foundVesselsFromApi = await dispatch(vesselApi.endpoints.searchVessels.initiate(queryParams)).unwrap()
      if (!foundVesselsFromApi) {
        return isVesselIdRequiredFromResults
          ? foundVesselsFromMap.filter(foundVesselIdentity => !!foundVesselIdentity.vesselId)
          : foundVesselsFromMap
      }

      const nextFoundVessels = removeDuplicatedFoundVessels(foundVesselsFromApi, foundVesselsFromMap)
      const filteredVessels = isVesselIdRequiredFromResults
        ? nextFoundVessels.filter(_vessel => _vessel.vesselId)
        : nextFoundVessels

      return filteredVessels
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, displayedErrorKey))
      } else {
        handleThunkError(err)
      }

      return []
    }
  }

/**
 * Remove duplicated vessels : keep vessels from APIs when a duplicate is found on either
 * - internalReferenceNumber (CFR) or
 * - vesselId (Vessel internal identifier)
 */
export function removeDuplicatedFoundVessels(
  foundVesselsFromAPI: Vessel.VesselIdentity[],
  foundVesselsOnMap: Vessel.VesselIdentity[]
): Vessel.VesselIdentity[] {
  const filteredVesselsFromMap = foundVesselsOnMap.filter(vesselFromMap => {
    if (!vesselFromMap.internalReferenceNumber) {
      return true
    }

    return !foundVesselsFromAPI.some(
      vesselFromApi =>
        vesselFromApi.internalReferenceNumber === vesselFromMap.internalReferenceNumber ||
        (vesselFromApi.vesselId && vesselFromApi.vesselId === vesselFromMap.vesselId)
    )
  })

  return foundVesselsFromAPI.concat(filteredVesselsFromMap).slice(0, 50)
}
