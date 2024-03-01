import { useGetLegacyControlUnitsQuery } from '@api/legacyControlUnit'
import { COLORS } from '@constants/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { updateReportingActor } from '@features/Reporting/components/ReportingForm/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FormikSelect, FormikTextarea, FormikTextInput, Button, Accent } from '@mtes-mct/monitor-ui'
import { Formik, Form } from 'formik'
import { useCallback, useMemo, useRef } from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { getOnlyVesselIdentityProperties } from '../../../../domain/entities/vessel/vessel'
import { ReportingType } from '../../../../domain/types/reporting'
import { sortArrayByColumn } from '../../../VesselList/tableSort'
import { ReportingOriginActor, ReportingTypeCharacteristics } from '../../types'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '../VesselReportings/Current/utils'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type {
  Observation,
  ReportingCreation,
  ReportingUpdate,
  EditableReporting,
  InfractionSuspicion
} from '../../../../domain/types/reporting'
import type { Option } from '@mtes-mct/monitor-ui'
import type { MutableRefObject } from 'react'

type ReportingFormProps = {
  closeForm: () => void
  editedReporting: EditableReporting | undefined
  fromSideWindow: boolean
  hasWhiteBackground: boolean
  selectedVesselIdentity: VesselIdentity
}
export function ReportingForm({
  closeForm,
  editedReporting,
  fromSideWindow,
  hasWhiteBackground,
  selectedVesselIdentity
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()
  const infractions = useMainAppSelector(state => state.infraction.infractions)
  const controlUnitsQuery = useGetLegacyControlUnitsQuery(undefined)

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

  const previousReportingType = useRef() as MutableRefObject<ReportingType>

  function getFields(editedOrSavedReporting: InfractionSuspicion | Observation | undefined): ReportingUpdate {
    const base = {
      authorContact: editedOrSavedReporting?.authorContact ?? undefined,
      authorTrigram: editedOrSavedReporting?.authorTrigram ?? undefined,
      controlUnitId: editedOrSavedReporting?.controlUnitId ?? undefined,
      description: editedOrSavedReporting?.description,
      reportingActor: editedOrSavedReporting?.reportingActor ?? 'OPS',
      title: editedOrSavedReporting?.title ?? '',
      type: editedOrSavedReporting?.type ?? ReportingType.INFRACTION_SUSPICION
    }

    if (base.type === ReportingType.INFRACTION_SUSPICION) {
      return {
        ...base,
        natinfCode: (editedOrSavedReporting as InfractionSuspicion)?.natinfCode
      }
    }

    return {
      ...base,
      natinfCode: undefined
    }
  }

  const editReporting = useCallback(
    (editedReportingId: number, nextReportingValue: ReportingUpdate) => {
      if (editedReporting) {
        dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReportingId,
            nextReportingValue,
            previousReportingType.current
          )
        ).then(() => {
          closeForm()
        })
      }
    },
    [dispatch, closeForm, editedReporting]
  )

  const createReporting = useCallback(
    (nextReporting: ReportingCreation) => {
      const nextReportingWithMissingProperties = {
        creationDate: new Date().toISOString(),
        externalReferenceNumber: selectedVesselIdentity.externalReferenceNumber,
        flagState: selectedVesselIdentity.flagState.toUpperCase(),
        internalReferenceNumber: selectedVesselIdentity.internalReferenceNumber,
        ircs: selectedVesselIdentity.ircs,
        type: nextReporting.type,
        validationDate: null,
        value: {
          ...nextReporting.value
        },
        vesselId: selectedVesselIdentity.vesselId ?? null,
        vesselIdentifier: selectedVesselIdentity.vesselIdentifier ?? null,
        vesselName: selectedVesselIdentity.vesselName ?? null
      }

      dispatch(addReporting(nextReportingWithMissingProperties)).then(() => {
        closeForm()
      })
    },
    [dispatch, selectedVesselIdentity, closeForm]
  )

  const createOrEditReporting = useCallback(
    (reportingValue: ReportingUpdate) => {
      const nextReporting = {
        type: reportingValue.type,
        value: {
          ...reportingValue,
          natinfCode: reportingValue.type === ReportingType.INFRACTION_SUSPICION ? reportingValue.natinfCode : undefined
        }
      }

      if (editedReporting) {
        editReporting(editedReporting.id, nextReporting.value)

        return
      }

      createReporting(nextReporting as ReportingCreation)
    },
    [editedReporting, editReporting, createReporting]
  )

  return (
    <Formik
      initialValues={getFields(editedReporting?.value)}
      onSubmit={createOrEditReporting}
      validationSchema={CreateOrEditReportingSchema}
    >
      {({ setFieldValue, values }) => {
        const updateActor = updateReportingActor(setFieldValue)

        return (
          <StyledForm $hasWhiteBackground={hasWhiteBackground}>
            <Label>Type</Label>
            <RadioGroup
              appearance="picker"
              defaultValue={ReportingTypeCharacteristics.INFRACTION_SUSPICION.code}
              inline
              onChange={value => setFieldValue('type', value as ReportingType)}
              value={values.type}
            >
              <Radio
                key={ReportingTypeCharacteristics.INFRACTION_SUSPICION.code}
                data-cy="new-reporting-select-infraction-reporting-type"
                value={ReportingTypeCharacteristics.INFRACTION_SUSPICION.code}
              >
                {ReportingTypeCharacteristics.INFRACTION_SUSPICION.inputName}
              </Radio>
              <Radio
                key={ReportingTypeCharacteristics.OBSERVATION.code}
                data-cy="new-reporting-select-observation-reporting-type"
                value={ReportingTypeCharacteristics.OBSERVATION.code}
              >
                {ReportingTypeCharacteristics.OBSERVATION.inputName}
              </Radio>
            </RadioGroup>
            <Label>Origine</Label>
            <RadioGroup
              appearance="picker"
              defaultValue={ReportingOriginActor.OPS.code}
              inline
              onChange={value => updateActor(value)}
              value={values.reportingActor}
            >
              {Object.entries(ReportingOriginActor).map(([key, val]) => (
                <Radio key={key} data-cy={`new-reporting-reporting-actor-${key}`} value={key}>
                  {val.name}
                </Radio>
              ))}
            </RadioGroup>
            {values.reportingActor === ReportingOriginActor.UNIT.code && (
              <StyledFormikSelect
                data-cy="new-reporting-select-unit"
                label="Choisir l'unité"
                name="controlUnitId"
                options={controlUnitsAsOptions}
                searchable
              />
            )}
            {(values.reportingActor === ReportingOriginActor.UNIT.code ||
              values.reportingActor === ReportingOriginActor.DML.code ||
              values.reportingActor === ReportingOriginActor.DIRM.code ||
              values.reportingActor === ReportingOriginActor.OTHER.code) && (
              <StyledFormikTextInput
                data-cy="new-reporting-author-contact"
                isLight={!hasWhiteBackground}
                label={'Nom et contact (numéro, mail…) de l&apos;émetteur'}
                name="authorContact"
                placeholder="Ex: Yannick Attal (06 24 25 01 91)"
              />
            )}
            <StyledFormikTextInput
              data-cy="new-reporting-title"
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
              data-cy="new-reporting-description"
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
                data-cy="new-reporting-select-natinf"
                label="Natinf"
                name="Natinf"
                options={infractionsAsOptions}
                placement={!fromSideWindow ? 'topStart' : undefined}
                searchable
                // @ts-ignore
                title={infractions?.find(infraction => infraction.natinfCode === values.natinfCode)?.infraction}
              />
            )}
            <StyledFormikTextInput
              data-cy="new-reporting-author-trigram"
              isLight={!hasWhiteBackground}
              label="Saisi par"
              name="authorTrigram"
              placeholder="Ex: LTH"
            />
            <ValidateButton accent={Accent.PRIMARY} data-cy="new-reporting-create-button" type="submit">
              Valider
            </ValidateButton>
            <CancelButton accent={Accent.SECONDARY} onClick={() => closeForm()}>
              Annuler
            </CancelButton>
          </StyledForm>
        )
      }}
    </Formik>
  )
}

const StyledFormikSelect = styled(FormikSelect)`
  margin-top: 12px;
  width: 410px;
`

const StyledFormikTextInput = styled(FormikTextInput)`
  box-sizing: border-box;
  margin-top: 12px;
  width: 410px;
`

const StyledFormikTextarea = styled(FormikTextarea)`
  margin-top: 12px;
  width: 410px;
`

const ValidateButton = styled(Button)`
  margin: 24px 10px 0px 0px;
`

const CancelButton = styled(Button)`
  margin: 24px 0px 0px 0px;
`

const Label = styled.div`
  margin-top: 10px;
  font-size: 12px;
`

const StyledForm = styled(Form)<{
  $hasWhiteBackground: boolean
}>`
  * {
    box-sizing: border-box !important;
  }

  margin: 16px;
  .rs-picker-toggle {
    background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }

  .rs-radio-group {
    margin-top: 5px;
    margin-bottom: 5px;
    background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }
`
