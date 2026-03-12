import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { FormikCoordinatesPicker } from '@features/Reporting/components/ReportingForm/FormikCoordinatesPicker'
import { updateReportingSource } from '@features/Reporting/components/ReportingForm/utils'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '@features/Reporting/components/VesselReportings/CurrentReportingList/utils'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import {
  Accent,
  Button,
  Checkbox,
  CheckTreePicker,
  FieldError,
  FormikCheckbox,
  FormikDatePicker,
  FormikMultiRadio,
  FormikNumberInput,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  getOptionsFromLabelledEnum,
  MultiRadio
} from '@mtes-mct/monitor-ui'
import { Form as FormikForm, type FormikErrors, useFormikContext } from 'formik'
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import {
  OtherSourceTypeLabel,
  ReportingOriginSourceLabel,
  ReportingTypeCharacteristics,
  SatelliteSourceLabel
} from '../../types'

import type { FormEditedReporting, InfractionSuspicion } from '../../types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import type { Option } from '@mtes-mct/monitor-ui'

type FormProps = Readonly<{
  className: string | undefined
  displayedErrorKey: DisplayedErrorKey
  hasWhiteBackground: boolean
  hideButtons?: boolean
  hideVesselSection?: boolean
  onAutoSave?: ((values: FormEditedReporting) => void) | undefined
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
  onVesselStateChange?: ((vesselName: string | undefined, flagState: string | undefined) => void) | undefined
  submitRef?: MutableRefObject<(() => Promise<void>) | undefined> | undefined
}>

const DEBOUNCE_DELAY = 1000

