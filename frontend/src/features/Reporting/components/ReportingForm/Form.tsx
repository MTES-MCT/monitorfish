import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { updateReportingSource } from '@features/Reporting/components/ReportingForm/utils'
import { mapControlUnitsToUniqueSortedIdsAsOptions } from '@features/Reporting/components/VesselReportings/CurrentReportingList/utils'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import {
  Accent,
  Button,
  Checkbox,
  CheckTreePicker,
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
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'

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
import {FormikCoordinatesPicker} from "@features/Reporting/components/ReportingForm/FormikCoordinatesPicker";

type FormProps = Readonly<{
  className: string | undefined
  displayedErrorKey: DisplayedErrorKey
  hasWhiteBackground: boolean
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
  vesselIdentity?: Vessel.VesselIdentity | undefined
}>
export function Form({ className, displayedErrorKey, hasWhiteBackground, onClose, onIsDirty, vesselIdentity }: FormProps) {
  const { dirty, errors, initialValues, setFieldValue, setValues, values } = useFormikContext<FormEditedReporting>()
  const formRef = useRef<HTMLFormElement | null>(null)
  const controlUnitsQuery = useGetControlUnitsQuery(undefined)
  const dispatch = useMainAppDispatch()
  const { gearsAsOptions } = useGetGearsAsOptions()

  const [selectedVessel, setSelectedVessel] = useState<Vessel.VesselIdentity | undefined>(() => {
    if (vesselIdentity) return vesselIdentity
    if (initialValues.vesselId && initialValues.vesselName) {
      return {
        beaconNumber: undefined,
        districtCode: undefined,
        externalReferenceNumber: initialValues.externalMarker,
        flagState: initialValues.flagState ?? '',
        internalReferenceNumber: initialValues.cfr,
        ircs: initialValues.ircs,
        mmsi: initialValues.mmsi,
        vesselId: initialValues.vesselId,
        vesselIdentifier: initialValues.vesselIdentifier,
        vesselLength: initialValues.length,
        vesselName: initialValues.vesselName
      }
    }
    return undefined
  })
  const [isVesselAbsent, setIsVesselAbsent] = useState(
    !vesselIdentity && !!initialValues.vesselName && !initialValues.vesselId
  )

  const threatCharacterizationOptions = useGetThreatCharacterizationAsTreeOptions(
    values.type === ReportingType.INFRACTION_SUSPICION && values.threatHierarchy ? [values.threatHierarchy] : undefined
  )

  const controlUnitsAsOptions = useMemo((): Option<number>[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedIdsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  const updateSource = updateReportingSource(setFieldValue)

  const handleVesselSelect = (vessel: Vessel.VesselIdentity | undefined) => {
    setSelectedVessel(vessel)
    if (!vessel) {
      setValues({
        ...values,
        cfr: undefined,
        externalMarker: undefined,
        flagState: '',
        ircs: undefined,
        length: undefined,
        mmsi: undefined,
        vesselId: undefined,
        vesselIdentifier: undefined,
        vesselName: undefined
      })
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
      setSelectedVessel(undefined)
      setValues({
        ...values,
        cfr: undefined,
        externalMarker: undefined,
        flagState: '',
        ircs: undefined,
        length: undefined,
        mmsi: undefined,
        vesselId: undefined,
        vesselIdentifier: undefined,
        vesselName: undefined
      })
    } else {
      setIsVesselAbsent(false)
    }
  }

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
      <MultiRadio
        isInline
        isLight={!hasWhiteBackground}
        label="Source"
        name="reportingSource"
        onChange={updateSource}
        options={getOptionsFromLabelledEnum(ReportingOriginSourceLabel)}
        value={values.reportingSource}
      />
      {values.reportingSource === ReportingOriginSource.UNIT && (
        <FormikSelect
          isLight={!hasWhiteBackground}
          label="Choisir l'unité"
          name="controlUnitId"
          options={controlUnitsAsOptions}
          searchable
        />
      )}
      {values.reportingSource === ReportingOriginSource.SATELLITE && (
        <FormikSelect
          isLight={!hasWhiteBackground}
          label="Type de cliché satellite"
          name="satelliteSource"
          options={getOptionsFromLabelledEnum(SatelliteSourceLabel)}
        />
      )}
      {(values.reportingSource === ReportingOriginSource.OTHER) && (
        <FormikSelect
          isLight={!hasWhiteBackground}
          label="Autres types de source"
          name="otherSourceType"
          options={getOptionsFromLabelledEnum(OtherSourceTypeLabel)}
        />
      )}
      {(values.reportingSource === ReportingOriginSource.UNIT ||
        values.reportingSource === ReportingOriginSource.OTHER) && (
        <FormikTextInput
          isLight={!hasWhiteBackground}
          label="Identité de l’émetteur"
          name="authorContact"
          placeholder="Ex: Yannick Attal (06 24 25 01 91)"
        />
      )}
      <StyledHr/>
      <FormikCoordinatesPicker isLight={!hasWhiteBackground}/>
      {vesselIdentity === undefined && (
        <>
          <StyledHr />
          {!isVesselAbsent && (
            <VesselSection>
              <VesselSearch
                displayedErrorKey={displayedErrorKey}
                onChange={handleVesselSelect}
                onVesselLinkClick={vessel => dispatch(showVessel(vessel, false))}
                shouldCloseOnClickOutside
                value={selectedVessel}
                withLastSearchResults
              />
              {!selectedVessel && (
                <Checkbox
                  checked={false}
                  label="Navire absent de la base de données"
                  name="isVesselAbsent"
                  onChange={handleAbsentToggle}
                />
              )}
              {selectedVessel && (
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
                    <FormikSelect isLight={!hasWhiteBackground} label="Engin" name="gearCode" options={gearsAsOptions ?? []} />
                    <FormikNumberInput isLight={!hasWhiteBackground} label="Longueur" name="length" />
                  </TwoCol>
                  <FormikCheckbox label="Navire en action de pêche" name="isFishing" />
                </VesselCard>
              )}
            </VesselSection>
          )}
          {isVesselAbsent && (
            <>
              <Checkbox
                checked
                label="Navire absent de la base de données"
                name="isVesselAbsent"
                onChange={handleAbsentToggle}
              />
              <FormikTextInput isLight={!hasWhiteBackground} label="Nom du navire" name="vesselName" />
              <FormikTextInput isLight={!hasWhiteBackground} label="CFR" name="cfr" />
              <FormikTextInput isLight={!hasWhiteBackground} label="Marquage extérieur" name="externalMarker" />
              <FormikTextInput isLight={!hasWhiteBackground} label="IRCS" name="ircs" />
              <FormikTextInput isLight={!hasWhiteBackground} label="Pavillon" name="flagState" />
              <FormikSelect isLight={!hasWhiteBackground} label="Engin de pêche" name="gearCode" options={gearsAsOptions ?? []} />
              <FormikNumberInput isLight={!hasWhiteBackground} label="Longueur" name="length" />
              <FormikCheckbox label="En pêche" name="isFishing" />
            </>
          )}
        </>
      )}
      <StyledHr />
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
          placement={"top"}
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

const VesselSection = styled.div`
  background: ${p => p.theme.color.gainsboro};
  padding: 8px;
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
  gap: 12px;
  margin-top: 8px;
  padding: 12px;
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
  font-size: 11px;
  font-weight: 700;
  margin: 0 0 2px;
  text-transform: uppercase;
`

const ReadOnlyValue = styled.p`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  margin: 0;
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
