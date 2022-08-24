import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Radio, RadioGroup, SelectPicker } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { FrenchDMLs, ReportingOriginActor, ReportingType } from '../../../../domain/entities/reporting'
import { getLocalStorageState } from '../../../../utils'
import { PrimaryButton, SecondaryButton } from '../../../commonStyles/Buttons.style'
import { sortArrayByColumn } from '../../../vessel_list/tableSort'
import { useSaveReportingInLocalStorage } from './useSaveInLocalStorage'
import addReporting from '../../../../domain/use_cases/reporting/addReporting'

const newReportingLocalStorageKey = 'new-reporting'
function NewReportingForm({ closeForm, selectedVesselIdentity }) {
  const dispatch = useDispatch()
  const infractions = useSelector(state => state.infraction.infractions)
  const controllers = useSelector(state => state.controls.controllers)

  const [reportingType, setReportingType] = useState(ReportingType.INFRACTION_SUSPICION.code)
  useSaveReportingInLocalStorage('type', reportingType, false)
  const [unit, setUnit] = useState('')
  useSaveReportingInLocalStorage('unit', unit, true)
  const [authorTrigram, setAuthorTrigram] = useState('')
  useSaveReportingInLocalStorage('authorTrigram', authorTrigram, true)
  const [authorContact, setAuthorContact] = useState('')
  useSaveReportingInLocalStorage('authorContact', authorContact, true)
  const [reportingActor, setReportingActor] = useState(ReportingOriginActor.OPS.code)
  useSaveReportingInLocalStorage('reportingActor', reportingActor, true)
  const [title, setTitle] = useState('')
  useSaveReportingInLocalStorage('title', title, true)
  const [natinfCode, setNatinfCode] = useState('')
  useSaveReportingInLocalStorage('natinfCode', natinfCode, true)
  const [dml, setDml] = useState('')
  useSaveReportingInLocalStorage('dml', dml, true)
  const [description, setDescription] = useState('')
  useSaveReportingInLocalStorage('description', description, true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const savedReporting = getLocalStorageState(null, newReportingLocalStorageKey)

    if (savedReporting) {
      setHasError(false)
      setReportingType(savedReporting?.type || ReportingType.INFRACTION_SUSPICION.code)
      setUnit(savedReporting?.value?.unit || '')
      setAuthorTrigram(savedReporting?.value?.authorTrigram || '')
      setAuthorContact(savedReporting?.value?.authorContact || '')
      setReportingActor(savedReporting?.value?.reportingActor || ReportingOriginActor.OPS.code)
      setTitle(savedReporting?.value?.title || '')
      setNatinfCode(savedReporting?.value?.natinfCode || '')
      setDml(savedReporting?.value?.dml || '')
      setDescription(savedReporting?.value?.description || '')
    }
  }, [])

  useEffect(() => {
    switch (reportingType) {
      case ReportingType.OBSERVATION.code: {
        setNatinfCode('')
        setDml('')
      }
    }
  }, [reportingType])

  useEffect(() => {
    switch (reportingActor) {
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
  }, [reportingActor])

  return (
    <Form>
      <Label>Origine</Label>
      <RadioGroup
        appearance="picker"
        inline
        value={reportingActor}
        onChange={value => setReportingActor(value)}
        defaultValue={ReportingOriginActor.OPS.code}
      >
        {Object.entries(ReportingOriginActor).map(([key, val]) => (
          <Radio key={key} data-cy={`new-reporting-reporting-actor-${key}`} style={radioStyle} value={key}>
            {val.name}
          </Radio>
        ))}
      </RadioGroup>
      {reportingActor === ReportingOriginActor.UNIT.code ? (
        <>
          <Label>Nom de l&apos;unité</Label>
          <SelectPicker
            data={controllers
              ?.map(controller => ({ label: `${controller.controller} (${controller.administration})`, value: controller.controller }))
              .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
            }
            data-cy={'new-reporting-select-unit'}
            onChange={_unit => setUnit(_unit)}
            placeholder="Choisir l'unité"
            searchable={true}
            style={{ width: unit ? 250 : 80, margin: '0px 10px 10px 10px' }}
            value={unit}
          />
        </>
      ) : null}
      {reportingActor === ReportingOriginActor.OPS.code || reportingActor === ReportingOriginActor.SIP.code ? (
        <>
          <Label>Identité de l&apos;émetteur (trigramme)</Label>
          <Input
            data-cy={''}
            onChange={e => setAuthorTrigram(e.target.value)}
            placeholder={'Ex: LTH'}
            type="text"
            value={authorTrigram}
            width={100}
          />
        </>
      ) : null}
      {reportingActor === ReportingOriginActor.DML.code ? <></> : null}
      {reportingActor === ReportingOriginActor.UNIT.code ||
      reportingActor === ReportingOriginActor.DML.code ||
      reportingActor === ReportingOriginActor.DIRM.code ||
      reportingActor === ReportingOriginActor.OTHER.code ? (
        <>
          <Label>Nom et contact (numéro, mail…) de l&apos;émetteur</Label>
          <Input
            data-cy={'new-reporting-author-contact'}
            onChange={e => setAuthorContact(e.target.value)}
            placeholder={'Ex: Yannick Attal (06 24 25 01 91)'}
            type="text"
            value={authorContact}
            width={230}
          />
        </>
      ) : null}
      <Label>Type</Label>
      <RadioGroup
        appearance="picker"
        inline
        value={reportingType}
        onChange={value => setReportingType(value)}
        defaultValue={ReportingType.INFRACTION_SUSPICION.code}
      >
        <Radio
          key={ReportingType.INFRACTION_SUSPICION.code}
        style={radioStyle}
        value={ReportingType.INFRACTION_SUSPICION.code}
        >
          {ReportingType.INFRACTION_SUSPICION.inputName}
        </Radio>
        <Radio style={radioStyle} key={ReportingType.OBSERVATION.code} value={ReportingType.OBSERVATION.code}>
          {ReportingType.OBSERVATION.inputName}
        </Radio>
      </RadioGroup>
      <Label>Titre</Label>
      <Input
        $hasError={hasError}
      data-cy={'new-reporting-title'}
      onChange={e => setTitle(e.target.value)}
      placeholder={reportingType === ReportingType.OBSERVATION.code
        ? 'Ex: Dérogation temporaire licence'
        : 'Ex: Infraction maille cul de chalut'
      }
      type="text"
      value={title}
      width={390}
      />
      <Label>Description</Label>
      <DescriptionTextarea
        data-cy={'new-reporting-description'}
      onChange={e => setDescription(e.target.value)}
      placeholder={reportingType === ReportingType.OBSERVATION.code
        ? 'Ex: Licence en cours de renouvellement, dérogation accordée par la DML jusqu\'au 01/08/2022.'
        : 'Ex: Infraction constatée sur la taille de la maille en cul de chalut'
      }
      value={description}
      />
      {reportingType === ReportingType.INFRACTION_SUSPICION.code ? (
        <>
          <Label>NATINF</Label>
          <SelectPicker
            data={infractions
            ?.map(infraction => ({ label: `${infraction.natinfCode} - ${infraction.infraction}`, value: infraction.natinfCode }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
          data-cy={'new-reporting-select-natinf'}
          onChange={natinf => setNatinfCode(natinf)}
          placeholder="Natinf"
          placement={'topLeft'}
          searchable={true}
          style={{ width: natinfCode ? 335 : 70, margin: '0px 10px 10px 10px' }}
          title={infractions?.find(infraction => infraction.natinfCode === natinfCode)?.infraction}
          value={natinfCode}
          virtualized={false}
          <Label>DML concernée</Label>
          <SelectPicker
            data={FrenchDMLs
            ?.map(dml => ({ label: dml, value: dml }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
          data-cy={'new-reporting-select-dml'}
          onChange={_dml => setDml(_dml)}
          placeholder="DML"
          placement={'topLeft'}
          searchable={true}
          style={{ width: 70, margin: '0px 10px 10px 10px' }}
          value={dml}
          />
        </>
      ) : null}
      <br />
      <ValidateButton
        data-cy="new-reporting-create-button"
        onClick={() => {
          if (!title) {
            setHasError(true)
            return
          }

          const newReporting = {
            internalReferenceNumber: selectedVesselIdentity?.internalReferenceNumber,
          vesselName: selectedVesselIdentity?.vesselName,
            externalReferenceNumber: selectedVesselIdentity?.externalReferenceNumber,
            ircs: selectedVesselIdentity?.ircs,
            type: reportingType,
          vesselIdentifier: selectedVesselIdentity?.vesselIdentifier,
            creationDate: new Date().toISOString(),
            validationDate: null,
            value: {
              type: reportingType,
              unit: unit,
              authorTrigram: authorTrigram,
              authorContact,
              reportingActor,
              title: title,
              natinfCode,
              dml,
              description: description,
            },
          }

          dispatch(addReporting(newReporting))
            .then(() => {
              closeForm()
              deleteLocalStorageReportingEntry()
            })
            .catch(console.error)
        }}
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
      {hasError ? (
        <>
          <br />
          Le champ Titre est obligatoire
        </>
      ) : null}
    </Form>
  )
}

const deleteLocalStorageReportingEntry = () => window.localStorage.setItem(newReportingLocalStorageKey, null)

const DescriptionTextarea = styled.textarea`
  resize: none;
  width: 100%;
  margin-top: 5px;
  background-color: white;
  margin-bottom: 10px;
  padding: 5px;
  height: 50px;
  max-height: 150px;
  border: 1px solid ${COLORS.lightGray};
  border-radius: 2px;

  :hover,
  :focus {
    border: 1px solid ${COLORS.slateGray} !important;
  }
  ::placeholder {
    font-style: italic;
    color: ${COLORS.slateGrayLittleOpacity};
  }
`

const ValidateButton = styled(PrimaryButton)`
  margin: 20px 10px 0px 0px;
`

const CancelButton = styled(SecondaryButton)`
  margin: 20px 0px 0px 0px;
  padding-top: 4px;
`

const Label = styled.div`
  margin-top: 5px;
`

const Input = styled.input`
  margin-top: 5px;
  margin-bottom: 10px;
  background-color: white;
  border: none;
  border-radius: 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 25px;
  width: ${props => props.width}px;
  padding: 0 5px 0 5px;
  border: 1px solid ${props => (props.$hasError ? COLORS.maximumRed : COLORS.lightGray)};
  border-radius: 2px;

  :hover,
  :focus {
    border: 1px solid ${props => (props.$hasError ? COLORS.maximumRed : COLORS.slateGray)} !important;
  }
  ::placeholder {
    font-style: italic;
    color: ${COLORS.slateGrayLittleOpacity};
  }
`

const Form = styled.div`
  margin: 15px;
  flex-direction: column;

  .rs-picker-toggle-value {
    color: ${COLORS.gunMetal} !important;
  }

  .rs-radio-group {
    border: 1px solid ${COLORS.lightGray};
    border-radius: 2px;
    overflow: hidden;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .rs-radio-checker > label {
    font-size: 13px;
    color: ${COLORS.slateGray};
  }

  .rs-radio-inline > .rs-radio-checker {
    padding-top: 0px;
    margin-right: 0px;
  }

  .rs-radio-checked {
    border-bottom: 1px solid ${COLORS.slateGray};
    color: ${COLORS.gunMetal};
  }
  .rs-radio-group-picker .rs-radio-checked .rs-radio-checker > label {
    color: ${COLORS.gunMetal};
    font-weight: 500;
  }

  .rs-picker-select {
    margin: 5px 0 10px 0 !important;
    background-color: ${COLORS.white};
  }

  .rs-picker-default .rs-btn,
  .rs-picker-input .rs-btn,
  .rs-picker-default .rs-picker-toggle,
  .rs-picker-input .rs-picker-toggle {
    background-color: ${COLORS.white} !important;
  }
`

const radioStyle = {
  background: COLORS.background,
  fontSize: 11,
}

export default NewReportingForm
