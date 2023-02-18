import ky from 'ky'
import { ascend, identity } from 'ramda'

import { monitorfishApi } from '.'
import { ApiError } from '../libs/ApiError'

import type { ControlObjective, UpdateControlObjective } from '../domain/types/controlObjective'

const UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour l'objectif de contrôle"
const DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu supprimer l'objectif de contrôle"
const ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu ajouter l'objectif de contrôle"
const ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE = "Nous n'avons pas pu ajouter une nouvelle année"

export const controlObjectiveApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getControlObjectives: builder.query<ControlObjective[], number>({
      providesTags: () => [{ type: 'ControlObjectives' }],
      query: year => `control_objectives/${year}`
    }),
    getControlObjectiveYears: builder.query<number[], void>({
      providesTags: () => [{ type: 'ControlObjectives' }],
      query: () => 'control_objectives/years',
      transformResponse: (baseQueryReturnValue: number[]) => baseQueryReturnValue.sort(ascend(identity))
    })
  })
})

export const { useGetControlObjectivesQuery, useGetControlObjectiveYearsQuery } = controlObjectiveApi

/**
 * Update a control Objective
 */
export async function updateControlObjectiveFromAPI(id: string, updatedFields: UpdateControlObjective) {
  try {
    return await ky.put(`/bff/v1/control_objectives/${id}`, {
      json: updatedFields
    })
  } catch (err) {
    throw new ApiError(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE, err)
  }
}

/**
 * Delete a control Objective
 */
export async function deleteControlObjectiveFromAPI(id: string): Promise<void> {
  try {
    await ky.delete(`/bff/v1/control_objectives/${id}`)
  } catch (err) {
    throw new ApiError(DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE, err)
  }
}

/**
 * Add a control Objective
 */
export async function addControlObjectiveFromAPI(
  segment: string,
  facade: string,
  year: number
): Promise<ControlObjective[]> {
  const createFields = {
    facade,
    segment,
    year
  }

  try {
    return await ky
      .post('/bff/v1/control_objectives', {
        json: createFields
      })
      .json<ControlObjective[]>()
  } catch (err) {
    throw new ApiError(ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE, err)
  }
}

/**
 * Add a new control Objective year
 */
export async function addControlObjectiveYearFromAPI(): Promise<void> {
  try {
    await ky.post('/bff/v1/control_objectives/years')
  } catch (err) {
    throw new ApiError(ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE, err)
  }
}
