import React from 'react'
import styled from 'styled-components'
import InfoBox from './InfoBox'
import { CancelButton } from '../../commonStyles/Buttons.style'
import { Delimiter, Link } from '../../commonStyles/Backoffice.style'

/**
 * @type {[RegulatoryText]} upcomingRegulationText
 */
const UpcommingRegulationSection = ({ upcomingRegulationTextList }) => {
  const DATE_STRING_OPTIONS = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return (
      <>
      <Container>
        <YellowRectangle />
        <UpcomingRegulation>
          <Row><InfoBox /> <GrayText >Réglementation à venir</ GrayText></Row>
          {upcomingRegulationTextList?.length > 0 && upcomingRegulationTextList.map((upcomingRegulationText, id) => {
            const {
              name,
              URL,
              startDate,
              endDate
            } = upcomingRegulationText
            console.log(upcomingRegulationText)
            return (
            <TextRow key={id}>
              <LinkWithGrayBg
                href={URL}
                target={'_blank'}
              >{name}</LinkWithGrayBg>
              <TextWithGrayBg color={'#282F3E'}>Du {startDate.toLocaleString('fr-FR', DATE_STRING_OPTIONS)} au {endDate.toLocaleString('fr-FR', DATE_STRING_OPTIONS)}</TextWithGrayBg>
            </TextRow>)
          })}
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
      <Delimiter />
      </>
  )
}

const LinkWithGrayBg = styled(Link)` 
  background-color: #E5E5EB;
  padding: 5px 10px;
  font-size: 13px;
  margin-bottom: 5px;
  width: max-content;
`

const TextRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0 10px 0;
`

const Row = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 5px 0px;
`

const TextWithGrayBg = styled.p`
  background-color: #E5E5EB;
  color: ${props => props.color};
  box-sizing: border-box;
  margin: 0 0 5px 0;
  width: max-content;
  padding: 5px 10px;
  font-size: 13px;
`

const GrayText = styled.p`
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
  padding: 10px 15px;
`

export default UpcommingRegulationSection
