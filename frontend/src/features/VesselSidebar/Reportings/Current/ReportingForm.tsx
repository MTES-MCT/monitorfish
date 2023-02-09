import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Input, Radio, RadioGroup, SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { getReportingValueErrors, mapControlUnitsToUniqueSortedIdsAsOptions } from './utils'
import { useGetControlUnitsQuery } from '../../../../api/controlUnit'
import { COLORS } from '../../../../constants/constants'
import { ReportingOriginActor, ReportingTypeCharacteristics } from '../../../../domain/entities/reporting'
import { getOnlyVesselIdentityProperties } from '../../../../domain/entities/vessel/vessel'
import { addReporting } from '../../../../domain/use_cases/reporting/addReporting'
import { updateReporting } from '../../../../domain/use_cases/reporting/updateReporting'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { PrimaryButton, SecondaryButton } from '../../../commonStyles/Buttons.style'
import { sortArrayByColumn } from '../../../VesselList/tableSort'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { Reporting, ReportingCreation, ReportingType, ReportingUpdate } from '../../../../domain/types/reporting'
import type { Option } from '@mtes-mct/monitor-ui'

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
  const dispatch = useMainAppDispatch()
  const unitSelectRef = useRef() as MutableRefObject<HTMLDivElement>
  const natinfSelectRef = useRef() as MutableRefObject<HTMLDivElement>
  const infractions = useMainAppSelector(state => state.infraction.infractions)
  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const controlUnitsAsOptions = useMemo((): Option<number>[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedIdsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  const [reportingType, setReportingType] = useState<ReportingType>(
    ReportingTypeCharacteristics.INFRACTION_SUSPICION.code
  )
  const [controlUnitId, setControlUnitId] = useState<number | null>(null)
  const [authorTrigram, setAuthorTrigram] = useState('')
  const [authorContact, setAuthorContact] = useState('')
  const [reportingActor, setReportingActor] = useState(ReportingOriginActor.OPS.code)
  const [title, setTitle] = useState('')
  const [natinfCode, setNatinfCode] = useState<string | null>('')
  const [description, setDescription] = useState('')
  const [errorFields, setErrorFields] = useState<string[]>([])
  const previousReportingType = useRef() as MutableRefObject<ReportingType>

  function fillForm(editedOrSavedReporting) {
    setErrorFields([])
    setReportingType(editedOrSavedReporting.type || ReportingTypeCharacteristics.INFRACTION_SUSPICION.code)
    setControlUnitId(editedOrSavedReporting.value.controlUnitId || null)
    setAuthorTrigram(editedOrSavedReporting.value.authorTrigram || '')
    setAuthorContact(editedOrSavedReporting.value.authorContact || '')
    setReportingActor(editedOrSavedReporting.value.reportingActor || ReportingOriginActor.OPS.code)
    setTitle(editedOrSavedReporting.value.title || '')
    setNatinfCode(editedOrSavedReporting.value.natinfCode || '')
    setDescription(editedOrSavedReporting.value.description || '')
  }

  useEffect(() => {
    if (editedReporting) {
      fillForm(editedReporting)
      previousReportingType.current = editedReporting.type

      return
    }

    // TODO use initialValues from Formik
    fillForm({
      type: undefined,
      value: {}
    })
  }, [editedReporting])

  useEffect(() => {
    if (reportingType === ReportingTypeCharacteristics.OBSERVATION.code) {
      setNatinfCode('')
    }
  }, [reportingType])

  function checkErrors(reportingValue) {
    const errors = getReportingValueErrors(reportingValue)
    setErrorFields(errors)

    return !!errors.length
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
        internalReferenceNumber: selectedVesselIdentity.internalReferenceNumber,
        ircs: selectedVesselIdentity.ircs,
        type: nextReporting.type,
        validationDate: null,
        value: {
          ...nextReporting.value,
          flagState: selectedVesselIdentity.flagState.toUpperCase()
        },
        vesselId: selectedVesselIdentity.vesselId || null,
        vesselIdentifier: selectedVesselIdentity.vesselIdentifier || null,
        vesselName: selectedVesselIdentity.vesselName || null
      }

      dispatch(addReporting(nextReportingWithMissingProperties)).then(() => {
        closeForm()
      })
    },
    [dispatch, selectedVesselIdentity, closeForm]
  )

  const createOrEditReporting = useCallback(
    (reportingValue: ReportingUpdate) => {
      const hasErrors = checkErrors(reportingValue)
      if (hasErrors) {
        return
      }

      const nextReporting = {
        type: reportingValue.type,
        value: reportingValue
      }

      if (editedReporting) {
        editReporting(editedReporting.id, nextReporting.value)

        return
      }

      createReporting(nextReporting as ReportingCreation)
    },
    [editedReporting, editReporting, createReporting]
  )

  function updateReportingActor(nextReportingActor) {
    setReportingActor(nextReportingActor)

    switch (nextReportingActor) {
      case ReportingOriginActor.OPS.code: {
        setControlUnitId(null)
        setAuthorContact('')
        break
      }
      case ReportingOriginActor.SIP.code: {
        setControlUnitId(null)
        setAuthorContact('')
        break
      }
      case ReportingOriginActor.UNIT.code: {
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.DML.code: {
        setControlUnitId(null)
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.DIRM.code: {
        setControlUnitId(null)
        setAuthorTrigram('')
        break
      }
      case ReportingOriginActor.OTHER.code: {
        setControlUnitId(null)
        setAuthorTrigram('')
        break
      }
      default:
        throw Error('Should not happen')
    }
  }

  return (
    <Form hasWhiteBackground={hasWhiteBackground}>
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
            container={(fromSideWindow ? () => unitSelectRef.current : undefined) as any}
            data={controlUnitsAsOptions}
            data-cy="new-reporting-select-unit"
            menuStyle={fromSideWindow ? { marginLeft: 40, marginTop: 270, position: 'absolute' } : {}}
            onChange={_unit => setControlUnitId(Number(_unit))}
            placeholder="Choisir l'unité"
            searchable
            style={{ margin: '5px 10px 0px 0px', width: controlUnitId ? 250 : 80 }}
            value={controlUnitId}
          />
          <div ref={unitSelectRef} />
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
            style={{ margin: '5px 0px 0px 0px', width: natinfCode ? 335 : 70 }}
            // @ts-ignore
            title={infractions?.find(infraction => infraction.natinfCode === natinfCode)?.infraction || ''}
            value={natinfCode}
            virtualized={false}
          />
          <div ref={natinfSelectRef} />
        </>
      )}
      <>
        <Label>Saisi par</Label>
        <StyledInput
          $hasWhiteBackground={hasWhiteBackground}
          data-cy="new-reporting-author-trigram"
          onChange={value => setAuthorTrigram(value)}
          placeholder="Ex: LTH"
          type="text"
          value={authorTrigram}
          width={100}
        />
      </>
      <ValidateButton
        data-cy="new-reporting-create-button"
        onClick={() =>
          createOrEditReporting({
            authorContact,
            authorTrigram,
            controlUnitId,
            description,
            natinfCode,
            reportingActor,
            title,
            type: reportingType
          })
        }
      >
        Valider
      </ValidateButton>
      <CancelButton
        onClick={() => {
          closeForm()
        }}
      >
        Annuler
      </CancelButton>
      {!!errorFields.length && <br />}
      {errorFields.includes('title') && `Le champ “Titre” est obligatoire.`}
      {errorFields.includes('authorTrigram') && `Le champ “Saisi par” est obligatoire.`}
      {errorFields.includes('controlUnitId') && `Le champ “Nom de l&apos;unité” est obligatoire.`}
      {errorFields.includes('authorContact') && `Le champ “Nom et contact de l&apos;émetteur” est obligatoire.`}
    </Form>
  )
}

const DescriptionTextarea = styled(Input)<{
  hasWhiteBackground: boolean
}>`
  border: unset;
  margin: 5px 0px 0px 0px;
  max-height: 150px;
  width: 390px;
  background: ${p => (p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white)};
`

const ValidateButton = styled(PrimaryButton)`
  margin: 10px 10px 0px 0px;
`

const CancelButton = styled(SecondaryButton)`
  margin: 10px 0px 0px 0px;
  padding-top: 4px;
`

const Label = styled.div`
  margin-top: 10px;
  font-size: 12px;
`

const StyledInput = styled(Input)<{
  $hasWhiteBackground: boolean
}>`
  margin: 5px 0px 10px 0px;
  width: ${props => props.width}px;
  border: ${props => (props.$hasError ? `1px solid ${COLORS.maximumRed}` : 'unset')};
  background: ${p => (p.$hasWhiteBackground ? COLORS.gainsboro : COLORS.white)};
`

const Form = styled.div<{
  hasWhiteBackground: boolean
}>`
  margin: 16px;
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
