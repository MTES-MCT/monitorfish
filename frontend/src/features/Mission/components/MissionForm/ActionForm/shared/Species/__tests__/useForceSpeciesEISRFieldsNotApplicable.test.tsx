import { MissionAction } from '@features/Mission/missionAction.types'
import { describe, expect, it } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { Formik, useFormikContext } from 'formik'

import { useForceSpeciesEISRFieldsNotApplicable } from '../useForceSpeciesEISRFieldsNotApplicable'

import type { MissionActionFormValues } from '../../../../types'
import type { SpeciesEISRApplicability } from '../getSpeciesEISRApplicability'
import type { ReactNode } from 'react'

const ALL_APPLICABLE: SpeciesEISRApplicability = {
  isSeparateStowageOfPreservedSpeciesApplicable: true,
  isUnderSizedSeparateRecordingApplicable: true,
  isUnderSizedSeparateStowageApplicable: true
}

function renderUseForceSpeciesEISRFieldsNotApplicable(
  initialValues: Partial<MissionActionFormValues>,
  initialApplicability: SpeciesEISRApplicability,
  initialIsApplicabilityResolved = true
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Formik initialValues={{ isUnitBoarded: true, ...initialValues }} onSubmit={() => {}}>
        {children}
      </Formik>
    )
  }

  return renderHook(
    ({
      applicability,
      isApplicabilityResolved
    }: {
      applicability: SpeciesEISRApplicability
      isApplicabilityResolved: boolean
    }) => {
      useForceSpeciesEISRFieldsNotApplicable(true, applicability, isApplicabilityResolved)

      return useFormikContext<MissionActionFormValues>().values
    },
    {
      initialProps: { applicability: initialApplicability, isApplicabilityResolved: initialIsApplicabilityResolved },
      wrapper: Wrapper
    }
  )
}

describe('useForceSpeciesEISRFieldsNotApplicable', () => {
  it('Should keep a N/A answered on an applicable field when the form is (re)opened', async () => {
    const { result } = renderUseForceSpeciesEISRFieldsNotApplicable(
      {
        underSizedSeparateRecording: MissionAction.ControlCheck.NOT_APPLICABLE,
        underSizedSeparateStowage: MissionAction.ControlCheck.NOT_APPLICABLE
      },
      ALL_APPLICABLE
    )
    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })

    expect(result.current.underSizedSeparateStowage).toBe(MissionAction.ControlCheck.NOT_APPLICABLE)
    expect(result.current.underSizedSeparateRecording).toBe(MissionAction.ControlCheck.NOT_APPLICABLE)
  })

  it('Should force N/A when a field becomes not applicable', async () => {
    const { rerender, result } = renderUseForceSpeciesEISRFieldsNotApplicable(
      { underSizedSeparateStowage: MissionAction.ControlCheck.YES },
      ALL_APPLICABLE
    )

    rerender({
      applicability: { ...ALL_APPLICABLE, isUnderSizedSeparateStowageApplicable: false },
      isApplicabilityResolved: true
    })

    await waitFor(() =>
      expect(result.current.underSizedSeparateStowage).toBe(MissionAction.ControlCheck.NOT_APPLICABLE)
    )
  })

  it('Should reset a forced N/A when a field becomes applicable again', async () => {
    const { rerender, result } = renderUseForceSpeciesEISRFieldsNotApplicable(
      { underSizedSeparateStowage: MissionAction.ControlCheck.NOT_APPLICABLE },
      { ...ALL_APPLICABLE, isUnderSizedSeparateStowageApplicable: false }
    )

    rerender({ applicability: ALL_APPLICABLE, isApplicabilityResolved: true })

    await waitFor(() => expect(result.current.underSizedSeparateStowage).toBeUndefined())
  })

  it('Should not touch any answer while applicability is not resolved, nor reset a N/A once it is', async () => {
    const { rerender, result } = renderUseForceSpeciesEISRFieldsNotApplicable(
      {
        separateStowageOfPreservedSpecies: MissionAction.ControlCheck.YES,
        underSizedSeparateStowage: MissionAction.ControlCheck.NOT_APPLICABLE
      },
      { ...ALL_APPLICABLE, isSeparateStowageOfPreservedSpeciesApplicable: false },
      false
    )

    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })
    expect(result.current.separateStowageOfPreservedSpecies).toBe(MissionAction.ControlCheck.YES)

    rerender({ applicability: ALL_APPLICABLE, isApplicabilityResolved: true })

    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })
    expect(result.current.separateStowageOfPreservedSpecies).toBe(MissionAction.ControlCheck.YES)
    expect(result.current.underSizedSeparateStowage).toBe(MissionAction.ControlCheck.NOT_APPLICABLE)
  })
})
