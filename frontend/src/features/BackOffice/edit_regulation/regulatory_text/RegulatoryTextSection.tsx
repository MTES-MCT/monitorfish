import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import styled from 'styled-components'

import { RegulatoryTextContent } from './RegulatoryTextContent'
import { COLORS } from '../../../../constants/constants'
import { Section, Title } from '../../../commonStyles/Backoffice.style'
import { ValidateButton } from '../../../commonStyles/Buttons.style'
import { DEFAULT_REGULATORY_TEXT, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { updateProcessingRegulationByKey } from '../../slice'

import type { RegulatoryText } from '@features/Regulation/types'

type RegulatoryTextSectionProps = Readonly<{
  regulatoryTextList: RegulatoryText[]
  saveForm: boolean
}>
export function RegulatoryTextSection({ regulatoryTextList, saveForm }: RegulatoryTextSectionProps) {
  const dispatch = useBackofficeAppDispatch()

  const setRegulatoryTextList = texts =>
    dispatch(
      updateProcessingRegulationByKey({
        key: REGULATORY_REFERENCE_KEYS.REGULATORY_REFERENCES,
        value: texts
      })
    )

  const addOrRemoveRegulatoryTextInList = (id?: number) => {
    let newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []

    if (id === undefined) {
      newRegulatoryTextList.push(DEFAULT_REGULATORY_TEXT)
    } else if (regulatoryTextList.length === 1) {
      newRegulatoryTextList = [DEFAULT_REGULATORY_TEXT]
    } else {
      newRegulatoryTextList.splice(id, 1)
    }

    setRegulatoryTextList(newRegulatoryTextList)
  }

  const addRegRefInEffect = () => {
    addOrRemoveRegulatoryTextInList()
  }

  const setRegulatoryText = (id: number, regulatoryText: RegulatoryText) => {
    const newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []
    newRegulatoryTextList[id] = regulatoryText
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (
    <Section show>
      <Title>références réglementaires en vigueur</Title>
      {regulatoryTextList && regulatoryTextList.length > 0 ? (
        regulatoryTextList.map((regulatoryText, id) => (
          <RegulatoryTextContent
            key={JSON.stringify(regulatoryText)}
            addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
            id={id}
            listLength={regulatoryTextList.length}
            regulatoryText={regulatoryText}
            saveForm={saveForm}
            setRegulatoryText={setRegulatoryText}
          />
        ))
      ) : (
        <RegulatoryTextContent
          key={0}
          addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
          id={0}
          listLength={0}
          regulatoryText={DEFAULT_REGULATORY_TEXT}
          saveForm={saveForm}
          setRegulatoryText={setRegulatoryText}
        />
      )}
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
  background-color: ${COLORS.white};
`
