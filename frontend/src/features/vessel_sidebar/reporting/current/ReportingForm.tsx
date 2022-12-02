import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Input, Radio, RadioGroup, SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { ReportingOriginActor, ReportingTypeCharacteristics } from '../../../../domain/entities/reporting'
import { getOnlyVesselIdentityProperties } from '../../../../domain/entities/vessel/vessel'
import { addReporting } from '../../../../domain/use_cases/reporting/addReporting'
import { updateReporting } from '../../../../domain/use_cases/reporting/updateReporting'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useSaveReportingInLocalStorage } from '../../../../hooks/useSaveInLocalStorage'
import { getLocalStorageState } from '../../../../utils'
import { PrimaryButton, SecondaryButton } from '../../../commonStyles/Buttons.style'
import { sortArrayByColumn } from '../../../vessel_list/tableSort'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { Reporting, ReportingUpdate, ReportingType } from '../../../../domain/types/reporting'

type ReportingFormProps = {
  closeForm: () => void
  editedReporting: Reporting | undefined
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
  const reportingLocalStorageKey = fromSideWindow ? 'side-window-reporting-in-edit' : 'reporting-in-edit'

  const dispatch = useAppDispatch()
  const unitSelectRef = useRef() as MutableRefObject<HTMLDivElement>
  const natinfSelectRef = useRef() as MutableRefObject<HTMLDivElement>
  const infractions = useAppSelector(state => state.infraction.infractions)
  const controllers = useAppSelector(state => state.controls.controllers)

  const [reportingType, setReportingType] = useState<ReportingType>(
    ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
  )
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'type', reportingType, false)
  const [unit, setUnit] = useState<string | null>('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'unit', unit, true)
  const [authorTrigram, setAuthorTrigram] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'authorTrigram', authorTrigram, true)
  const [authorContact, setAuthorContact] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'authorContact', authorContact, true)
  const [reportingActor, setReportingActor] = useState(ReportingOriginActor.OPS.code)
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'reportingActor', reportingActor, true)
  const [title, setTitle] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'title', title, true)
  const [natinfCode, setNatinfCode] = useState<string | null>('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'natinfCode', natinfCode, true)
  const [description, setDescription] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'description', description, true)
  const [errorFields, setErrorFields] = useState<string[]>([])
  const previousReportingType = useRef() as MutableRefObject<ReportingType>

  function fillForm(editedOrSavedReporting) {
    setErrorFields([])
    setReportingType(editedOrSavedReporting.type || ReportingTypeCharacteristics.INFRACTION_SUSPICION.code)
    setUnit(editedOrSavedReporting.value.unit || '')
    setAuthorTrigram(editedOrSavedReporting.value.authorTrigram || '')
    setAuthorContact(editedOrSavedReporting.value.authorContact || '')
    setReportingActor(editedOrSavedReporting.value.reportingActor || ReportingOriginActor.OPS.code)
    setTitle(editedOrSavedReporting.value.title || '')
    setNatinfCode(editedOrSavedReporting.value.natinfCode || '')
    setDescription(editedOrSavedReporting.value.description || '')
  }

  const deleteLocalStorageReportingEntry = useCallback(
    () => window.localStorage.removeItem(reportingLocalStorageKey),
    [reportingLocalStorageKey]
  )

  useEffect(() => {
    if (editedReporting) {
      fillForm(editedReporting)
      previousReportingType.current = editedReporting.type

      return
    }

    const savedReporting = getLocalStorageState(null, reportingLocalStorageKey)
    if (savedReporting) {
      fillForm(savedReporting)
    }
  }, [editedReporting, reportingLocalStorageKey])

  useEffect(() => {
    if (reportingType === ReportingTypeCharacteristics.OBSERVATION.code) {
      setNatinfCode('')
    }
  }, [reportingType])

  function checkErrors(reportingValue) {
    const {
      authorContact: authorContactField,
      authorTrigram: authorTrigramField,
      reportingActor: reportingActorField,
      title: titleField,
      unit: unitField
    } = reportingValue

    let nextErrorsFields: string[] = []

    if (!titleField) {
      nextErrorsFields = nextErrorsFields.concat('title')
    }

    switch (reportingActorField) {
      case ReportingOriginActor.OPS.code: {
        if (!authorTrigramField) {
          nextErrorsFields = nextErrorsFields.concat('authorTrigram')
        }
        break
      }
      case ReportingOriginActor.SIP.code: {
        if (!authorTrigramField) {
          nextErrorsFields = nextErrorsFields.concat('authorTrigram')
        }
        break
      }
      case ReportingOriginActor.UNIT.code: {
        if (!unitField) {
          nextErrorsFields = nextErrorsFields.concat('unit')
        }
        break
      }
      case ReportingOriginActor.DML.code: {
        if (!authorContactField) {
          nextErrorsFields = nextErrorsFields.concat('authorContact')
        }
        break
      }
      case ReportingOriginActor.DIRM.code: {
        if (!authorContactField) {
          nextErrorsFields = nextErrorsFields.concat('authorContact')
        }
        break
      }
      case ReportingOriginActor.OTHER.code: {
        if (!authorContactField) {
          nextErrorsFields = nextErrorsFields.concat('authorContact')
        }
        break
      }
      default:
        throw Error('Should not happen')
    }

    setErrorFields(nextErrorsFields)

    return !!nextErrorsFields.length
  }

  const editReporting = useCallback(
    (editedReportingId: number, nextReportingValue: ReportingUpdate) => {
      if (editedReporting) {
        // TODO Fix the use-case dispatch type
        dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReportingId,
            nextReportingValue,
            previousReportingType.current
          ) as any
        ).then(() => {
          closeForm()
          deleteLocalStorageReportingEntry()
        })
      }
    },
    [dispatch, closeForm, deleteLocalStorageReportingEntry, editedReporting]
  )

  const createReporting = useCallback(
    nextReporting => {
      const nextReportingWithMissingProperties = {
        ...nextReporting,
        creationDate: new Date().toISOString(),
        externalReferenceNumber: selectedVesselIdentity?.externalReferenceNumber,
        internalReferenceNumber: selectedVesselIdentity?.internalReferenceNumber,
        ircs: selectedVesselIdentity?.ircs,
        validationDate: null,
        value: {
          ...nextReporting.value,
          flagState: selectedVesselIdentity?.flagState?.toUpperCase(),
          type: nextReporting.type
        },
        vesselIdentifier: selectedVesselIdentity?.vesselIdentifier,
        vesselInternalId: selectedVesselIdentity?.vesselInternalId,
        vesselName: selectedVesselIdentity?.vesselName
      }

      dispatch(addReporting(nextReportingWithMissingProperties) as any).then(() => {
        closeForm()
        deleteLocalStorageReportingEntry()
      })
    },
    [dispatch, selectedVesselIdentity, closeForm, deleteLocalStorageReportingEntry]
  )

  const createOrEditReporting = useCallback(
    (_reportingType: ReportingType, reportingValue: ReportingUpdate) => {
      const hasErrors = checkErrors(reportingValue)
      if (hasErrors) {
        return
      }

      const nextReporting = {
        type: _reportingType,
        value: reportingValue
      }

      if (editedReporting) {
        editReporting(parseInt(editedReporting.id, 10), nextReporting.value)

        return
      }

      createReporting(nextReporting)
    },
    [editedReporting, editReporting, createReporting]
  )

  function updateReportingActor(nextReportingActor) {
    setReportingActor(nextReportingActor)

    switch (nextReportingActor) {
      case ReportingOriginActor.OPS.code: {
        setUnit('')
        setAuthorContact('')
        break
      }
      case ReportingOriginActor.SIP.code: {
        setUnit('')
        setAuthorContact('')
        break
      }
      case ReportingOriginActor.UNIT.code: {
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.DML.code: {
        setUnit('')
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.DIRM.code: {
        setUnit('')
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.OTHER.code: {
        setUnit('')
        setAuthorTrigram('')
        break
      }
      default:
        throw Error('Should not happen')
    }
  }

  return (
    <Form hasWhiteBackground={hasWhiteBackground}>
      <Label>Origine</Label>
      <RadioGroup
        appearance="picker"
        defaultValue={ReportingOriginActor.OPS.code}
        inline
        onChange={value => updateReportingActor(value)}
        value={reportingActor}
      >
        {Object.entries(ReportingOriginActor).map(([key, val]) => (
          <Radio key={key} data-cy={`new-reporting-reporting-actor-${key}`} value={key}>
            {val.name}
          </Radio>
        ))}
      </RadioGroup>
      {reportingActor === ReportingOriginActor.UNIT.code && (
        <>
          <Label>Nom de l&apos;unité</Label>
          <SelectPicker
            container={fromSideWindow ? () => unitSelectRef.current : undefined}
            data={controllers
              ?.map(controller => ({
                label: `${controller.controller} (${controller.administration})`,
                value: controller.controller
              }))
              .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))}
            data-cy="new-reporting-select-unit"
            menuStyle={fromSideWindow ? { marginLeft: 40, marginTop: 270, position: 'absolute' } : undefined}
            onChange={_unit => setUnit(_unit)}
            placeholder="Choisir l'unité"
            searchable
            style={{ margin: '0px 10px 10px 0px', width: unit ? 250 : 80 }}
            value={unit}
          />
          <div ref={unitSelectRef} />
        </>
      )}
      {(reportingActor === ReportingOriginActor.OPS.code || reportingActor === ReportingOriginActor.SIP.code) && (
        <>
          <Label>Identité de l&apos;émetteur (trigramme)</Label>
          <StyledInput
            $hasWhiteBackground={hasWhiteBackground}
            data-cy=""
            onChange={value => setAuthorTrigram(value)}
            placeholder="Ex: LTH"
            type="text"
            value={authorTrigram}
            width={100}
          />
        </>
      )}
      {(reportingActor === ReportingOriginActor.UNIT.code ||
        reportingActor === ReportingOriginActor.DML.code ||
        reportingActor === ReportingOriginActor.DIRM.code ||
        reportingActor === ReportingOriginActor.OTHER.code) && (
        <>
          <Label>Nom et contact (numéro, mail…) de l&apos;émetteur</Label>
          <StyledInput
            $hasWhiteBackground={hasWhiteBackground}
            data-cy="new-reporting-author-contact"
            onChange={value => setAuthorContact(value)}
            placeholder="Ex: Yannick Attal (06 24 25 01 91)"
            type="text"
            value={authorContact}
            width={230}
          />
        </>
      )}
      <Label>Type</Label>
      <RadioGroup
        appearance="picker"
        defaultValue={ReportingTypeCharacteristics.INFRACTION_SUSPICION.code}
        inline
        onChange={value => setReportingType(value as ReportingType)}
        value={reportingType}
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
      <Label>Titre</Label>
      <StyledInput
        $hasError={errorFields.includes('title')}
        $hasWhiteBackground={hasWhiteBackground}
        data-cy="new-reporting-title"
        onChange={value => setTitle(value)}
        placeholder={
          reportingType === ReportingTypeCharacteristics.OBSERVATION.code
            ? 'Ex: Dérogation temporaire licence'
            : 'Ex: Infraction maille cul de chalut'
        }
        type="text"
        value={title}
        width={390}
      />
      <Label>Description</Label>
      <DescriptionTextarea
        as="textarea"
        data-cy="new-reporting-description"
        hasWhiteBackground={hasWhiteBackground}
        onChange={e => setDescription(e.target.value)}
        placeholder={
          reportingType === ReportingTypeCharacteristics.OBSERVATION.code
            ? "Ex: Licence en cours de renouvellement, dérogation accordée par la DML jusqu'au 01/08/2022."
            : 'Ex: Infraction constatée sur la taille de la maille en cul de chalut'
        }
        rows={3}
        value={description}
      />
      {reportingType === ReportingTypeCharacteristics.INFRACTION_SUSPICION.code && (
        <>
          <Label>NATINF</Label>
          <SelectPicker
            container={fromSideWindow ? () => natinfSelectRef.current : undefined}
            data={infractions
              ?.map(infraction => ({
                label: `${infraction.natinfCode} - ${infraction.infraction}`,
                value: infraction.natinfCode
              }))
              .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))}
            data-cy="new-reporting-select-natinf"
            menuStyle={
              fromSideWindow
                ? {
                    marginLeft: -150,
                    marginTop: reportingActor === ReportingOriginActor.UNIT.code ? 685 : 610,
                    position: 'absolute'
                  }
                : undefined
            }
            onChange={natinf => setNatinfCode(natinf)}
            placeholder="Natinf"
            placement={!fromSideWindow ? 'topStart' : undefined}
            searchable
            style={{ margin: '10px 0px 0px 0px', width: natinfCode ? 335 : 70 }}
            // @ts-ignore
            title={infractions?.find(infraction => infraction.natinfCode === natinfCode)?.infraction || ''}
            value={natinfCode}
            virtualized={false}
          />
          <div ref={natinfSelectRef} />
        </>
      )}
      <ValidateButton
        data-cy="new-reporting-create-button"
        onClick={() =>
          createOrEditReporting(reportingType, {
            authorContact,
            authorTrigram,
            description,
            natinfCode,
            reportingActor,
            reportingType,
            title,
            unit
          })
        }
      >
        Valider
      </ValidateButton>
      <CancelButton
        onClick={() => {
          closeForm()
          deleteLocalStorageReportingEntry()
        }}
      >
        Annuler
      </CancelButton>
      {errorFields.includes('title') && (
        <>
          <br />
          Le champ “Titre” est obligatoire.
        </>
      )}
      {errorFields.includes('authorTrigram') && (
        <>
          <br />
          Le champ “Identité de l&apos;émetteur” est obligatoire.
        </>
      )}
      {errorFields.includes('unit') && (
        <>
          <br />
          Le champ “Nom de l&apos;unité” est obligatoire.
        </>
      )}
      {errorFields.includes('authorContact') && (
        <>
          <br />
          Le champ “Nom et contact de l&apos;émetteur” est obligatoire.
        </>
      )}
    </Form>
  )
}

const DescriptionTextarea = styled(Input)<{
  hasWhiteBackground: boolean
}>`
  margin: 5px 0px 10px 0px;
  max-height: 150px;
  width: 100%;
  background: ${p => (p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white)};
`

const ValidateButton = styled(PrimaryButton)`
  margin: 20px 10px 0px 0px;
`

const CancelButton = styled(SecondaryButton)`
  margin: 20px 0px 0px 0px;
  padding-top: 4px;
`

const Label = styled.div`
  margin-top: 10px;
`

const StyledInput = styled(Input)<{
  $hasWhiteBackground: boolean
}>`
  margin: 5px 0px 10px 0px;
  width: ${props => props.width}px;
  border: 1px solid ${props => (props.$hasError ? COLORS.maximumRed : 'unset')};
  background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)};
`

const Form = styled.div<{
  hasWhiteBackground: boolean
}>`
  margin: 15px;
  flex-direction: column;
  .rs-picker-toggle {
    background: ${p => (p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }

  .rs-radio-group {
    margin-top: 5px;
    margin-bottom: 5px;
    background: ${p => (p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white)} !important;
  }
`
