import { useGetLegacyControlUnitsQuery } from '@api/legacyControlUnit'
import { COLORS } from '@constants/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import {
  getFormFields,
  getReportingValue,
  updateReportingActor
} from '@features/Reporting/components/ReportingForm/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, FormikSelect, FormikTextarea, FormikTextInput, Legend, Fieldset } from '@mtes-mct/monitor-ui'
import { Form, Formik } from 'formik'
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
import type { EditableReporting, EditedReporting } from '../../../../domain/types/reporting'
import type { Option } from '@mtes-mct/monitor-ui'
import type { MutableRefObject } from 'react'

type ReportingFormProps = {
  closeForm: () => void
  editedReporting: EditableReporting | undefined
  hasWhiteBackground: boolean
  isFromSideWindow: boolean
  selectedVesselIdentity: VesselIdentity
}
export function ReportingForm({
  closeForm,
  editedReporting,
  hasWhiteBackground,
  isFromSideWindow,
  selectedVesselIdentity
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()
  const infractions = useMainAppSelector(state => state.infraction.infractions)
  const controlUnitsQuery = useGetLegacyControlUnitsQuery(undefined)
  const previousReportingType = useRef() as MutableRefObject<ReportingType>

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
    (reportingValue: EditedReporting) => {
      const nextReportingValue = getReportingValue(reportingValue)

      if (editedReporting?.id) {
        dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReporting.id,
            nextReportingValue,
            previousReportingType.current
          )
        ).then(() => {
          closeForm()
        })

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

      dispatch(addReporting(nextReportingWithMissingProperties)).then(() => {
        closeForm()
      })
    },
    [dispatch, closeForm, editedReporting, selectedVesselIdentity]
  )

  return (
    <Formik
      initialValues={getFormFields(editedReporting?.value)}
      onSubmit={createOrEditReporting}
      validationSchema={CreateOrEditReportingSchema}
    >
      {({ setFieldValue, values }) => {
        const updateActor = updateReportingActor(setFieldValue)

        return (
          <>
            <StyledForm $hasWhiteBackground={hasWhiteBackground}>
              <Fieldset className="Field-MultiRadio">
                <StyledLabel for="type">Type</StyledLabel>
                <RadioGroup
                  appearance="picker"
                  defaultValue={ReportingTypeCharacteristics.INFRACTION_SUSPICION.code}
                  id="type"
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
              </Fieldset>
              <Fieldset className="Field-MultiRadio">
                <StyledLabel for="reportingActor">Origine</StyledLabel>
                <RadioGroup
                  appearance="picker"
                  defaultValue={ReportingOriginActor.OPS.code}
                  id="reportingActor"
                  inline
                  onChange={value => updateActor(value)}
                  value={values.reportingActor ?? ''}
                >
                  {Object.entries(ReportingOriginActor).map(([key, val]) => (
                    <Radio key={key} data-cy={`new-reporting-reporting-actor-${key}`} value={key}>
                      {val.name}
                    </Radio>
                  ))}
                </RadioGroup>
              </Fieldset>
              {values.reportingActor === ReportingOriginActor.UNIT.code && (
                <StyledFormikSelect
                  isLight={!hasWhiteBackground}
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
                  title={infractions?.find(infraction => infraction.natinfCode === values.natinfCode)?.infraction}
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
          </>
        )
      }}
    </Formik>
  )
}

const StyledFormikSelect = styled(FormikSelect)`
  margin-top: 16px;
  width: 410px;
`

const StyledFormikTextInput = styled(FormikTextInput)`
  box-sizing: border-box;
  margin-top: 16px;
  width: 410px;
`

const StyledFormikTextarea = styled(FormikTextarea)`
  margin-top: 16px;
  width: 410px;
`

const ValidateButton = styled(Button)`
  margin: 24px 10px 0px 0px;
`

const CancelButton = styled(Button)`
  margin: 24px 0px 0px 0px;
`

const StyledLabel = styled(Legend)<{
  for: string | undefined
}>`
  margin-top: 12px;
`

const StyledForm = styled(Form)<{
  $hasWhiteBackground: boolean
}>`
  * {
    box-sizing: border-box !important;
  }

  margin: 0px 16px 16px 16px;
  .rs-picker-toggle {
    background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }

  .rs-radio-group {
    margin-top: 1px;
    margin-bottom: 5px;
    background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }
`
