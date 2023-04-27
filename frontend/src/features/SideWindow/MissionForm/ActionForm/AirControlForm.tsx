import { FormikDatePicker, FormikEffect, FormikTextarea, Icon, MultiZoneEditor } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'
import * as Yup from 'yup'

import { MissionActionInfractionSchema } from './shared/constants'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

const AirControlFormSchema = Yup.object().shape({
  otherInfractions: Yup.array(MissionActionInfractionSchema).notRequired()
})

export type AirControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function AirControlForm({ initialValues, onChange }: AirControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={AirControlFormSchema}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.Plane />
            Contrôle aérien ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          <VesselField />

          <FormikDatePicker
            baseContainer={newWindowContainerRef.current}
            isLight
            isStringDate
            label="Date et heure du contrôle"
            name="actionDatetimeUtc"
            withTime
          />

          <MultiZoneEditor
            addButtonLabel="Ajouter un point de contrôle"
            initialZone={{
              name: 'Nouvelle zone'
            }}
            isLight
            label="Lieu du contrôle"
            labelPropName="name"
          />

          <FormikMultiInfractionPicker
            addButtonLabel="Ajouter une infraction"
            label="Infractions"
            name="otherInfractions"
          />

          <FieldsetGroup isLight legend="Autres observations">
            <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" />
          </FieldsetGroup>
        </FormBody>
      </>
    </Formik>
  )
}
