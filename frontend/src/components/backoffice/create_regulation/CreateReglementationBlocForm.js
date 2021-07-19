import React, { useState } from 'react'
import styled from 'styled-components'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { CustomInput } from '../../commonStyles/Input.style'

const CreateReglementatonBlocForm = props => {
  const {
    setSelectedReglementationTheme,
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

  const addNewTheme = (elem) => {
    if (themePlace === '') {
      setThemePlaceIsRed(true)
    } else {
      const reglementationPlace = `${themePlace}
      ${themeSpecies ? ' - ' + themeSpecies : ''}
      ${themeGears ? ' - ' + themeGears : ''}`
      setSelectedReglementationTheme(reglementationPlace)
      resetThemeForm()
      setIsAddThemeClicked(false)
      setThemePlaceIsRed(false)
    }
  }
  return (
    <CreateReglementationBloc>
      <CustomInput
        placeholder='Lieu*'
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
    </CreateReglementationBloc>
  )
}

const CreateReglementationBloc = styled.div`
  display: flex;
`

export default CreateReglementatonBlocForm
