import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from 'rsuite/lib/Modal'
import { COLORS } from '../../../constants/constants'
import { FleetSegmentInput, INPUT_TYPE, renderTagPickerValue } from '../tableCells'
import TagPicker from 'rsuite/lib/TagPicker'
import { useDispatch, useSelector } from 'react-redux'
import { Footer } from 'rsuite'
import { PrimaryButton } from '../../commonStyles/Buttons.style'
import createFleetSegment from '../../../domain/use_cases/fleetSegment/createFleetSegment'

const AddFleetSegmentModal = ({ isModalOpen, setModalIsOpen, faoAreasList }) => {
  const dispatch = useDispatch()
  const gearsFAOList = useSelector(state => state.gear.gears)
  const speciesFAOList = useSelector(state => state.species.species)

  const [segment, setSegment] = useState('')
  const [segmentName, setSegmentName] = useState('')
  const [impactRiskFactor, setImpactRiskFactor] = useState(0.0)
  const [gears, setGears] = useState([])
  const [faoAreas, setFaoAreas] = useState([])
  const [targetSpecies, setTargetSpecies] = useState([])
  const [bycatchSpecies, setBycatchSpecies] = useState([])

  return (
    <ModalWithCustomHeight
      size={'xs'}
      backdrop
      show={isModalOpen}
      style={{ marginTop: 50 }}
      onHide={() => setModalIsOpen(false)}
    >
      <Modal.Header>
        <Modal.Title>
          <Title>
            Ajouter un segment de flotte
          </Title>
        </Modal.Title>
      </Modal.Header>
      <Body>
        <Columns>
          <Column>
            <Label>Nom</Label>
            <FleetSegmentInput
              dataCy={'create-fleet-segment-segment'}
              value={segment}
              maxLength={null}
              inputType={INPUT_TYPE.STRING}
              onChange={(id, key, value) => setSegment(value)}
            />
          </Column>
          <Column>
            <Label>Note d&apos;impact</Label>
            <FleetSegmentInput
              dataCy={'create-fleet-segment-impact-risk-factor'}
              value={impactRiskFactor}
              maxLength={50}
              inputType={INPUT_TYPE.DOUBLE}
              onChange={(id, key, value) => setImpactRiskFactor(value)}
            />
          </Column>
        </Columns>
        <Label>Description</Label>
        <FleetSegmentInput
          dataCy={'create-fleet-segment-description'}
          value={segmentName}
          maxLength={null}
          inputType={INPUT_TYPE.STRING}
          onChange={(id, key, value) => setSegmentName(value)}
        />
        <Label>Engins</Label>
        <TagPicker
          data-cy={'create-fleet-segment-gears'}
          searchable
          value={gears}
          style={tagPickerStyle}
          data={gearsFAOList.map(gear => ({ label: gear.code, value: gear.code }))}
          placeholder={'Engins'}
          placement={'auto'}
          onChange={gears => setGears(gears)}
          renderValue={(_, items) => renderTagPickerValue(items)}
        />
        <Label>Espèces ciblées</Label>
        <TagPicker
          data-cy={'create-fleet-segment-target-species'}
          searchable
          value={targetSpecies}
          style={tagPickerStyle}
          data={speciesFAOList?.map(species => ({ label: species.code, value: species.code }))}
          placeholder={'Espèces ciblées'}
          placement={'auto'}
          onChange={targetSpecies => setTargetSpecies(targetSpecies)}
          renderValue={(_, items) => renderTagPickerValue(items)}
        />
        <Label>Prises accessoires</Label>
        <TagPicker
          data-cy={'create-fleet-segment-bycatch-species'}
          searchable
          value={bycatchSpecies}
          style={tagPickerStyle}
          data={speciesFAOList.map(species => ({ label: species.code, value: species.code }))}
          placeholder={'Prises accessoires'}
          placement={'auto'}
          onChange={bycatchSpecies => setBycatchSpecies(bycatchSpecies)}
          renderValue={(_, items) => renderTagPickerValue(items)}
        />
        <Label>Zones FAO</Label>
        <TagPicker
          data-cy={'create-fleet-segment-fao-zones'}
          searchable
          value={faoAreas}
          style={tagPickerStyle}
          data={faoAreasList?.map(faoAreas => ({ label: faoAreas, value: faoAreas }))}
          placeholder={'Zones FAO'}
          placement={'auto'}
          onChange={faoAreas => setFaoAreas(faoAreas)}
          renderValue={(_, items) => renderTagPickerValue(items)}
        />
      </Body>
      <Footer>
        <ValidateButton
          data-cy={'create-fleet-segment'}
          onClick={() => {
            const createJSON = {
              segment: segment?.replace(/[ ]/g, ''),
              segmentName: segmentName,
              impactRiskFactor: impactRiskFactor,
              gears: gears,
              faoAreas: faoAreas,
              targetSpecies: targetSpecies,
              bycatchSpecies: bycatchSpecies
            }

            dispatch(createFleetSegment(createJSON)).then(() => setModalIsOpen(false))
          }}
        >
          Créer
        </ValidateButton>
      </Footer>
    </ModalWithCustomHeight>
  )
}

const Columns = styled.div`
  display: flex;
`

const Column = styled.div`
  margin-right: 5px
`

const ValidateButton = styled(PrimaryButton)`
  margin: 10px 10px 15px 25px;
`

const tagPickerStyle = { width: 350, margin: '5px 10px 15px 0', verticalAlign: 'top' }

const Label = styled.span`
  display: inline-block;
  width: 100%;
`

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
  color: ${COLORS.gainsboro};
`

const Body = styled(Modal.Body)`
  padding: 20px 25px 0 25px !important;
  text-align: left;
  
  .rs-input {
    color: ${COLORS.charcoal};
  }
  
  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
  }
  
  .rs-picker-has-value .rs-btn .rs-picker-toggle-value, .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.charcoal};
  }
  
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }
  
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 230px !important;
  } 
`

const ModalWithCustomHeight = styled(Modal)`
  .rs-modal-content {
    height: inherit !important;
  }
`

export default AddFleetSegmentModal
