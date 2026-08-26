import { beforeEach, describe, expect, it } from '@jest/globals'
import { act, render, screen } from '@testing-library/react'
import { Formik, useFormikContext } from 'formik'

import { FormikSyncMissionFields } from '../FormikSyncMissionFields'

import type { MissionMainFormValues } from '../../types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

const mockUseListenToMissionEventUpdatesById = jest.fn()
jest.mock('../../hooks/useListenToMissionEventUpdatesById', () => ({
  useListenToMissionEventUpdatesById: missionId => mockUseListenToMissionEventUpdatesById(missionId)
}))

let mockState = { missionForm: { lastSavedUpdatedAtUtc: undefined as string | undefined } }
jest.mock('@hooks/useMainAppSelector', () => ({
  useMainAppSelector: selector => selector(mockState)
}))

function OpenByProbe() {
  const { values } = useFormikContext<MissionMainFormValues>()

  return <div data-testid="openBy">{values.openBy ?? ''}</div>
}

function renderFormikSyncMissionFields(initialOpenBy: string) {
  return render(
    <Formik initialValues={{ openBy: initialOpenBy }} onSubmit={() => undefined}>
      <>
        <FormikSyncMissionFields missionId={43969} />
        <OpenByProbe />
      </>
    </Formik>
  )
}

describe('<FormikSyncMissionFields />', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockState = { missionForm: { lastSavedUpdatedAtUtc: undefined } }
  })

  it('Should NOT overwrite local form values when the event is the echo of an own save (same `updatedAtUtc`)', async () => {
    // Given: the last save this client made produced `updatedAtUtc` T1, and the operator has typed more since
    mockState = { missionForm: { lastSavedUpdatedAtUtc: '2026-08-26T05:41:50Z' } }
    mockUseListenToMissionEventUpdatesById.mockReturnValue({
      id: 43969,
      openBy: 'CA',
      updatedAtUtc: '2026-08-26T05:41:50Z'
    })

    // When: the echo of that save arrives with the older value
    renderFormikSyncMissionFields('CAR')
    await act(async () => {})

    // Then: the operator's newer input is preserved
    expect(screen.getByTestId('openBy').textContent).toBe('CAR')
  })

  it('Should NOT overwrite local form values when the event is older than the last save', async () => {
    // Given
    mockState = { missionForm: { lastSavedUpdatedAtUtc: '2026-08-26T05:41:50Z' } }
    mockUseListenToMissionEventUpdatesById.mockReturnValue({
      id: 43969,
      openBy: 'C',
      updatedAtUtc: '2026-08-26T05:41:49Z'
    })

    // When
    renderFormikSyncMissionFields('CAR')
    await act(async () => {})

    // Then
    expect(screen.getByTestId('openBy').textContent).toBe('CAR')
  })

  it('Should apply the event when it is newer than the last save (real external update)', async () => {
    // Given
    mockState = { missionForm: { lastSavedUpdatedAtUtc: '2026-08-26T05:41:50Z' } }
    mockUseListenToMissionEventUpdatesById.mockReturnValue({
      id: 43969,
      openBy: 'MONITORENV USER',
      updatedAtUtc: '2026-08-26T05:41:51Z'
    })

    // When
    renderFormikSyncMissionFields('CAR')
    await act(async () => {})

    // Then
    expect(screen.getByTestId('openBy').textContent).toBe('MONITORENV USER')
  })

  it('Should apply the event when this client has not saved anything yet', async () => {
    // Given
    mockUseListenToMissionEventUpdatesById.mockReturnValue({
      id: 43969,
      openBy: 'MONITORENV USER',
      updatedAtUtc: '2026-08-26T05:41:51Z'
    })

    // When
    renderFormikSyncMissionFields('CAR')
    await act(async () => {})

    // Then
    expect(screen.getByTestId('openBy').textContent).toBe('MONITORENV USER')
  })
})
