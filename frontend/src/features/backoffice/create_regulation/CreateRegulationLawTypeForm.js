import React, { useState } from 'react'
import styled from 'styled-components'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { CustomInput } from '../../commonStyles/Input.style'

const CreateRegulationLawTypeForm = props => {
  const {
    setSelectedRegulationTheme,
    setIsAddThemeClicked,
    setIsInfoTextShown
  } = props
  const [themePlace, setThemePlace] = useState('')
  const [themePlaceIsRed, setThemePlaceIsRed] = useState(false)
  const [themeGears, setThemeGears] = useState('')
  const [themeSpecies, setThemeSpecies] = useState('')
  const [themeOtherIndications, setThemeOtherIndications] = useState('')

  const resetThemeForm = () => {
    setThemePlace('')
    setThemeGears('')
    setThemeSpecies('')
    setThemeOtherIndications('')
  }

  const addNewTheme = () => {
    if (themePlace === '') {
      setThemePlaceIsRed(true)
    } else {
      const regulationPlace = `${themePlace}
      ${themeSpecies ? ' - ' + themeSpecies : ''}
      ${themeGears ? ' - ' + themeGears : ''}`
      setSelectedRegulationTheme(regulationPlace)
      resetThemeForm()
      setIsAddThemeClicked(false)
      setThemePlaceIsRed(false)
    }
  }
  return (
    <CreateRegulationBloc>
      <CustomInput
        placeholder='Lieu *'
        value={themePlace}
        onChange={setThemePlace}
        isRed={themePlaceIsRed}
      />
      <CustomInput
        placeholder='Espèce'
        value={themeSpecies}
        onChange={setThemeSpecies}
      />
      <CustomInput
        placeholder='Engins'
        value={themeGears}
        onChange={setThemeGears}
      />
      <CustomInput
        placeholder='Autres indications'
        value={themeOtherIndications}
        onChange={setThemeOtherIndications}
        width={'115px'}
      />
      <ValidateButton
        disabled={false}
        isLast={false}
        onClick={addNewTheme}>
        Enregistrer
      </ValidateButton>
      <CancelButton
        disabled={false}
        isLast={false}
        onClick={() => {
          setIsAddThemeClicked(false)
          setIsInfoTextShown(false)
        }}
      >
        Annuler
      </CancelButton>
    </CreateRegulationBloc>
  )
}

const CreateRegulationBloc = styled.div`
  display: flex;
`

export default CreateRegulationLawTypeForm
