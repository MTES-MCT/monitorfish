import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Footer, Modal, TagPicker } from 'rsuite'
import { COLORS } from '../../../constants/constants'
import { FleetSegmentInput, INPUT_TYPE, renderTagPickerValue } from '../tableCells'
import { useSelector } from 'react-redux'
import { PrimaryButton } from '../../commonStyles/Buttons.style'
import { cleanInputString } from '../../../utils/cleanInputString'
import StyledModalHeader from '../../commonComponents/StyledModalHeader'

// TODO Use Formik + Yup to handle and validate form
export function NewFleetSegmentModal ({ faoAreasList, onCancel, onSubmit, year }) {
  const gearsFAOList = useSelector(state => state.gear.gears)
  const speciesFAOList = useSelector(state => state.species.species)

  const [segment, setSegment] = useState('')
  const [segmentName, setSegmentName] = useState('')
  const [impactRiskFactor, setImpactRiskFactor] = useState('')
  const [gears, setGears] = useState([])
  const [faoAreas, setFaoAreas] = useState([])
  const [targetSpecies, setTargetSpecies] = useState()
  const [bycatchSpecies, setBycatchSpecies] = useState()

  const faoSpeciesAsOptions = useMemo(
    () => {
      return speciesFAOList.map(species => ({ label: species.code, value: species.code }))
    },
    [speciesFAOList]
  )

  const handleSubmit = () => {
    const newFleetSegmentData = {
      segment: cleanInputString(segment),
      segmentName,
      impactRiskFactor,
      gears,
      faoAreas,
      targetSpecies: targetSpecies ?? [],
      bycatchSpecies: bycatchSpecies ?? [],
      year
    }

    onSubmit(newFleetSegmentData)
  }

  return (
    <ModalWithCustomHeight
      backdrop
      onClose={onCancel}
      open
      size={'xs'}
      style={{ marginTop: 50 }}
    >
      <StyledModalHeader>
        <Modal.Title>
          <Title>
            Ajouter un segment de flotte
          </Title>
        </Modal.Title>
      </StyledModalHeader>
      <Body>
        <Columns>
          <Column>
            <Label htmlFor="newFleetSegmentName">Nom</Label>
            <FleetSegmentInput
              id="newFleetSegmentName"
              inputType={INPUT_TYPE.STRING}
              maxLength={null}
              onChange={(id, key, value) => setSegment(value)}
              value={segment}
            />
          </Column>
          <Column>
            <Label htmlFor="newFleetSegmentImpactRiskFactor">Note d’impact</Label>
            <FleetSegmentInput
              id="newFleetSegmentImpactRiskFactor"
              inputType={INPUT_TYPE.DOUBLE}
              maxLength={50}
              onChange={(id, key, value) => setImpactRiskFactor(value)}
              value={impactRiskFactor}
            />
          </Column>
        </Columns>
        <Label htmlFor="newFleetSegmentDescription">Description</Label>
        <FleetSegmentInput
          dataCy={'create-fleet-segment-description'}
          id="newFleetSegmentDescription"
          inputType={INPUT_TYPE.STRING}
          maxLength={null}
          onChange={(id, key, value) => setSegmentName(value)}
          value={segmentName}
        />
        <Label>Engins</Label>
        <TagPicker
          data-cy={'create-fleet-segment-gears'}
          data={gearsFAOList.map(gear => ({ label: gear.code, value: gear.code }))}
          onChange={setGears}
          placeholder={'Engins'}
          placement={'auto'}
          renderValue={(_, items) => renderTagPickerValue(items)}
          searchable
          style={tagPickerStyle}
          value={gears}
          virtualized
        />
        <Label>Espèces ciblées</Label>
        <TagPicker
          data={faoSpeciesAsOptions}
          data-cy={'create-fleet-segment-targeted-species'}
          onChange={setTargetSpecies}
          placeholder={'Espèces ciblées'}
          placement={'auto'}
          renderValue={(_, items) => renderTagPickerValue(items)}
          searchable
          style={tagPickerStyle}
          value={targetSpecies}
          virtualized />
        <Label>Prises accessoires</Label>
        <TagPicker
          data={faoSpeciesAsOptions}
          data-cy={'create-fleet-segment-incidental-species'}
          onChange={setBycatchSpecies}
          placeholder={'Prises accessoires'}
          placement={'auto'}
          renderValue={(_, items) => renderTagPickerValue(items)}
          searchable
          style={tagPickerStyle}
          value={bycatchSpecies}
          virtualized
        />
        <Label>Zones FAO</Label>
        <TagPicker
          data-cy={'create-fleet-segment-fao-zones'}
          data={faoAreasList?.map(faoAreas => ({ label: faoAreas, value: faoAreas }))}
          onChange={setFaoAreas}
          placeholder={'Zones FAO'}
          placement={'auto'}
          renderValue={(_, items) => renderTagPickerValue(items)}
          searchable
          style={tagPickerStyle}
          value={faoAreas}
        />
      </Body>
      <Footer>
        <ValidateButton
          data-cy={'create-fleet-segment'}
          onClick={handleSubmit}
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

const tagPickerStyle = { width: 350, margin: '5px 10px 20px 0', verticalAlign: 'top' }

const Label = styled.label`
  display: inline-block;
  width: 100%;
`

const Title = styled.div`
  color: ${COLORS.gainsboro};
  font-size: 16px;
  line-height: 30px;
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
