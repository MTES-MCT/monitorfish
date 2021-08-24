import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import InfoBox from './InfoBox'
import { CancelButton } from '../../commonStyles/Buttons.style'
import { Link } from '../../commonStyles/Backoffice.style'
import { openModal } from '../../../domain/reducers/Regulation'

/**
 * @type {[RegulatoryText]} upcomingRegulationText
 */
const UpcommingRegulationSection = ({ upcomingRegulation, setUpcomingRegulation }) => {
  const dispatch = useDispatch()
  const DATE_STRING_OPTIONS = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return (
      <>
      <Container>
        <YellowRectangle />
        <UpcomingRegulation>
          <Row><InfoBox /> <GrayText >Réglementation à venir</ GrayText></Row>
          {upcomingRegulation?.regulatoryTextList?.length > 0 && upcomingRegulation.regulatoryTextList.map((upcomingRegulationText, id) => {
            const {
              name,
              URL,
              startDate,
              endDate
            } = upcomingRegulationText
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
            onClick={() => dispatch(openModal(upcomingRegulation))}
          >
            Éditer la réglementation
          </CancelButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={() => setUpcomingRegulation(undefined)}
          >
            Supprimer la réglementation
          </CancelButton></Row>
        </ UpcomingRegulation>
      </Container>
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
  padding: 10px 15px;
`

export default UpcommingRegulationSection
