import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import RadioGroup from 'rsuite/es/RadioGroup'
import Radio from 'rsuite/es/Radio'
import { FrenchDMLs, ReportingOriginActor, ReportingType } from '../../../../domain/entities/reporting'
import { PrimaryButton, SecondaryButton } from '../../../commonStyles/Buttons.style'
import { sortArrayByColumn } from '../../../vessel_list/tableSort'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { useDispatch, useSelector } from 'react-redux'
import { getLocalStorageState } from '../../../../utils'
import { useSaveReportingInLocalStorage } from './useSaveInLocalStorage'
import addReporting from '../../../../domain/use_cases/reporting/addReporting'

const newReportingLocalStorageKey = 'new-reporting'
const NewReportingForm = ({ selectedVesselIdentity, closeForm }) => {
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

  useEffect(() => {
    const savedReporting = getLocalStorageState(null, newReportingLocalStorageKey)

    if (savedReporting) {
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

  return <Form>
    <Label>Origine</Label>
    <RadioGroup
      appearance="picker"
      inline
      value={reportingActor}
      onChange={value => setReportingActor(value)}
      defaultValue={ReportingOriginActor.OPS.code}
    >
      {
        Object.entries(ReportingOriginActor).map(([key, val]) =>
          <Radio data-cy={`new-reporting-reporting-actor-${key}`} style={radioStyle} key={key} value={key}>{val.name}</Radio>)
      }
    </RadioGroup>
    {
      reportingActor === ReportingOriginActor.UNIT.code
        ? <>
          <Label>Nom de l&apos;unité</Label>
          <SelectPicker
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
        </>
        : null
    }
    {
      reportingActor === ReportingOriginActor.OPS.code || reportingActor === ReportingOriginActor.SIP.code
        ? <>
          <Label>Identité de l&apos;émetteur (trigramme)</Label>
          <Input
            data-cy={''}
            width={100}
            placeholder={'LTH'}
            type="text"
            value={authorTrigram}
            onChange={e => setAuthorTrigram(e.target.value)}
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
          <Input
            data-cy={'new-reporting-author-contact'}
            width={230}
            placeholder={'Ex: Yannick Attal (06 24 25 01 91)'}
            type="text"
            value={authorContact}
            onChange={e => setAuthorContact(e.target.value)}
          />
        </>
        : null
    }
    <Label>Type</Label>
    <RadioGroup
      appearance="picker"
      inline
      value={reportingType}
      onChange={value => setReportingType(value)}
      defaultValue={ReportingType.INFRACTION_SUSPICION.code}
    >
      <Radio
        style={radioStyle}
        key={ReportingType.INFRACTION_SUSPICION.code}
        value={ReportingType.INFRACTION_SUSPICION.code}
      >
        {ReportingType.INFRACTION_SUSPICION.inputName}
      </Radio>
      <Radio
        style={radioStyle}
        key={ReportingType.OBSERVATION.code}
        value={ReportingType.OBSERVATION.code}
      >
        {ReportingType.OBSERVATION.inputName}
      </Radio>
    </RadioGroup>
    <Label>Titre</Label>
    <Input
      data-cy={'new-reporting-title'}
      placeholder={reportingType === ReportingType.OBSERVATION.code
        ? 'Ex: Dérogation temporaire licence'
        : 'Ex: Infraction maille cul de chalut'
      }
      width={385}
      type="text"
      value={title}
      onChange={e => setTitle(e.target.value)}
    />
    <Label>Description</Label>
    <DescriptionTextarea
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
          title={infractions?.find(infraction => infraction.natinfCode === natinfCode)?.infraction}
          data-cy={'new-reporting-select-natinf'}
          style={{ width: natinfCode ? 350 : 70, margin: '0px 10px 10px 10px' }}
          searchable={true}
          placement={'auto'}
          placeholder="Natinf"
          value={natinfCode}
          onChange={natinf => setNatinfCode(natinf)}
          data={infractions
            ?.map(infraction => ({ label: `${infraction.natinfCode} - ${infraction.infraction}`, value: infraction.natinfCode }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
        />
        <Label>DML concernée</Label>
        <SelectPicker
          data-cy={'new-reporting-select-dml'}
          style={{ width: 70, margin: '0px 10px 10px 10px' }}
          searchable={true}
          placement={'topLeft'}
          placeholder="DML"
          value={dml}
          onChange={_dml => setDml(_dml)}
          data={FrenchDMLs
            ?.map(dml => ({ label: dml, value: dml }))
            .sort((a, b) => sortArrayByColumn(a, b, 'label', 'asc'))
          }
        />
        </>
        : null
    }<br/>
    <ValidateButton
      data-cy={'new-reporting-create-button'}
      onClick={() => {
        if (title) {
          const newReporting = {
            vesselName: selectedVesselIdentity?.vesselName,
            internalReferenceNumber: selectedVesselIdentity?.internalReferenceNumber,
            externalReferenceNumber: selectedVesselIdentity?.externalReferenceNumber,
            ircs: selectedVesselIdentity?.ircs,
            vesselIdentifier: selectedVesselIdentity?.vesselIdentifier,
            type: reportingType,
            creationDate: new Date().toISOString(),
            validationDate: null,
            value: {
              type: reportingType,
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

          dispatch(addReporting(newReporting))
            .then(() => {
              closeForm()
              deleteLocalStorageReportingEntry()
            })
            .catch(error => console.log(error))
        }
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
  </Form>
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
  
  :hover, :focus {
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
  border: 1px solid ${COLORS.lightGray};
  border-radius: 2px;
  
  :hover, :focus {
    border: 1px solid ${COLORS.slateGray} !important;
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
  
  .rs-picker-default .rs-btn, .rs-picker-input .rs-btn, .rs-picker-default .rs-picker-toggle, .rs-picker-input .rs-picker-toggle {
    background-color: ${COLORS.white} !important;
  }
  
`

const radioStyle = {
  background: COLORS.background,
  fontSize: 11
}

export default NewReportingForm
