import { regulationActions } from '@features/Regulation/slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import styled from 'styled-components'

import { RegulatoryTextContent } from './RegulatoryTextContent'
import { Section, Title } from '../../../commonStyles/Backoffice.style'
import { ValidateButton } from '../../../commonStyles/Buttons.style'
import { DEFAULT_REGULATORY_TEXT, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'

import type { RegulatoryText } from '@features/Regulation/types'

type RegulatoryTextSectionProps = Readonly<{
  regulatoryTextList: RegulatoryText[] | undefined
  saveForm: boolean
}>
export function RegulatoryTextSection({ regulatoryTextList, saveForm }: RegulatoryTextSectionProps) {
  const dispatch = useBackofficeAppDispatch()

  const regulotaryTextListWithInitialRegulatoryText = !regulatoryTextList?.length
    ? [DEFAULT_REGULATORY_TEXT]
    : regulatoryTextList

  const setRegulatoryTextList = texts =>
    dispatch(
      regulationActions.updateProcessingRegulationByKey({
        key: REGULATORY_REFERENCE_KEYS.REGULATORY_REFERENCES,
        value: texts
      })
    )

  const addOrRemoveRegulatoryTextInList = (index?: number) => {
    let newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []

    if (index === undefined) {
      newRegulatoryTextList.push(DEFAULT_REGULATORY_TEXT)
    } else if (regulatoryTextList?.length === 1) {
      newRegulatoryTextList = [DEFAULT_REGULATORY_TEXT]
    } else {
      newRegulatoryTextList.splice(index, 1)
    }

    setRegulatoryTextList(newRegulatoryTextList)
  }

  const addRegRefInEffect = () => {
    addOrRemoveRegulatoryTextInList()
  }

  const setRegulatoryText = (index: number, regulatoryText: RegulatoryText) => {
    const newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []
    newRegulatoryTextList[index] = regulatoryText
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (
    <Section show>
      <Title>références réglementaires en vigueur</Title>
      {regulotaryTextListWithInitialRegulatoryText.map((regulatoryText, index) => (
        <RegulatoryTextContent
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
          index={index}
          listLength={regulotaryTextListWithInitialRegulatoryText.length}
          regulatoryText={regulatoryText}
          saveForm={saveForm}
          setRegulatoryText={setRegulatoryText}
        />
      ))}
      <ButtonLine>
        <ValidateButton disabled={false} isLast={false} onClick={addRegRefInEffect}>
          Ajouter un autre texte en vigueur
        </ValidateButton>
      </ButtonLine>
    </Section>
  )
}

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${p => p.theme.color.white};
`
