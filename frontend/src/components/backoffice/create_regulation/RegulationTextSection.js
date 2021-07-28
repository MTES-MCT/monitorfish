import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulationText from '../RegulationText'
import { setIsModalOpen } from '../../../domain/reducers/Regulatory'

const RegulationTextSection = props => {
  const dispatch = useDispatch()
  const {
    regulationTextList,
    setRegulationTextList,
    isRefToCome
  } = props

  const addRegRefInEffect = () => {
    updateRegulationText()
  }

  const addTextToCome = () => {
    console.log('addTextToCome')
    if (isRefToCome) {
      updateRegulationText()
    } else {
      console.log('setIsModalOpen')
      dispatch(setIsModalOpen(true))
    }
  }

  const updateRegulationText = (id, regulationText) => {
    let newRegulationTextList = [...regulationTextList]
    if (id === undefined) {
      newRegulationTextList.push(regulationText || {})
    } else {
      if (regulationText && regulationText !== {}) {
        newRegulationTextList[id] = regulationText
      } else {
        if (newRegulationTextList.length === 1) {
          newRegulationTextList = [{}]
        } else {
          newRegulationTextList.splice(id, 1)
        }
      }
    }
    setRegulationTextList(newRegulationTextList)
  }

  return (<Section>
    <SectionTitle>
      références réglementaires en vigueur
    </SectionTitle>
    {
      (regulationTextList && regulationTextList.length > 0) &&
        regulationTextList.map((regulationText, id) => {
          return <RegulationText
              key={id}
              id={id}
              regulationText={regulationText}
              updateRegulationText={updateRegulationText}
            />
        })
    }
    <ButtonLine>
      {!isRefToCome && <ValidateButton
        disabled={false}
        isLast={false}
        onClick={addRegRefInEffect}>
        Ajouter un autre texte en vigueur
      </ValidateButton>}
      <CustomCancelButton
        disabled={false}
        isLast={false}
        onClick={addTextToCome}>
        Ajouter un texte à venir
      </CustomCancelButton>
    </ButtonLine>
  </Section>)
}

const CustomCancelButton = styled(CancelButton)`
  margin: 0px;
`

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${COLORS.background};
`

export default RegulationTextSection
