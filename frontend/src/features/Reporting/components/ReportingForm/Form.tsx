import { WindowContext } from '@api/constants'
import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { updateReportingActor } from '@features/Reporting/components/ReportingForm/utils'
import { sortArrayByColumn } from '@features/Vessel/components/VesselList/tableSort'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  Accent,
  Button,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  getOptionsFromLabelledEnum,
  MultiRadio
} from '@mtes-mct/monitor-ui'
import { Form as FormikForm, useFormikContext } from 'formik'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  ReportingOriginActor,
  ReportingOriginActorLabel,
  ReportingType,
  ReportingTypeCharacteristics
} from '../../types'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '../VesselReportingList/utils'

import type { EditedReporting, InfractionSuspicion } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

type FormProps = Readonly<{
  className: string | undefined
  hasWhiteBackground: boolean
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
  windowContext: WindowContext
}>
export function Form({ className, hasWhiteBackground, onClose, onIsDirty, windowContext }: FormProps) {
  const { dirty, setFieldValue, values } = useFormikContext<EditedReporting>()

  // TODO Replace that with a `useInfractionsAsOptions()` hook with RTK query.
  const infractions = useMainAppSelector(state => state.infraction.infractions)
  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const infractionsAsOptions = useMemo(
    () =>
      infractions
        .map(infraction => ({
          label: `${infraction.natinfCode} - ${infraction.infraction}`,
          value: infraction.natinfCode
        }))
        .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc')),
    [infractions]
  )

  const controlUnitsAsOptions = useMemo((): Option<number>[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedIdsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  const updateActor = updateReportingActor(setFieldValue)
  const infractionTitle = infractions?.find(
    infraction => infraction.natinfCode === (values as Partial<InfractionSuspicion>).natinfCode
  )?.infraction

  useEffect(() => {
    if (onIsDirty) {
      onIsDirty(dirty)
    }
  }, [dirty, onIsDirty])

  return (
    <StyledForm
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
            label: ReportingTypeCharacteristics.INFRACTION_SUSPICION.inputName,
            value: ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
          },
          {
            label: ReportingTypeCharacteristics.OBSERVATION.inputName,
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
      {values.type === ReportingTypeCharacteristics.INFRACTION_SUSPICION.code && (
        <FormikSelect
          isLight={!hasWhiteBackground}
          label="Natinf"
          name="natinfCode"
          options={infractionsAsOptions}
          placement={windowContext === WindowContext.MainWindow ? 'topStart' : undefined}
          searchable
          // @ts-ignore
          title={infractionTitle}
        />
      )}
      <FormikTextInput isLight={!hasWhiteBackground} label="Saisi par" name="authorTrigram" placeholder="Ex: LTH" />
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
  margin: 24px 10px 0px 0px;
`

const CancelButton = styled(Button)`
  margin: 24px 0px 0px 0px;
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
