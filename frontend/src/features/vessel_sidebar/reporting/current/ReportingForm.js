import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Input, Radio, RadioGroup, SelectPicker } from 'rsuite'
import { FrenchDMLs, ReportingOriginActor, ReportingType } from '../../../../domain/entities/reporting'
import { PrimaryButton, SecondaryButton } from '../../../commonStyles/Buttons.style'
import { sortArrayByColumn } from '../../../vessel_list/tableSort'
import { useDispatch, useSelector } from 'react-redux'
import { getLocalStorageState } from '../../../../utils'
import { useSaveReportingInLocalStorage } from '../../../../hooks/useSaveInLocalStorage'
import addReporting from '../../../../domain/use_cases/reporting/addReporting'
import updateReporting from '../../../../domain/use_cases/reporting/updateReporting'

const ReportingForm = ({ selectedVesselIdentity, closeForm, fromSideWindow, editedReporting, hasWhiteBackground }) => {
  const reportingLocalStorageKey = fromSideWindow ? 'side-window-reporting-in-edit' : 'reporting-in-edit'

  const dispatch = useDispatch()
  const unitSelectRef = useRef()
  const natinfSelectRef = useRef()
  const dmlSelectRef = useRef()
  const infractions = useSelector(state => state.infraction.infractions)
  const controllers = useSelector(state => state.controls.controllers)

  const [reportingType, setReportingType] = useState(ReportingType.INFRACTION_SUSPICION.code)
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'type', reportingType, false)
  const [unit, setUnit] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'unit', unit, true)
  const [authorTrigram, setAuthorTrigram] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'authorTrigram', authorTrigram, true)
  const [authorContact, setAuthorContact] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'authorContact', authorContact, true)
  const [reportingActor, setReportingActor] = useState(ReportingOriginActor.OPS.code)
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'reportingActor', reportingActor, true)
  const [title, setTitle] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'title', title, true)
  const [natinfCode, setNatinfCode] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'natinfCode', natinfCode, true)
  const [dml, setDml] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'dml', dml, true)
  const [description, setDescription] = useState('')
  useSaveReportingInLocalStorage(reportingLocalStorageKey, 'description', description, true)
  const [errorFields, setErrorFields] = useState([])

  function fillForm (editedOrSavedReporting) {
    setErrorFields([])
    setReportingType(editedOrSavedReporting.type || ReportingType.INFRACTION_SUSPICION.code)
    setUnit(editedOrSavedReporting.value?.unit || '')
    setAuthorTrigram(editedOrSavedReporting.value?.authorTrigram || '')
    setAuthorContact(editedOrSavedReporting.value?.authorContact || '')
    setReportingActor(editedOrSavedReporting.value?.reportingActor || ReportingOriginActor.OPS.code)
    setTitle(editedOrSavedReporting.value?.title || '')
    setNatinfCode(editedOrSavedReporting.value?.natinfCode || '')
    setDml(editedOrSavedReporting.value?.dml || '')
    setDescription(editedOrSavedReporting.value?.description || '')
  }

  useEffect(() => {
    if (editedReporting) {
      fillForm(editedReporting)
      return
    }

    const savedReporting = getLocalStorageState(null, reportingLocalStorageKey)
    if (savedReporting) {
      fillForm(savedReporting)
    }
  }, [editedReporting])

  useEffect(() => {
    switch (reportingType) {
      case ReportingType.OBSERVATION.code: {
        setNatinfCode('')
        setDml('')
      }
    }
  }, [reportingType])

  function checkErrors () {
    let nextErrorsFields = []

    if (!title) {
      nextErrorsFields = nextErrorsFields.concat("title")
    }

    switch (reportingActor) {
      case ReportingOriginActor.OPS.code: {
        if(!authorTrigram) {
          nextErrorsFields = nextErrorsFields.concat("authorTrigram")
        }
        break
      }
      case ReportingOriginActor.SIP.code: {
        if(!authorTrigram) {
          nextErrorsFields = nextErrorsFields.concat("authorTrigram")
        }
        break
      }
      case ReportingOriginActor.UNIT.code: {
        if(!unit) {
          nextErrorsFields = nextErrorsFields.concat("unit")
        }
        break
      }
      case ReportingOriginActor.DML.code: {
        if(!authorContact) {
          nextErrorsFields = nextErrorsFields.concat("authorContact")
        }
        break
      }
      case ReportingOriginActor.DIRM.code: {
        if(!authorContact) {
          nextErrorsFields = nextErrorsFields.concat("authorContact")
        }
        break
      }
      case ReportingOriginActor.OTHER.code: {
        if(!authorContact) {
          nextErrorsFields = nextErrorsFields.concat("authorContact")
        }
        break
      }
    }

    setErrorFields(nextErrorsFields)
    return !!nextErrorsFields.length
  }

  function createOrEditReporting () {
    const hasErrors = checkErrors()
    if (hasErrors) {
      return
    }

    let nextReporting = {
      type: reportingType,
      value: {
        unit: unit,
        authorTrigram: authorTrigram,
        authorContact: authorContact,
        reportingActor: reportingActor,
        title: title,
        natinfCode: natinfCode,
        dml: dml,
        description: description
      }
    }

    if (editedReporting) {
      editReporting(editedReporting, nextReporting)
      return
    }

    createReporting(nextReporting)
  }

  function editReporting (editedReporting, nextReporting) {
    dispatch(updateReporting(editedReporting.id, nextReporting.value))
      .then(() => {
        closeForm()
        deleteLocalStorageReportingEntry()
      })
      .catch(console.error)
  }

  function createReporting (nextReporting) {
    nextReporting = {
      ...nextReporting,
      creationDate: new Date().toISOString(),
      validationDate: null,
      vesselName: selectedVesselIdentity?.vesselName,
      internalReferenceNumber: selectedVesselIdentity?.internalReferenceNumber,
      externalReferenceNumber: selectedVesselIdentity?.externalReferenceNumber,
      ircs: selectedVesselIdentity?.ircs,
      vesselIdentifier: selectedVesselIdentity?.vesselIdentifier,
      value: {
        ...nextReporting.value,
        type: reportingType,
        flagState: selectedVesselIdentity?.flagState.toUpperCase()
      }
    }

    dispatch(addReporting(nextReporting))
      .then(() => {
        closeForm()
        deleteLocalStorageReportingEntry()
      })
      .catch(console.error)
  }

  function updateReportingActor (nextReportingActor) {
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
    }
  }

  const deleteLocalStorageReportingEntry = () => window.localStorage.setItem(reportingLocalStorageKey, null)

  return <Form hasWhiteBackground={hasWhiteBackground}>
    <Label>Origine</Label>
    <RadioGroup
      inline
      appearance="picker"
      value={reportingActor}
      onChange={value => updateReportingActor(value)}
      defaultValue={ReportingOriginActor.OPS.code}
    >
      {
        Object.entries(ReportingOriginActor).map(([key, val]) =>
          <Radio data-cy={`new-reporting-reporting-actor-${key}`} key={key} value={key}>{val.name}</Radio>)
      }
    </RadioGroup>
    {
      reportingActor === ReportingOriginActor.UNIT.code
        ? <>
          <Label>Nom de l&apos;unité</Label>
          <SelectPicker
            container={fromSideWindow ? () => unitSelectRef.current : undefined}
            menuStyle={fromSideWindow ? { position: 'absolute', marginTop: 270, marginLeft: 40 } : undefined}
            data-cy={'new-reporting-select-unit'}
            style={{ width: unit ? 250 : 80, margin: '0px 10px 10px 10px' }}
            searchable={true}
            placeholder="Choisir l'unité"
            value={unit}
            onChange={_unit => setUnit(_unit)}
            data={controllers
              ?.map(controller => ({ label: `${controller.controller} (${controller.administration})`, value: controller.controller }))
              .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
            }
          />
          <div ref={unitSelectRef} />
        </>
        : null
    }
    {
      reportingActor === ReportingOriginActor.OPS.code || reportingActor === ReportingOriginActor.SIP.code
        ? <>
          <Label>Identité de l&apos;émetteur (trigramme)</Label>
          <StyledInput
            hasWhiteBackground={hasWhiteBackground}
            data-cy={''}
            width={100}
            placeholder={'Ex: LTH'}
            type="text"
            value={authorTrigram}
            onChange={(value, _) => setAuthorTrigram(value)}
          />
          </>
        : null
    }
    {
      reportingActor === ReportingOriginActor.DML.code
        ? <></>
        : null
    }
    {
      reportingActor === ReportingOriginActor.UNIT.code ||
      reportingActor === ReportingOriginActor.DML.code ||
      reportingActor === ReportingOriginActor.DIRM.code ||
      reportingActor === ReportingOriginActor.OTHER.code
        ? <>
          <Label>Nom et contact (numéro, mail…) de l&apos;émetteur</Label>
          <StyledInput
            data-cy={'new-reporting-author-contact'}
            hasWhiteBackground={hasWhiteBackground}
            width={230}
            placeholder={'Ex: Yannick Attal (06 24 25 01 91)'}
            type="text"
            value={authorContact}
            onChange={(value, _) => setAuthorContact(value)}
          />
        </>
        : null
    }
    <Label>Type</Label>
    <RadioGroup
      disabled={editedReporting}
      appearance="picker"
      inline
      value={reportingType}
      onChange={value => setReportingType(value)}
      defaultValue={ReportingType.INFRACTION_SUSPICION.code}
    >
      <Radio
        key={ReportingType.INFRACTION_SUSPICION.code}
        value={ReportingType.INFRACTION_SUSPICION.code}
      >
        {ReportingType.INFRACTION_SUSPICION.inputName}
      </Radio>
      <Radio
        key={ReportingType.OBSERVATION.code}
        value={ReportingType.OBSERVATION.code}
      >
        {ReportingType.OBSERVATION.inputName}
      </Radio>
    </RadioGroup>
    <Label>Titre</Label>
    <StyledInput
      data-cy={'new-reporting-title'}
      hasWhiteBackground={hasWhiteBackground}
      placeholder={reportingType === ReportingType.OBSERVATION.code
        ? 'Ex: Dérogation temporaire licence'
        : 'Ex: Infraction maille cul de chalut'
      }
      $hasError={errorFields.includes('title')}
      width={390}
      type="text"
      value={title}
      onChange={(value, _) => setTitle(value)}
    />
    <Label>Description</Label>
    <DescriptionTextarea
      as="textarea"
      hasWhiteBackground={hasWhiteBackground}
      rows={3}
      data-cy={'new-reporting-description'}
      placeholder={reportingType === ReportingType.OBSERVATION.code
        ? 'Ex: Licence en cours de renouvellement, dérogation accordée par la DML jusqu\'au 01/08/2022.'
        : 'Ex: Infraction constatée sur la taille de la maille en cul de chalut'
      }
      value={description}
      onChange={e => setDescription(e.target.value)}
    />
    {
      reportingType === ReportingType.INFRACTION_SUSPICION.code
        ? <>
        <Label>NATINF</Label>
        <SelectPicker
          container={fromSideWindow ? () => natinfSelectRef.current : undefined}
          menuStyle={fromSideWindow
            ? { position: 'absolute', marginTop: reportingActor === ReportingOriginActor.UNIT.code ? 685 : 610, marginLeft: -150 }
            : undefined
          }
          title={infractions?.find(infraction => infraction.natinfCode === natinfCode)?.infraction}
          data-cy={'new-reporting-select-natinf'}
          style={{ width: natinfCode ? 335 : 70, margin: '0px 10px 10px 10px' }}
          searchable={true}
          virtualized={false}
          placement={!fromSideWindow  ? 'topLeft' : undefined}
          placeholder="Natinf"
          value={natinfCode}
          onChange={natinf => setNatinfCode(natinf)}
          data={infractions
            ?.map(infraction => ({ label: `${infraction.natinfCode} - ${infraction.infraction}`, value: infraction.natinfCode }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
        />
        <div ref={natinfSelectRef} />
        <Label>DML concernée</Label>
        <SelectPicker
          data-cy={'new-reporting-select-dml'}
          container={fromSideWindow ? () => dmlSelectRef.current : undefined}
          menuStyle={fromSideWindow ? { position: 'absolute', marginTop: reportingActor === ReportingOriginActor.UNIT.code ? 765 : 685, marginLeft: 40 } : undefined}
          style={{ width: 70, margin: '0px 10px 10px 10px' }}
          searchable={true}
          placement={!fromSideWindow  ? 'topLeft' : undefined}
          placeholder="DML"
          value={dml}
          onChange={_dml => setDml(_dml)}
          data={FrenchDMLs
            ?.map(dml => ({ label: dml, value: dml }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
        />
        <div ref={dmlSelectRef} />
        </>
        : null
    }<br/>
    <ValidateButton
      data-cy={'new-reporting-create-button'}
      onClick={createOrEditReporting}
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
    {errorFields.includes('title') && <><br/>Le champ "Titre" est obligatoire.</>}
    {errorFields.includes('authorTrigram') && <><br/>Le champ "Identité de l&apos;émetteur" est obligatoire.</>}
    {errorFields.includes('unit') && <><br/>Le champ "Nom de l&apos;unité" est obligatoire.</>}
    {errorFields.includes('authorContact') && <><br/>Le champ "Nom et contact de l&apos;émetteur" est obligatoire.</>}
  </Form>
}

const DescriptionTextarea = styled(Input)`
  margin: 5px 0px 10px 0px;
  max-height: 150px;
  width: 100%;
  background: ${p => p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white };
`

const ValidateButton = styled(PrimaryButton)`
  margin: 20px 10px 0px 0px;
`

const CancelButton = styled(SecondaryButton)`
  margin: 20px 0px 0px 0px;
  padding-top: 4px;
`

const Label = styled.div`
  margin-top: 10px
`

const StyledInput = styled(Input)`
  margin: 5px 0px 10px 0px;
  width: ${props => props.width}px;
  border: 1px solid ${props => props.$hasError ? COLORS.maximumRed : 'unset'};
  background: ${p => p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white };
`

const Form = styled.div`
  margin: 15px;
  flex-direction: column;
  .rs-picker-toggle {
    background: ${p => p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white } !important;
  }

  .rs-radio-group {
    margin-top: 5px;
    margin-bottom: 5px;
    background: ${p => p.hasWhiteBackground ? COLORS.gainsboro : COLORS.white } !important;
  }

  .rs-picker-select {
    margin: 5px 0 10px 0 !important;
  }
`

export default ReportingForm
