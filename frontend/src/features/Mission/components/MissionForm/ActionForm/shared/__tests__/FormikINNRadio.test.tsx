import { MissionAction } from '@features/Mission/missionAction.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { render, screen } from '@testing-library/react'
import { Formik, useFormikContext } from 'formik'

import { FormikINNRadio } from '../FormikINNRadio'

import type { MissionActionFormValues } from '../../../types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

const mockUseGetIsInInnAreaQuery = jest.fn()
jest.mock('@features/Mission/missionActionApi', () => ({
  useGetIsInInnAreaQuery: arg => mockUseGetIsInInnAreaQuery(arg)
}))

const NON_EU_FLAG_STATE = 'GB'

function IsINNControlProbe() {
  const { values } = useFormikContext<MissionActionFormValues>()

  return <div data-testid="isINNControl">{String(values.isINNControl)}</div>
}

function renderFormikINNRadio(values: Partial<MissionActionFormValues>) {
  render(
    <ThemeProvider theme={THEME}>
      <Formik initialValues={values} onSubmit={() => {}}>
        <>
          <FormikINNRadio />
          <IsINNControlProbe />
        </>
      </Formik>
    </ThemeProvider>
  )
}

function getIsINNControl(): string {
  return screen.getByTestId('isINNControl').textContent ?? ''
}

describe('<FormikINNRadio />', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetIsInInnAreaQuery.mockReturnValue({ data: undefined, isError: false })
  })

  it('Should default `isINNControl` to false When the vessel flies an EU flag', () => {
    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.SEA_CONTROL,
      flagState: 'FR',
      latitude: 47.1,
      longitude: -3.5
    })

    expect(screen.queryByText('Contrôle INN')).toBeNull()
    expect(getIsINNControl()).toEqual('false')
  })

  it('Should default `isINNControl` to false When the area query fails', () => {
    mockUseGetIsInInnAreaQuery.mockReturnValue({ data: undefined, isError: true })

    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.SEA_CONTROL,
      flagState: NON_EU_FLAG_STATE,
      latitude: 47.1,
      longitude: -3.5
    })

    expect(screen.queryByText('Contrôle INN')).toBeNull()
    expect(getIsINNControl()).toEqual('false')
  })

  it('Should NOT answer for the operator While the area query has yet to resolve', () => {
    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.SEA_CONTROL,
      flagState: NON_EU_FLAG_STATE,
      latitude: 47.1,
      longitude: -3.5
    })

    expect(screen.queryByText('Contrôle INN')).toBeNull()
    expect(getIsINNControl()).toEqual('undefined')
  })

  it('Should NOT answer for the operator While the control location is unknown', () => {
    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.SEA_CONTROL,
      flagState: NON_EU_FLAG_STATE
    })

    expect(screen.queryByText('Contrôle INN')).toBeNull()
    expect(getIsINNControl()).toEqual('undefined')
  })

  it('Should display the radio When a third country vessel is controlled in an INN area', () => {
    mockUseGetIsInInnAreaQuery.mockReturnValue({ data: { isInInnArea: true }, isError: false })

    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.SEA_CONTROL,
      flagState: NON_EU_FLAG_STATE,
      latitude: -21.1,
      longitude: 55.5
    })

    expect(screen.queryAllByText('Contrôle INN').length).toBeGreaterThan(0)
    expect(getIsINNControl()).toEqual('undefined')
  })

  it('Should default `isINNControl` to false When a land control happens in a metropolitan French port', () => {
    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.LAND_CONTROL,
      flagState: NON_EU_FLAG_STATE,
      portLocode: 'FRZEG'
    })

    expect(screen.queryByText('Contrôle INN')).toBeNull()
    expect(getIsINNControl()).toEqual('false')
  })

  it('Should display the radio When a land control happens in an overseas port', () => {
    renderFormikINNRadio({
      actionType: MissionAction.MissionActionType.LAND_CONTROL,
      flagState: NON_EU_FLAG_STATE,
      portLocode: 'REPDG'
    })

    expect(screen.queryAllByText('Contrôle INN').length).toBeGreaterThan(0)
    expect(getIsINNControl()).toEqual('undefined')
  })
})
