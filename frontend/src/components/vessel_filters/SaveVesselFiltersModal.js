import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from 'rsuite/lib/Modal'
import { COLORS } from '../../constants/constants'
import InputGroup from 'rsuite/lib/InputGroup'
import Input from 'rsuite/lib/Input'
import { v4 as uuidv4 } from 'uuid'

import { ReactComponent as FilterSVG } from '../icons/Icone_filtres_dark.svg'
import { CirclePicker } from 'react-color'
import TagList from './TagList'

const styles = {
  width: 200,
  marginBottom: 20
}

const SaveVesselFiltersModal = ({ isOpen, setIsOpen, filters, addFilter }) => {
  const [filterName, setFilterName] = useState('')
  const [filterColor, setFilterColor] = useState('#ff5138')

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
  }

  const cancel = () => {
    setIsOpen(false)
  }

  return (
    <Modal
      size={'sm'}
      backdrop
      show={isOpen}
      style={{ marginTop: 100 }}
      onHide={cancel}
    >
      <Modal.Header>
        <Modal.Title>
          <Title>
            Enregistrer le filtre
          </Title>
        </Modal.Title>
      </Modal.Header>
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
        <TagList filters={filters} />
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
            '#002925',
            '#053a64',
            '#314617',
            '#555b10',
            '#8b0030',
            '#ac9a00',
            '#421319',
            '#ff5138']}
        />
        <SaveButton
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
  color: ${COLORS.textGray};
`

const Square = styled.div`
  margin: 5px 7px;
  margin: 4px 7px 6px 0px;
  background: ${props => props.color ? props.color : 'white'};
  border: 2px solid ${COLORS.squareBorder};
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
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px;
  margin: -28px 0px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  float: right;
  
  :hover {
    background: ${COLORS.grayDarkerThree};
  }
`

const CancelButton = styled.button`
  border: 1px solid ${COLORS.grayDarkerThree};
  padding: 4px 12px;
  margin: 20px 0;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: -28px 0px 20px 10px;
  float: right;
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const Filter = styled(FilterSVG)`
  width: 16px;
`

export default SaveVesselFiltersModal
