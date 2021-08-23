import React from 'react'
import styled from 'styled-components'
import InfoBox from './InfoBox'
import { CancelButton } from '../../commonStyles/Buttons.style'

const UpcommingRegulationSection = () => {
  // selectionner dans le state la liste ?
  return (
      <Container>
        <YellowRectangle />
        <UpcomingRegulation>
          <Row><InfoBox /> <GrayText >Réglementation à venir</ GrayText></Row>
          <TextRow>
            <TextWithGrayBg color={'#0A18DF'}>Arrêté Ministériel du 16/06/2021</TextWithGrayBg>
            <TextWithGrayBg color={'#282F3E'}>Du 01/07/2021 au 31/09/2021</TextWithGrayBg>
          </TextRow>
          <Row><CancelButton
            disabled={false}
            isLast={false}
            onClick={() => console.log('open a modale in edition, set the upcomming reg id in state')}
          >
            Éditer le texte
          </CancelButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={() => console.log('remove upcomming regulation from the list in the Regulation Text Section state')}
          >
            Supprimer le texte
          </CancelButton></Row>
        </ UpcomingRegulation>
      </Container>
  )
}

const TextRow = styled.div`
  margin: 15px 0 10px 0;
`

const Row = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TextWithGrayBg = styled.p`
  background-color: #E5E5EB;
  color: ${props => props.color};
  box-sizing: border-box;
  margin: 0 0 5px 0;
  width: max-content;
  padding: 5px 10px;
`

const GrayText = styled.p`
  margin: 0 0 0 5px;
  color: #707785;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  border: 1px solid #707785;
  margin: 15px 0px;
  width: max-content;
`

const YellowRectangle = styled.div`
  width: 10px;
  background-color: #F6D012;
`

const UpcomingRegulation = styled.div`
  padding: 15px;
`

export default UpcommingRegulationSection