export function Form({
  className,
  displayedErrorKey,
  hasWhiteBackground,
  hideButtons = false,
  hideVesselSection = false,
  onAutoSave,
  onClose,
  onIsDirty,
  onVesselStateChange,
  submitRef
}: FormProps) {
  const { dirty, errors, initialValues, isValid, setFieldValue, setValues, submitForm, values } =
    useFormikContext<FormEditedReporting>()
  const formRef = useRef<HTMLFormElement | null>(null)
  const controlUnitsQuery = useGetControlUnitsQuery(undefined)
  const { gearsAsOptions } = useGetGearsAsOptions()
  const debouncedAutoSave = useDebouncedCallback((currentValues: FormEditedReporting) => {
    onAutoSave?.(currentValues)
  }, DEBOUNCE_DELAY)

  const selectedVessel = useMemo<Vessel.VesselIdentity | undefined>(() => {
    if (!values.vesselId || !values.vesselName) {
      return undefined
    }

    return {
      beaconNumber: undefined,
      districtCode: undefined,
      externalReferenceNumber: values.externalMarker,
      flagState: values.flagState ?? '',
      internalReferenceNumber: values.cfr,
      ircs: values.ircs,
      mmsi: values.mmsi,
      vesselId: values.vesselId,
      vesselIdentifier: values.vesselIdentifier,
      vesselLength: values.length,
      vesselName: values.vesselName
    }
  }, [
    values.vesselId,
    values.vesselName,
    values.externalMarker,
    values.flagState,
    values.cfr,
    values.ircs,
    values.mmsi,
    values.vesselIdentifier,
    values.length
  ])
  const [isVesselAbsent, setIsVesselAbsent] = useState(!initialValues.vesselId && !!initialValues.vesselName)

  const isInfractionSuspicion = values.type === ReportingType.INFRACTION_SUSPICION
  const isLight = !hasWhiteBackground

  const threatCharacterizationOptions = useGetThreatCharacterizationAsTreeOptions(
    isInfractionSuspicion && values.threatHierarchy ? [values.threatHierarchy] : undefined
  )

  const controlUnitsAsOptions = useMemo((): Option<number>[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedIdsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  function clearVesselValues() {
    setValues({
      ...values,
      cfr: undefined,
      externalMarker: undefined,
      flagState: 'UNDEFINED',
      ircs: undefined,
      length: undefined,
      mmsi: undefined,
      vesselId: undefined,
      vesselIdentifier: undefined,
      vesselName: undefined
    })
  }

  const handleVesselSelect = (vessel: Vessel.VesselIdentity | undefined) => {
    if (!vessel) {
      clearVesselValues()

      return
    }
    setValues({
      ...values,
      cfr: vessel.internalReferenceNumber,
      externalMarker: vessel.externalReferenceNumber,
      flagState: vessel.flagState ?? '',
      ircs: vessel.ircs,
      length: vessel.vesselLength,
      mmsi: vessel.mmsi,
      vesselId: vessel.vesselId,
      vesselIdentifier: vessel.vesselIdentifier,
      vesselName: vessel.vesselName
    })
  }

  const handleAbsentToggle = (isChecked: boolean | undefined) => {
    if (isChecked) {
      setIsVesselAbsent(true)
      clearVesselValues()
    } else {
      setIsVesselAbsent(false)
    }
  }

  useEffect(() => {
    if (onIsDirty) {
      onIsDirty(dirty)
    }
  }, [dirty, onIsDirty])

  useEffect(() => {
    if (submitRef) {
      // eslint-disable-next-line no-param-reassign
      submitRef.current = submitForm
    }
  }, [submitForm, submitRef])

  useEffect(() => {
    onVesselStateChange?.(values.vesselName, values.flagState)
  }, [onVesselStateChange, values.flagState, values.vesselName])

  useEffect(() => {
    if (!onAutoSave || !isValid || !dirty) {
      return
    }

    debouncedAutoSave(values)
  }, [debouncedAutoSave, dirty, isValid, onAutoSave, values])

  useEffect(
    () => () => {
      debouncedAutoSave.cancel()
    },
    [debouncedAutoSave]
  )

  return (
    <StyledForm
      ref={formRef}
      $hasWhiteBackground={hasWhiteBackground}
      $isInfractionSuspicion={isInfractionSuspicion}
      className={className}
    >
      <MultiRadio
        isInline
        isLight={isLight}
        label="Source"
        name="reportingSource"
        onChange={source => updateReportingSource(source, setFieldValue)}
        options={getOptionsFromLabelledEnum(ReportingOriginSourceLabel)}
        value={values.reportingSource}
      />
      {values.reportingSource === ReportingOriginSource.UNIT && (
        <FormikSelect
          isLight={isLight}
          label="Choisir l'unité"
          name="controlUnitId"
          options={controlUnitsAsOptions}
          searchable
        />
      )}
      {values.reportingSource === ReportingOriginSource.SATELLITE && (
        <FormikSelect
          isLight={isLight}
          label="Type de cliché satellite"
          name="satelliteSource"
          options={getOptionsFromLabelledEnum(SatelliteSourceLabel)}
        />
      )}
      {values.reportingSource === ReportingOriginSource.OTHER && (
        <FormikSelect
          isLight={isLight}
          label="Autres types de source"
          name="otherSourceType"
          options={getOptionsFromLabelledEnum(OtherSourceTypeLabel)}
        />
      )}
      {(values.reportingSource === ReportingOriginSource.UNIT ||
        values.reportingSource === ReportingOriginSource.OTHER) && (
        <FormikTextInput
          isLight={isLight}
          label="Identité de l’émetteur"
          name="authorContact"
          placeholder="Ex: Yannick Attal (06 24 25 01 91)"
        />
      )}
      <StyledHr />
      <FormikCoordinatesPicker isLight={isLight} />
      <StyledHr />
      {!hideVesselSection && (
        <VesselSection $hasError={!!errors?.isUnknownVessel}>
          <VesselSearch
            disabled={isVesselAbsent}
            displayedErrorKey={displayedErrorKey}
            onChange={handleVesselSelect}
            shouldCloseOnClickOutside
            value={selectedVessel}
            withLastSearchResults
          />
          {!selectedVessel && (
            <StyledCheckbox
              checked={isVesselAbsent}
              isLight
              label="Navire absent de la base de données"
              name="isVesselAbsent"
              onChange={handleAbsentToggle}
            />
          )}
          {!isVesselAbsent && selectedVessel && (
            <VesselCard>
              <ReadOnlyField label="Nom">{values.vesselName ?? '-'}</ReadOnlyField>
              <ReadOnlyField label="Nationalité">{values.flagState ?? '-'}</ReadOnlyField>
              <TwoCol>
                <ReadOnlyField label="MMSI">{values.mmsi ?? '-'}</ReadOnlyField>
                <ReadOnlyField label="IMO">{values.imo ?? '-'}</ReadOnlyField>
              </TwoCol>
              <TwoCol>
                <ReadOnlyField label="IRCS (Call Sign)">{values.ircs ?? '-'}</ReadOnlyField>
                <ReadOnlyField label="Autre marquage coque">{values.externalMarker ?? '-'}</ReadOnlyField>
              </TwoCol>
              <TwoCol>
                <FormikSelect
                  isLight
                  label="Engin"
                  name="gearCode"
                  options={gearsAsOptions ?? []}
                  searchable
                  virtualized
                />
                <FormikNumberInput isLight label="Longueur" name="length" />
              </TwoCol>
              <FormikCheckbox isLight label="Navire en action de pêche" name="isFishing" />
            </VesselCard>
          )}
          {isVesselAbsent && (
            <VesselCard>
              <FormikTextInput isLight label="Nom" name="vesselName" />
              <FormikSelect
                isLight
                label="Nationalité"
                name="flagState"
                options={COUNTRIES_AS_ALPHA2_OPTIONS}
                searchable
                virtualized
              />
              <TwoCol>
                <FormikTextInput isLight label="MMSI" name="mmsi" />
                <FormikTextInput isLight label="IMO" name="imo" />
              </TwoCol>
              <TwoCol>
                <FormikTextInput isLight label="IRCS (Call Sign)" name="ircs" />
                <FormikTextInput isLight label="Marquage extérieur" name="externalMarker" />
              </TwoCol>
              <TwoCol>
                <FormikSelect
                  isLight
                  label="Engin"
                  name="gearCode"
                  options={gearsAsOptions ?? []}
                  searchable
                  virtualized
                />
                <FormikNumberInput isLight label="Longueur" name="length" />
              </TwoCol>
              <TwoCol>
                <FormikCheckbox isLight label="Navire en action de pêche" name="isFishing" />
                <FormikCheckbox isErrorMessageHidden isLight label="Navire non identifiable" name="isUnknownVessel" />
              </TwoCol>
            </VesselCard>
          )}
        </VesselSection>
      )}
      {!hideVesselSection && errors?.isUnknownVessel && <FieldError>{errors?.isUnknownVessel}</FieldError>}
      <StyledHr />
      <FormikMultiRadio
        isInline
        isLight={isLight}
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
      <FormikTextInput
        isLight={isLight}
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
        isLight={isLight}
        label="Description"
        name="description"
        placeholder={
          values.type === ReportingTypeCharacteristics.OBSERVATION.code
            ? "Ex: Licence en cours de renouvellement, dérogation accordée par la DML jusqu'au 01/08/2022."
            : 'Ex: Infraction constatée sur la taille de la maille en cul de chalut'
        }
      />
      {isInfractionSuspicion && (
        <CheckTreePicker
          error={(errors as FormikErrors<Partial<InfractionSuspicion>>).threatHierarchy as string | undefined}
          isLight={isLight}
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
          placement="top"
          searchable
          value={isInfractionSuspicion && values.threatHierarchy ? [values.threatHierarchy] : undefined}
        />
      )}
      <TwoCol>
        <FormikDatePicker
          baseContainer={formRef.current as unknown as HTMLDivElement}
          isLight={isLight}
          isRequired
          isStringDate
          label="Date et heure"
          name="reportingDate"
          withTime
        />
        <FormikDatePicker
          baseContainer={formRef.current as unknown as HTMLDivElement}
          isLight={isLight}
          isStringDate
          label="Fin de validité"
          name="expirationDate"
          withTime={false}
        />
      </TwoCol>
      {values.isArchived && <ArchivedMessage>Le signalement a été archivé.</ArchivedMessage>}
      {!hideButtons && (
        <>
          <ValidateButton accent={Accent.PRIMARY} type="submit">
            Valider
          </ValidateButton>
          <CancelButton accent={Accent.SECONDARY} onClick={onClose}>
            Annuler
          </CancelButton>
        </>
      )}
    </StyledForm>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-top: 8px;
`

const VesselSection = styled.div<{ $hasError: boolean }>`
  background: ${p => p.theme.color.gainsboro};
  padding: 8px;
  z-index: 9999;
  border: ${p => (p.$hasError ? `1px solid ${p.theme.color.maximumRed}` : 'unset')};

  div:first-of-type {
    width: 100%;
  }
`

const ValidateButton = styled(Button)`
  margin: 24px 10px 0 0;
`

const CancelButton = styled(Button)`
  margin: 24px 0 0 0;
`

const StyledHr = styled.hr`
  background: ${p => p.theme.color.slateGray};
  height: 1px;
  margin: 24px 0 0;
`

const VesselCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  padding-bottom: 8px;
`

const TwoCol = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`

function ReadOnlyField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div>
      <ReadOnlyLabel>{label}</ReadOnlyLabel>
      <ReadOnlyValue>{children}</ReadOnlyValue>
    </div>
  )
}

const ReadOnlyLabel = styled.p`
  color: ${p => p.theme.color.slateGray};
  margin: 0 0 2px;
`

const ReadOnlyValue = styled.p`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  margin: 0;
  font-weight: 500;
`

const ArchivedMessage = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin: 4px 0 0;
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

  div > .Element-Fieldset {
    margin-top: 16px;
  }

  > .Field-MultiRadio > legend {
    margin-bottom: 8px;
  }
`
