import { ScipSpeciesType } from '@features/FleetSegment/types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { act, render } from '@testing-library/react'
import { Formik, useFormikContext } from 'formik'

import { SpeciesField } from '../SpeciesField'

import type { MissionActionFormValues } from '../../../types'

const SPECIES = { species: [{ code: 'COD', name: 'MORUE', scipSpeciesType: ScipSpeciesType.DEMERSAL }] }

let mockVesselQueryResult: { data: { vesselLength: number } | undefined; isLoading: boolean }
let mockSpeciesQueryResult: { data: typeof SPECIES | undefined }
jest.mock('@features/Vessel/vesselApi', () => ({
  useGetVesselQuery: () => mockVesselQueryResult
}))
jest.mock('@api/specy', () => ({
  useGetSpeciesQuery: () => mockSpeciesQueryResult
}))
jest.mock('@api/faoAreas', () => ({
  useGetFaoAreasQuery: () => ({ data: [] })
}))
jest.mock('../../../hooks/useGetMissionActionFormikUsecases', () => ({
  useGetMissionActionFormikUsecases: () => ({ updateSegments: () => {} })
}))
jest.mock('../../../hooks/useIsEISREnabled', () => ({
  useIsEISREnabled: () => true
}))

const CHECK_FIELDS = [
  'separateStowageOfPreservedSpecies',
  'underSizedSeparateRecording',
  'underSizedSeparateStowage'
] as const

type CheckValues = Pick<MissionActionFormValues, (typeof CHECK_FIELDS)[number]>

// Every snapshot matters, not only the last one: the action form autosaves each intermediate value
let valuesHistory: CheckValues[]

function ValuesRecorder() {
  const { values } = useFormikContext<MissionActionFormValues>()
  valuesHistory.push(Object.fromEntries(CHECK_FIELDS.map(field => [field, values[field]])))

  return null
}

const INITIAL_VALUES: Partial<MissionActionFormValues> = {
  actionType: MissionAction.MissionActionType.SEA_CONTROL,
  isEISR: true,
  isUnitBoarded: true,
  speciesOnboard: [{ controlledWeight: 100, speciesCode: 'COD' } as MissionAction.SpeciesOnboardControl],
  vesselId: 1
}

function renderSpeciesField(checkValues: CheckValues) {
  function Form() {
    return (
      <ThemeProvider theme={THEME}>
        <Formik initialValues={{ ...INITIAL_VALUES, ...checkValues }} onSubmit={() => {}}>
          <>
            <SpeciesField />
            <ValuesRecorder />
          </>
        </Formik>
      </ThemeProvider>
    )
  }

  const { rerender } = render(<Form />)

  return { rerender: () => rerender(<Form />) }
}

async function flushEffects() {
  await act(async () => {
    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })
  })
}

describe('SpeciesField', () => {
  beforeEach(() => {
    valuesHistory = []
  })

  it('Should never erase the answers of a reopened control while the vessel is loading', async () => {
    const answers: CheckValues = {
      separateStowageOfPreservedSpecies: MissionAction.ControlCheck.YES,
      underSizedSeparateRecording: MissionAction.ControlCheck.NOT_APPLICABLE,
      underSizedSeparateStowage: MissionAction.ControlCheck.NOT_APPLICABLE
    }
    mockSpeciesQueryResult = { data: SPECIES }
    mockVesselQueryResult = { data: undefined, isLoading: true }
    const { rerender } = renderSpeciesField(answers)
    await flushEffects()

    mockVesselQueryResult = { data: { vesselLength: 20 }, isLoading: false }
    rerender()
    await flushEffects()

    valuesHistory.forEach(values => expect(values).toEqual(answers))
  })

  it('Should never erase the answers of a reopened control while the species are loading', async () => {
    const answers: CheckValues = {
      separateStowageOfPreservedSpecies: MissionAction.ControlCheck.YES,
      underSizedSeparateRecording: MissionAction.ControlCheck.NOT_APPLICABLE,
      underSizedSeparateStowage: MissionAction.ControlCheck.NOT_APPLICABLE
    }
    mockSpeciesQueryResult = { data: undefined }
    mockVesselQueryResult = { data: { vesselLength: 20 }, isLoading: false }
    const { rerender } = renderSpeciesField(answers)
    await flushEffects()

    mockSpeciesQueryResult = { data: SPECIES }
    rerender()
    await flushEffects()

    valuesHistory.forEach(values => expect(values).toEqual(answers))
  })
})
