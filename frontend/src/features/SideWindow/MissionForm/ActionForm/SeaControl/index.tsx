import {
  FormikAutoComplete,
  FormikCheckbox,
  FormikEffect,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput,
  Icon,
  MultiZoneEditor,
  FormikDatePicker
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getLocalizedDayjs } from '../../../../../utils/getLocalizedDayjs'
import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroup } from '../../FieldsetGroup'
import { FormBody } from '../../FormBody'
import { FormHead } from '../../FormHead'
import { ComplianceField } from './ComplianceField'
import { DevicesField } from './DevicesField'
import { FleetSegmentsField } from './FleetSegmentsField'
import { SpeciesField } from './SpeciesField'

import type { PartialSeaControl } from '../../types'
import type { Promisable } from 'type-fest'

export type SeaControlProps = {
  action: PartialSeaControl
  onChange: (nextNewAction: PartialSeaControl) => Promisable<void>
}
export function SeaControl({ action, onChange }: SeaControlProps) {
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Formik initialValues={action} onSubmit={noop}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.FleetSegment />
            Contrôle en mer ({startDateAsDayjs.format('D MMM à HH:mm')})
          </h2>
        </FormHead>

        <FormBody>
          <FieldGroup isInline>
            <FormikAutoComplete
              isLabelHidden
              isLight
              label="Navire"
              name="vesselId"
              placeholder="Rechercher un navire"
            />
            <FormikCheckbox label="Navire inconnu" name="isVesselUnknown" />
          </FieldGroup>

          <FormikDatePicker isLight label="Date et heure du contrôle" name="date" withTime />

          <MultiZoneEditor
            addButtonLabel="Ajouter un point de contrôle"
            initialZone={{
              name: 'Nouvelle zone'
            }}
            label="Lieu du contrôle"
            labelPropName="name"
          />

          <ComplianceField />

          <DevicesField />

          <SpeciesField />

          {/* <FieldsetGroup isLight legend="Appréhension et déroutement du navire">
            <FormikCheckbox label="Appréhension et déroutement du navire" name="hasVesselBeenArrestedAndRerouted" />
          </FieldsetGroup> */}

          {/* TODO This <hr /> is invisible for some reason. */}
          <hr />

          <FleetSegmentsField />

          <FieldsetGroup isLight legend="Qualité du contrôle">
            <FormikMultiRadio
              isInline
              label="Navire ciblé par le CNSP"
              name="isVesselCnspTarget"
              options={[
                { label: 'Oui', value: 'YES' },
                { label: 'Non', value: 'NO' }
              ]}
            />
            <FormikTextarea label="Observations sur le déroulé du contrôle" name="controlProcessNote" />
            <FormikCheckbox label="Fiche RETEX nécessaire" name="isRetexRecordNeeded" />
          </FieldsetGroup>

          <FormikTextInput isLight label="Saisi par" name="editedBy" />
        </FormBody>
      </>
    </Formik>
  )
}
