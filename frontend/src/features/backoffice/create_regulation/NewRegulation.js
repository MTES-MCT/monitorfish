import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import {
  RegulationBlocLine,
  RegulationZoneThemeLine,
  RegulationRegionLine,
  RegulationLayerZoneLine,
  RegulationSeaFrontLine,
  RegulatoryTextSection,
  UpcomingRegulationModal
} from './'

import { formatDataForSelectPicker } from '../../../utils'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { Section, SectionTitle, Footer, FooterButton } from '../../commonStyles/Backoffice.style'
import { setSelectedRegulation } from '../Regulation.slice'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  const {
    regulatoryTopics,
    regulatoryLawTypes,
    seaFronts
  } = useSelector(state => state.regulatory)

  const { isModalOpen } = useSelector(state => state.regulation)

  /** @type {string} */
  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  /** @type {string} */
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  /** @type {string} */
  const [nameZone, setNameZone] = useState()
  /** @type {string} */
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  /** @type {[String]} */
  const [selectedRegionList, setSelectedRegionList] = useState([])
  /** @type {string} */
  const [reglementationBlocName, setReglementationBlocName] = useState('')
  /** @type {[regulatoryText]} */
  const [regulatoryTextList, setRegulatoryTextList] = useState([{}])

  useEffect(() => {
    if (regulatoryTopics && regulatoryLawTypes && seaFronts) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }
    const newRegulation = {
      regulatoryText: [],
      upcomingRegulation: [{}]
    }
    dispatch(setSelectedRegulation(newRegulation))
  }, [])

  const createRegulation = () => {
    // TODO : Check form values
    /** if (regulatoryTextHasMissingValue) {
      console.log('one value is missing somewhere ! ')
    } */
    console.log('createRegulation')
  }

  const saveAsDraft = () => {
    console.log('saveAsDraft')
  }

  return (
    <>
    <CreateRegulationWrapper>
      <Body>
        <Header>
          <LinkSpan><ChevronIcon/>
            <BackLink to={'/backoffice'}>Revenir à la liste complète des zones</BackLink>
          </LinkSpan>
          <Title>Saisir une nouvelle réglementation</Title>
          <Span />
        </Header>
        <ContentWrapper>
          <Content>
            <Section>
              <SectionTitle>
                identification de la zone réglementaire
              </SectionTitle>
              <RegulationBlocLine
                setSelectedValue={setSelectedReglementationBloc}
                selectedValue={selectedReglementationBloc}
                selectData={formatDataForSelectPicker(regulatoryTopics)}
                reglementationBlocName={reglementationBlocName}
                setReglementationBlocName={setReglementationBlocName}
              />
              <RegulationZoneThemeLine
                selectedReglementationTheme={selectedReglementationTheme}
                setSelectedReglementationTheme={setSelectedReglementationTheme}
                zoneThemeList={formatDataForSelectPicker(regulatoryLawTypes)}
              />
              <RegulationLayerZoneLine
                nameZone={nameZone}
                setNameZone={setNameZone}
              />
              <RegulationSeaFrontLine
                selectedSeaFront={selectedSeaFront}
                setSelectedSeaFront={setSelectedSeaFront}
                seaFrontList={formatDataForSelectPicker(seaFronts)}
              />
              <RegulationRegionLine
                setSelectedRegionList={setSelectedRegionList}
                selectedRegionList={selectedRegionList}
              />
            </Section>
          </Content>
          <Content>
            <RegulatoryTextSection
              regulatoryTextList={regulatoryTextList}
              setRegulatoryTextList={setRegulatoryTextList}
              source={'regulation'}
            />
          </Content>
        </ContentWrapper>
      </Body>
      <Footer>
        <FooterButton>
          <ValidateButton
            disabled={false}
            isLast={false}
            onClick={createRegulation}
          >
            Créer la réglementation
          </ValidateButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={saveAsDraft}
          >
            Enregistrer un brouillon
          </CancelButton>
        </FooterButton>
      </Footer>
    </CreateRegulationWrapper>
    {isModalOpen && <UpcomingRegulationModal />}
    </>
  )
}

const Body = styled.div`
  height: calc(100vh - 75px);
  overflow-y: scroll;
`

const Header = styled.div`
  display: flex;
  margin: 15px 27px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.background};
  height: 100vh;
`

const LinkSpan = styled.span`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  cursor: pointer;
`

const Span = styled.span`
  flex: 1;
`

const BackLink = styled(Link)`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.slateGray}!important;
  align-self: center;
  &:visited {
    color: ${COLORS.slateGray}!important;
  }
`

const Title = styled.span`
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(270deg);
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
`

const ContentWrapper = styled.div`
  padding: 40px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export default CreateRegulation
