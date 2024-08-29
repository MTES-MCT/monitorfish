import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import {
  getFormFields,
  getReportingValue,
  updateReportingActor
} from '@features/Reporting/components/ReportingForm/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
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
import { Form, Formik } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { getOnlyVesselIdentityProperties } from '../../../../domain/entities/vessel/vessel'
import { sortArrayByColumn } from '../../../VesselList/tableSort'
import {
  ReportingOriginActor,
  ReportingOriginActorLabel,
  ReportingType,
  ReportingTypeCharacteristics
} from '../../types'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '../VesselReportings/Current/utils'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { EditableReporting, EditedReporting, InfractionSuspicion } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

type ReportingFormProps = {
  className?: string | undefined
  closeForm: () => void
  editedReporting: EditableReporting | undefined
  hasWhiteBackground: boolean
  isFromSideWindow: boolean
  selectedVesselIdentity: VesselIdentity
}
export function ReportingForm({
  className,
  closeForm,
  editedReporting,
  hasWhiteBackground,
  isFromSideWindow,
  selectedVesselIdentity
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()
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

  const createOrEditReporting = useCallback(
    async (reportingValue: EditedReporting) => {
      const nextReportingValue = getReportingValue(reportingValue)

      if (editedReporting?.id) {
        await dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReporting.id,
            nextReportingValue,
            editedReporting.type,
            isFromSideWindow
          )
        )

        closeForm()

        return
      }

      const nextReportingWithMissingProperties = {
        creationDate: new Date().toISOString(),
        externalReferenceNumber: selectedVesselIdentity.externalReferenceNumber,
        flagState: selectedVesselIdentity.flagState.toUpperCase(),
        internalReferenceNumber: selectedVesselIdentity.internalReferenceNumber,
        ircs: selectedVesselIdentity.ircs,
        type: nextReportingValue.type,
        validationDate: null,
        value: {
          ...nextReportingValue
        },
        vesselId: selectedVesselIdentity.vesselId ?? null,
        vesselIdentifier: selectedVesselIdentity.vesselIdentifier ?? null,
        vesselName: selectedVesselIdentity.vesselName ?? null
      }

      await dispatch(addReporting(nextReportingWithMissingProperties))
      closeForm()
    },
    [dispatch, closeForm, editedReporting, isFromSideWindow, selectedVesselIdentity]
  )

  return (
    <Formik
      initialValues={getFormFields(editedReporting?.value, editedReporting?.type)}
      onSubmit={createOrEditReporting}
      validationSchema={CreateOrEditReportingSchema}
    >
      {({ setFieldValue, values }) => {
        const updateActor = updateReportingActor(setFieldValue)
        const infractionTitle = infractions?.find(
          infraction => infraction.natinfCode === (values as Partial<InfractionSuspicion>).natinfCode
        )?.infraction

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
              <StyledFormikSelect
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
              <StyledFormikTextInput
                isLight={!hasWhiteBackground}
                label="Nom et contact (numéro, mail…) de l’émetteur"
                name="authorContact"
                placeholder="Ex: Yannick Attal (06 24 25 01 91)"
              />
            )}
            <StyledFormikTextInput
              isLight={!hasWhiteBackground}
              label="Titre"
              name="title"
              placeholder={
                values.type === ReportingTypeCharacteristics.OBSERVATION.code
                  ? 'Ex: Dérogation temporaire licence'
                  : 'Ex: Infraction maille cul de chalut'
              }
            />
            <StyledFormikTextarea
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
              <StyledFormikSelect
                isLight={!hasWhiteBackground}
                label="Natinf"
                name="natinfCode"
                options={infractionsAsOptions}
                placement={!isFromSideWindow ? 'topStart' : undefined}
                searchable
                // @ts-ignore
                title={infractionTitle}
              />
            )}
            <StyledFormikTextInput
              isLight={!hasWhiteBackground}
              label="Saisi par"
              name="authorTrigram"
              placeholder="Ex: LTH"
            />
            <ValidateButton accent={Accent.PRIMARY} type="submit">
              Valider
            </ValidateButton>
            <CancelButton accent={Accent.SECONDARY} onClick={closeForm}>
              Annuler
            </CancelButton>
          </StyledForm>
        )
      }}
    </Formik>
  )
}

const StyledFormikSelect = styled(FormikSelect)`
  width: 416px;
`

const StyledFormikTextInput = styled(FormikTextInput)`
  width: 416px;
`

const StyledFormikTextarea = styled(FormikTextarea)`
  width: 416px;
`

const ValidateButton = styled(Button)`
  margin: 24px 10px 0px 0px;
`

const CancelButton = styled(Button)`
  margin: 24px 0px 0px 0px;
`

const StyledForm = styled(Form)<{
  $hasWhiteBackground: boolean
  $isInfractionSuspicion: boolean
}>`
  background: ${p => {
    if (p.$hasWhiteBackground) {
      return 'unset'
    }

    return p.$isInfractionSuspicion ? p.theme.color.maximumRed15 : p.theme.color.gainsboro
  }};

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

  padding-right: 16px;
  padding-left: 16px;
`
