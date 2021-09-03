import React, { useState } from 'react'
import styled from 'styled-components'
import Tag from './Tag'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../commonStyles/Input.style'
import { ValidateButton, CancelButton, SquareButton } from '../../commonStyles/Buttons.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'

const RegulationBlocLine = props => {
  const {
    setSelectedValue,
    selectedValue,
    selectData,
    reglementationBlocName,
    setReglementationBlocName
  } = props
  const [reglementationBlocNameIsRed, setReglementationBlocNameIsRed] = useState(false)
  const [isAddReglementationBlocClicked, setIsAddReglementationBlocClicked] = useState(false)

  const addNewReglementationBloc = () => {
    if (reglementationBlocName === '') {
      setReglementationBlocNameIsRed(true)
    } else {
      setSelectedValue(reglementationBlocName)
      setReglementationBlocName('')
      setIsAddReglementationBlocClicked(false)
      setReglementationBlocNameIsRed(false)
    }
  }

  return (
    <ContentLine>
      <Label>Ensemble règlementaire</Label>
      <CustomSelectComponent
        searchable={false}
        menuStyle={{ width: 300, overflowY: 'hidden', textOverflow: 'ellipsis' }}
        placeholder='Choisir un ensemble'
        value={'Choisir un ensemble'}
        onChange={setSelectedValue}
        data={selectData}
        renderMenuItem={(_, item) => <MenuItem checked={item.value === selectedValue} item={item} tag={'Radio'} />}
      />
      {selectedValue &&
        <Tag
          tagValue={selectedValue}
          onCloseIconClicked={_ => setSelectedValue()}
        />
      }
      {
        isAddReglementationBlocClicked
          ? <CreateReglementationBloc>
              <CustomInput
                placeholder='Nommez le nouvel ensemble règlementaire'
                value={reglementationBlocName}
                onChange={setReglementationBlocName}
                width={'250px'}
                isRed={reglementationBlocNameIsRed}
              />
              <ValidateButton
                disabled={false}
                isLast={false}
                onClick={addNewReglementationBloc}>
                Enregistrer
              </ValidateButton>
              <CancelButton
                disabled={false}
                isLast={false}
                onClick={() => setIsAddReglementationBlocClicked(false)}>
                Annuler
              </CancelButton>
            </CreateReglementationBloc>
          : !selectedValue && <><SquareButton
              onClick={() => setIsAddReglementationBlocClicked(true)}
            />
            <Label>Ajouter un nouvel ensemble</Label></>
    }
    </ContentLine>
  )
}

const CreateReglementationBloc = styled.div`
  display: flex;
`

export default RegulationBlocLine
