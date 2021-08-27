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
  RegulationZoneNameLine,
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

  /** @type {String} */
  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  /** @type {String} */
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  /** @type {String} */
  const [nameZone, setNameZone] = useState()
  /** @type {String} */
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  /** @type {[String]} */
  const [selectedRegionList, setSelectedRegionList] = useState([])
  /** @type {String} */
  const [reglementationBlocName, setReglementationBlocName] = useState('')
  /** @type {[regulatoryText]} */
  const [regulatoryTextList, setRegulatoryTextList] = useState([{}])
  /** @type {Boolean} regulatoryTextHasMissingValue */
  const [regulatoryTextHasMissingValue, setRegulatoryTextHasValueMissing] = useState(false)

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
    if (regulatoryTextHasMissingValue) {
      console.log('one value is missing somewhere ! ')
    }
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
            <RegulationZoneNameLine
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
            setRegulatoryTextHasValueMissing={setRegulatoryTextHasValueMissing}
            source={'regulation'}
          />
        </Content>
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
  margin-bottom: 40px;
  margin-top: 20px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 11px 27px 11px 27px;
  background-color: ${COLORS.background};
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export default CreateRegulation
