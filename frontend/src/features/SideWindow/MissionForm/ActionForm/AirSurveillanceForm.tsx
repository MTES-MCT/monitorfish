import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiSelect,
  FormikNumberInput,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  Icon
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getTitleDateFromUtcStringDate } from './shared/utils'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldsetGroup } from '../FieldsetGroup'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type AirSurveillanceFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function AirSurveillanceForm({ initialValues, onChange }: AirSurveillanceFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const titleDate = useMemo(
    () => getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.Observation />
            Surveillance aérienne ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          {/* TODO Check this prop (is this the right label?). */}
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Espèces protégées"
            name="???"
            options={[]}
          />

          {/* TODO Check this prop (it's a singular). */}
          <FormikSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Segment ciblé (si pertinent)"
            name="???"
            options={[]}
          />

          <FormikNumberInput isLight label="Nb de navires survolés" name="numberOfVesselsFlownOver" />

          {/* TODO Check this prop. */}
          <FormikTextarea isLight label="Observations générales sur le vol" name="otherComments" />

          <hr />

          <FieldsetGroup isLight legend="Qualité du contrôle">
            {/* TODO Check this prop. */}
            <FormikTextarea
              label="Observations sur le déroulé de la surveillance"
              name="controlQualityComments"
              placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
            />
            <FormikCheckbox label="Fiche RETEX nécessaire" name="feedbackSheetRequired" />
          </FieldsetGroup>

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
