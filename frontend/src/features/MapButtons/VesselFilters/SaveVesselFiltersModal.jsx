import React, { useState } from 'react'
import styled from 'styled-components'
import { Input, InputGroup, Modal } from 'rsuite'
import { COLORS } from '../../../constants/constants'
import { v4 as uuidv4 } from 'uuid'

import { ReactComponent as FilterSVG } from '../../icons/Icone_filtres_dark.svg'
import { CirclePicker } from 'react-color'
import TagList from './TagList'
import StyledModalHeader from '../../commonComponents/StyledModalHeader'

const styles = {
  width: 200,
  marginBottom: 20
}

const SaveVesselFiltersModal = ({ isOpen, setIsOpen, filters, addFilter, closeAndResetVesselList }) => {
  const [filterName, setFilterName] = useState('')
  const [filterColor, setFilterColor] = useState('#2c6e49')

  const save = () => {
    const filter = {
      filters: filters,
      name: filterName,
      color: filterColor,
      showed: true,
      uuid: uuidv4()
    }

    addFilter(filter)

    setIsOpen(false)
    setFilterName('')
    setFilterColor('#2c6e49')

    closeAndResetVesselList()
  }

  const cancel = () => {
    setIsOpen(false)
  }

  return (
    <Modal
      size={'sm'}
      backdrop
      open={isOpen}
      style={{ marginTop: 100 }}
      onClose={cancel}
    >
      <StyledModalHeader>
        <Modal.Title>
          <Title>
            Enregistrer le filtre
          </Title>
        </Modal.Title>
      </StyledModalHeader>
      <Modal.Body>
        <InputGroup inside style={styles}>
          <InputGroup.Addon>
            <Filter fill={filterColor}/>
          </InputGroup.Addon>
          <Input
            placeholder={'FILTRE SANS NOM'}
            onChange={setFilterName}
          />
        </InputGroup>
        <TagList filters={filters}/>
        <SelectedFilterColor>
          <Square color={filterColor}/>
          Couleur des navires du filtre
        </SelectedFilterColor>
        <CirclePicker
          width={'300px'}
          circleSize={20}
          circleSpacing={10}
          onChangeComplete={color => setFilterColor(color.hex)}
          color={filterColor}
          colors={[
            '#2c6e49',
            '#8a1c7c',
            '#8c2c17',
            '#38b277',
            '#303eff',
            '#8389f7',
            '#af6f1b',
            '#e0876c',
            '#eabd00',
            '#fc4c0d']}
        />
        <SaveButton
          data-cy={'save-filter'}
          onClick={save}>
          Enregistrer
        </SaveButton>
        <CancelButton
          onClick={cancel}>
          Annuler
        </CancelButton>
      </Modal.Body>
    </Modal>
  )
}

const SelectedFilterColor = styled.div`
  margin: 10px 0 10px 0;
  font-size: 13px;
  color: ${COLORS.slateGray};
`

const Square = styled.div`
  margin: 5px 7px;
  margin: 4px 7px 6px 0px;
  background: ${props => props.color ? props.color : 'white'};
  border: 2px solid ${p => p.theme.color.lightGray};
    width: 14px;
    height: 14px;
    display: inline-block;
    vertical-align: middle;
`

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
`

const SaveButton = styled.button`
  background: ${COLORS.charcoal};
  padding: 5px 12px;
  margin: -28px 0px 20px 10px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
  float: right;

  :hover {
    background: ${COLORS.charcoal};
  }
`

const CancelButton = styled.button`
  border: 1px solid ${COLORS.charcoal};
  padding: 4px 12px;
  margin: 20px 0;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: -28px 0px 20px 10px;
  float: right;

  :disabled {
    border: 1px solid ${COLORS.lightGray};
    color: ${COLORS.lightGray};
  }
`

const Filter = styled(FilterSVG)`
  width: 16px;
`

export default SaveVesselFiltersModal
