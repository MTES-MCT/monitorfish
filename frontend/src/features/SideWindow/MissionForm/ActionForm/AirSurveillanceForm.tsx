import {
  FormikCheckbox,
  FormikEffect,
  FormikNumberInput,
  FormikTextarea,
  FormikTextInput,
  Icon,
  MultiSelect
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'

import { FLIGHT_GOALS_AS_OPTIONS } from './shared/constants'
import { FleetSegmentsField } from './shared/FleetSegmentsField'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type AirSurveillanceFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function AirSurveillanceForm({ initialValues, onChange }: AirSurveillanceFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  return (
    <Formik initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.Observation />
            Surveillance aérienne
          </h2>
        </FormHead>

        <FormBody>
          {/* TODO Update that once it's included in the API data. */}
          <MultiSelect
            // <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Objectifs du vol"
            name="flightGoals"
            options={FLIGHT_GOALS_AS_OPTIONS}
          />

          <FleetSegmentsField label="Segments ciblés (si pertinent)" />

          <FormikNumberInput isLight label="Nb de navires survolés" name="numberOfVesselsFlownOver" />

          <FormikTextarea isLight label="Observations générales sur le vol" name="otherComments" />

          <hr />

          <FieldsetGroup isLight legend="Qualité du contrôle">
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
