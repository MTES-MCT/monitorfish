import { monitorfishApi, monitorfishPublicApi } from '@api/api'
import { getAllRegulatoryLayers } from '@features/Regulation/useCases/getAllRegulatoryLayers'

import { getAllGearCodes } from '../../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../../domain/use_cases/infraction/getInfractions'
import { getAllSpecies } from '../../../domain/use_cases/species/getAllSpecies'

import type { ReferentialName, ReferentialVersions } from '@api/referential'
import type { MainAppAsyncThunk, MainAppThunk } from '@store'

/**
 * Downloads again the referentials whose version changed since the previous check, for a session staying open.
 */
export const refreshChangedReferentials =
  (previousVersions: ReferentialVersions, nextVersions: ReferentialVersions): MainAppThunk =>
  dispatch => {
    const hasChanged = (name: ReferentialName) => previousVersions[name] !== nextVersions[name]

    if (hasChanged('gears')) {
      dispatch(monitorfishApi.util.invalidateTags([{ type: 'Gears' }]))
      dispatch(getAllGearCodes<MainAppAsyncThunk>(true))
    }

    if (hasChanged('infractions')) {
      dispatch(monitorfishPublicApi.util.invalidateTags([{ type: 'Infractions' }]))
      dispatch(getInfractions(true))
    }

    if (hasChanged('ports')) {
      dispatch(monitorfishApi.util.invalidateTags([{ type: 'Ports' }]))
    }

    let speciesLoading: Promise<void> | undefined
    if (hasChanged('species')) {
      dispatch(monitorfishApi.util.invalidateTags([{ type: 'Species' }]))
      speciesLoading = dispatch(getAllSpecies<MainAppAsyncThunk>(true))
    }

    // The regulatory zones are converted with the species names
    if (hasChanged('regulations') || hasChanged('species')) {
      dispatch(getAllRegulatoryLayers(speciesLoading))
    }
  }
