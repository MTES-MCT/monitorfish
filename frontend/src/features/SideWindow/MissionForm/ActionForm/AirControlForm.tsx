import { FormikDatePicker, FormikEffect, Icon, MultiZoneEditor } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'
import * as Yup from 'yup'

import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikVesselSearch } from './shared/FormikVesselSearch'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

const MissionActionInfractionSchema = Yup.object().shape({
  comments: Yup.string().required(),
  infractionType: Yup.string().required(),
  natinf: Yup.number().required()
})

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
    () => getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={AirControlFormSchema}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.FishingEngine />
            Contrôle aérien ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          <FormikVesselSearch name="vesselId" />

          <FormikDatePicker
            baseContainer={newWindowContainerRef.current}
            isLight
            isStringDate
            label="Heure du contrôle"
            name="actionDatetimeUtc"
          />

          {/* TODO Formik that in monitor-ui. */}
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
        </FormBody>
      </>
    </Formik>
  )
}
