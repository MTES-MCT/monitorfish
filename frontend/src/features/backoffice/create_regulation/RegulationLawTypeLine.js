import React, { useState } from 'react'
import styled from 'styled-components'
import Tag from './Tag'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../commonStyles/Input.style'
import { ValidateButton, CancelButton, SquareButton } from '../../commonStyles/Buttons.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'

const RegulationLawTypeLine = props => {
  const {
    setSelectedValue,
    selectedValue,
    selectData,
    regulationLawType,
    setRegulationLawType
  } = props
  const [regulationBlocNameIsRed, setRegulationBlocNameIsRed] = useState(false)
  const [isAddRegulationBlocClicked, setIsAddRegulationBlocClicked] = useState(false)

  const addNewRegulationLawType = () => {
    if (regulationLawType === '') {
      setRegulationBlocNameIsRed(true)
    } else {
      setSelectedValue(regulationLawType)
      setRegulationLawType('')
      setIsAddRegulationBlocClicked(false)
      setRegulationBlocNameIsRed(false)
    }
  }

  return (
    <ContentLine>
      <Label>Ensemble réglementaire</Label>
      <CustomSelectComponent
        searchable={false}
        menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
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
        isAddRegulationBlocClicked
          ? <CreateRegulationBloc>
              <CustomInput
                placeholder='Nommez le nouvel ensemble règlementaire'
                value={regulationLawType}
                onChange={setRegulationLawType}
                width={'250px'}
                isRed={regulationBlocNameIsRed}
              />
              <ValidateButton
                disabled={false}
                isLast={false}
                onClick={addNewRegulationLawType}>
                Enregistrer
              </ValidateButton>
              <CancelButton
                disabled={false}
                isLast={false}
                onClick={() => setIsAddRegulationBlocClicked(false)}>
                Annuler
              </CancelButton>
            </CreateRegulationBloc>
          : !selectedValue && <><SquareButton
              onClick={() => setIsAddRegulationBlocClicked(true)}
            />
            <Label>Ajouter un nouvel ensemble</Label></>
    }
    </ContentLine>
  )
}

const CreateRegulationBloc = styled.div`
  display: flex;
`

export default RegulationLawTypeLine
