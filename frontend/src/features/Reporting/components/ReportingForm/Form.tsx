import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { updateReportingActor } from '@features/Reporting/components/ReportingForm/utils'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '@features/Reporting/components/VesselReportings/CurrentReportingList/utils'
import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import {
  Accent,
  Button,
  CheckTreePicker,
  FormikDatePicker,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  getOptionsFromLabelledEnum,
  MultiRadio
} from '@mtes-mct/monitor-ui'
import { Form as FormikForm, type FormikErrors, useFormikContext } from 'formik'
import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { ReportingOriginActorLabel, ReportingTypeCharacteristics } from '../../types'

import type { FormEditedReporting, InfractionSuspicion } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

type FormProps = Readonly<{
  className: string | undefined
  hasWhiteBackground: boolean
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
}>
export function Form({ className, hasWhiteBackground, onClose, onIsDirty }: FormProps) {
  const { dirty, errors, setFieldValue, values } = useFormikContext<FormEditedReporting>()
  const formRef = useRef<HTMLFormElement | null>(null)
  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const threatCharacterizationOptions = useGetThreatCharacterizationAsTreeOptions(
    values.type === ReportingType.INFRACTION_SUSPICION && values.threatHierarchy ? [values.threatHierarchy] : undefined
  )

  const controlUnitsAsOptions = useMemo((): Option<number>[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedIdsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  const updateActor = updateReportingActor(setFieldValue)

  useEffect(() => {
    if (onIsDirty) {
      onIsDirty(dirty)
    }
  }, [dirty, onIsDirty])

  return (
    <StyledForm
      ref={formRef}
      $hasWhiteBackground={hasWhiteBackground}
      $isInfractionSuspicion={values.type === ReportingType.INFRACTION_SUSPICION}
      className={className}
    >
      <FormikMultiRadio
        isInline
        isLight={!hasWhiteBackground}
        label="Type de signalement"
        name="type"
        options={[
          {
            label: ReportingTypeCharacteristics.INFRACTION_SUSPICION.displayName,
            value: ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
          },
          {
            label: ReportingTypeCharacteristics.OBSERVATION.displayName,
            value: ReportingTypeCharacteristics.OBSERVATION.code
          }
        ]}
      />
      <MultiRadio
        isInline
        isLight={!hasWhiteBackground}
        label="Origine"
        name="reportingActor"
        onChange={updateActor}
        options={getOptionsFromLabelledEnum(ReportingOriginActorLabel)}
        value={values.reportingActor}
      />
      {values.reportingActor === ReportingOriginActor.UNIT && (
        <FormikSelect
          isLight={!hasWhiteBackground}
          label="Choisir l'unité"
          name="controlUnitId"
          options={controlUnitsAsOptions}
          searchable
        />
      )}
      {(values.reportingActor === ReportingOriginActor.UNIT ||
        values.reportingActor === ReportingOriginActor.DML ||
        values.reportingActor === ReportingOriginActor.DIRM ||
        values.reportingActor === ReportingOriginActor.OTHER) && (
        <FormikTextInput
          isLight={!hasWhiteBackground}
          label="Nom et contact (numéro, mail…) de l’émetteur"
          name="authorContact"
          placeholder="Ex: Yannick Attal (06 24 25 01 91)"
        />
      )}
      <FormikTextInput
        isLight={!hasWhiteBackground}
        isRequired
        label="Titre"
        name="title"
        placeholder={
          values.type === ReportingTypeCharacteristics.OBSERVATION.code
            ? 'Ex: Dérogation temporaire licence'
            : 'Ex: Infraction maille cul de chalut'
        }
      />
      <FormikTextarea
        isLight={!hasWhiteBackground}
        label="Description"
        name="description"
        placeholder={
          values.type === ReportingTypeCharacteristics.OBSERVATION.code
            ? "Ex: Licence en cours de renouvellement, dérogation accordée par la DML jusqu'au 01/08/2022."
            : 'Ex: Infraction constatée sur la taille de la maille en cul de chalut'
        }
      />
      {values.type === ReportingType.INFRACTION_SUSPICION && (
        <CheckTreePicker
          error={(errors as FormikErrors<Partial<InfractionSuspicion>>).threatHierarchy as string | undefined}
          isLight={!hasWhiteBackground}
          isRequired
          isSelect
          label="Type d’infraction et NATINF"
          name="threatHierarchy"
          onChange={nextThreats => {
            if (!!nextThreats && nextThreats.length > 0) {
              setFieldValue('threatHierarchy', nextThreats[0])
            } else {
              setFieldValue('threatHierarchy', undefined)
            }
          }}
          options={threatCharacterizationOptions}
          searchable
          value={
            values.type === ReportingType.INFRACTION_SUSPICION && values.threatHierarchy
              ? [values.threatHierarchy]
              : undefined
          }
        />
      )}
      <FormikDatePicker
        baseContainer={formRef.current as unknown as HTMLDivElement}
        isLight={!hasWhiteBackground}
        isStringDate
        label="Fin de validité"
        name="expirationDate"
        withTime={false}
      />
      <ValidateButton accent={Accent.PRIMARY} type="submit">
        Valider
      </ValidateButton>
      <CancelButton accent={Accent.SECONDARY} onClick={onClose}>
        Annuler
      </CancelButton>
    </StyledForm>
  )
}

const ValidateButton = styled(Button)`
  margin: 24px 10px 0 0;
`

const CancelButton = styled(Button)`
  margin: 24px 0 0 0;
`

const StyledForm = styled(FormikForm)<{
  $hasWhiteBackground: boolean
  $isInfractionSuspicion: boolean
}>`
  background: ${p => {
    if (p.$hasWhiteBackground) {
      return 'unset'
    }

    return p.$isInfractionSuspicion ? p.theme.color.maximumRed15 : p.theme.color.gainsboro
  }};
  padding-right: 16px;
  padding-left: 16px;

  * {
    box-sizing: border-box !important;
  }

  > .Element-Field,
  > .Element-Fieldset:not(:first-child) {
    margin-top: 16px;
  }

  > .Field-MultiRadio > legend {
    margin-bottom: 8px;
  }
`
