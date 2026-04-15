import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { OBSERVATION_TITLES, OTHER_OBSERVATION_TITLE } from '@features/Reporting/components/ReportingForm/constants'
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
  MultiRadio,
  Select
} from '@mtes-mct/monitor-ui'
import { getOptionsFromStrings } from '@utils/getOptionsFromStrings'
import { Form as FormikForm, type FormikErrors, useFormikContext } from 'formik'
import countries from 'i18n-iso-countries'
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

const DEBOUNCE_DELAY = 1000

type FormProps = Readonly<{
  className: string | undefined
  displayedErrorKey: DisplayedErrorKey
  hasWhiteBackground: boolean
  hideButtons?: boolean
  hideVesselSection?: boolean
  isEdition?: boolean
  isIUU: boolean
  onAutoSave?: ((values: FormEditedReporting) => void) | undefined
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
  onVesselStateChange?: ((vesselName: string | undefined, flagState: string | undefined) => void) | undefined
  submitRef?: MutableRefObject<(() => Promise<void>) | undefined> | undefined
}>
export function Form({
  className,
  displayedErrorKey,
  hasWhiteBackground,
  hideButtons = false,
  hideVesselSection = false,
  isEdition = false,
  isIUU,
  onAutoSave,
  onClose,
  onIsDirty,
  onVesselStateChange,
  submitRef
}: FormProps) {
  const { dirty, errors, isValid, setFieldValue, setValues, submitForm, values } =
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
  const [isVesselAbsent, setIsVesselAbsent] = useState(isEdition ? !selectedVessel : false)
  const isInfractionSuspicion = values.type === ReportingType.INFRACTION_SUSPICION
  const isStandardizedTitle = OBSERVATION_TITLES.includes(values.title ?? '')
  const [isTitleDisplayed, setIsTitleDisplayed] = useState(() =>
    getInitialTitleVisibility(isInfractionSuspicion, values.title, isStandardizedTitle)
  )

  function getInitialTitleVisibility(
    isInfraction: boolean,
    title: string | undefined,
    isStandardized: boolean
  ): boolean {
    if (isInfraction) {
      return true
    }

    if (!title) {
      return false
    }

    return !isStandardized
  }

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
      flagState: vessel.flagState ?? 'UNDEFINED',
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

  const handleObservationTypeSelect = (observationTitle: string | undefined) => {
    if (!observationTitle) {
      setFieldValue('title', undefined)
      setIsTitleDisplayed(false)

      return
    }

    if (observationTitle === OTHER_OBSERVATION_TITLE) {
      setFieldValue('title', '')
      setIsTitleDisplayed(true)

      return
    }

    setFieldValue('title', observationTitle)
    setIsTitleDisplayed(false)
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

  const isObservation = values.type === ReportingType.OBSERVATION
  const observationTypeValue = (() => {
    if (!values.title) {
      return undefined
    }

    if (!isStandardizedTitle) {
      return OTHER_OBSERVATION_TITLE
    }

    return values.title
  })()

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
        isRequired
        label="Source"
        name="reportingSource"
        onChange={source => updateReportingSource(source, setFieldValue)}
        options={getOptionsFromLabelledEnum(ReportingOriginSourceLabel)}
        value={values.reportingSource}
      />
      {values.reportingSource === ReportingOriginSource.UNIT && (
        <FormikSelect
          isLight={isLight}
          isRequired
          label="Choisir l'unité"
          name="controlUnitId"
          options={controlUnitsAsOptions}
          searchable
        />
      )}
      {values.reportingSource === ReportingOriginSource.SATELLITE && (
        <FormikSelect
          isLight={isLight}
          isRequired
          label="Type de cliché satellite"
          name="satelliteType"
          options={getOptionsFromLabelledEnum(SatelliteSourceLabel)}
        />
      )}
      {values.reportingSource === ReportingOriginSource.OTHER && (
        <FormikSelect
          isLight={isLight}
          isRequired
          label="Autres types de source"
          name="otherSourceType"
          options={getOptionsFromLabelledEnum(OtherSourceTypeLabel)}
        />
      )}
      {(values.reportingSource === ReportingOriginSource.UNIT ||
        values.reportingSource === ReportingOriginSource.OTHER) && (
        <FormikTextInput
          isLight={isLight}
          isRequired
          label="Identité de l’émetteur"
          name="authorContact"
          placeholder="Ex: Yannick Attal (06 24 25 01 91)"
        />
      )}
      {!hideVesselSection && <StyledHr $isLight={isLight} />}
      <FormikCoordinatesPicker isLight={isLight} isRequired={isIUU} />
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
              <TwoCol>
                <ReadOnlyField label="Nationalité">
                  {values.flagState ? countries.getName(values.flagState.toLowerCase(), 'fr') : '-'}
                </ReadOnlyField>
                <ReadOnlyField label="Longueur du navire">{values.length ?? '-'}</ReadOnlyField>
              </TwoCol>
              <TwoCol>
                <ReadOnlyField label="MMSI">{values.mmsi ?? '-'}</ReadOnlyField>
                <ReadOnlyField label="IMO">{values.imo ?? '-'}</ReadOnlyField>
              </TwoCol>
              <TwoCol>
                <ReadOnlyField label="IRCS (Call Sign)">{values.ircs ?? '-'}</ReadOnlyField>
                <ReadOnlyField label="Marquage extérieur">{values.externalMarker ?? '-'}</ReadOnlyField>
              </TwoCol>
              <FormikSelect
                isLight
                label="Engin"
                name="gearCode"
                options={gearsAsOptions ?? []}
                searchable
                virtualized
              />
              <FormikCheckbox isLight label="Navire en action de pêche" name="isFishing" />
            </VesselCard>
          )}
          {isVesselAbsent && (
            <VesselCard>
              <FormikTextInput isLight label="Nom" name="vesselName" readOnly={values.isUnknownVessel} />
              <TwoCol>
                <FormikSelect
                  isLight
                  label="Nationalité"
                  name="flagState"
                  options={COUNTRIES_AS_ALPHA2_OPTIONS}
                  searchable
                  virtualized
                />
                <FormikNumberInput isLight label="Longueur" name="length" readOnly={values.isUnknownVessel} />
              </TwoCol>
              <TwoCol>
                <FormikTextInput isLight label="MMSI" name="mmsi" readOnly={values.isUnknownVessel} />
                <FormikTextInput isLight label="IMO" name="imo" readOnly={values.isUnknownVessel} />
              </TwoCol>
              <TwoCol>
                <FormikTextInput isLight label="IRCS (Call Sign)" name="ircs" readOnly={values.isUnknownVessel} />
                <FormikTextInput
                  isLight
                  label="Marquage extérieur"
                  name="externalMarker"
                  readOnly={values.isUnknownVessel}
                />
              </TwoCol>
              <Checkbox
                checked={values.isUnknownVessel}
                isErrorMessageHidden
                isLight
                label="Navire inconnu"
                name="isUnknownVessel"
                onChange={isChecked => {
                  setFieldValue('isUnknownVessel', isChecked)
                }}
              />
              <FormikSelect
                isLight
                label="Engin"
                name="gearCode"
                options={gearsAsOptions ?? []}
                searchable
                virtualized
              />
              <FormikCheckbox isLight label="Navire en action de pêche" name="isFishing" />
            </VesselCard>
          )}
        </VesselSection>
      )}
      {!hideVesselSection && errors?.isUnknownVessel && (
        <FieldError>
          {isVesselAbsent
            ? 'Veuillez renseigner au moins un identifiant (nom, MMSI, IMO ou marquage extérieur) ou cocher la case "navire inconnu"'
            : 'Veuillez renseigner un navire ou cocher la case "navire absent de la base de données"'}
        </FieldError>
      )}
      {!hideVesselSection && <StyledHr $isLight={isLight} />}
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
      {isObservation && (
        <Select
          error={errors.title}
          isCleanable={false}
          isLight={isLight}
          isRequired
          label="Type"
          name="observationType"
          onChange={handleObservationTypeSelect}
          options={getOptionsFromStrings(OBSERVATION_TITLES)}
          value={observationTypeValue}
        />
      )}
      {isTitleDisplayed && (
        <FormikTextInput
          isLight={isLight}
          isRequired
          label="Titre"
          name="title"
          placeholder={isObservation ? 'Ex: Dérogation temporaire licence' : 'Ex: Infraction maille cul de chalut'}
        />
      )}

      <FormikTextarea
        isLight={isLight}
        label="Description"
        name="description"
        placeholder={
          isObservation
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
          placement="autoVertical"
          searchable
          value={isInfractionSuspicion && values.threatHierarchy ? [values.threatHierarchy] : undefined}
        />
      )}
      <TwoCol>
        <FormikDatePicker
          baseContainer={formRef.current as unknown as HTMLDivElement}
          isCalendarTop
          isLight={isLight}
          isRequired
          isStringDate
          label="Date et heure"
          name="reportingDate"
          withTime
        />
        <FormikDatePicker
          baseContainer={formRef.current as unknown as HTMLDivElement}
          isCalendarTop
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
  margin-top: 24px;
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

const StyledHr = styled.hr<{ $isLight: boolean }>`
  background: ${p => (!p.$isLight ? p.theme.color.lightGray : p.theme.color.white)};
  height: 2px;
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
