import { addControlObjectiveFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

/**
 * Add a control Objective
 */
export const addControlObjective =
  (segment: string, facade: string, year: number) =>
  (dispatch): Promise<number | void> =>
    addControlObjectiveFromAPI(segment, facade, year).catch(error => {
      dispatch(setError(error))
    })
