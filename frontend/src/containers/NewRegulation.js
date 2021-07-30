import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import RegulationBlocLine from '../components/backoffice/create_regulation/RegulationBlocLine'
import RegulationZoneThemeLine from '../components/backoffice/create_regulation/RegulationZoneThemeLine'
import RegulationRegionLine from '../components/backoffice/create_regulation/RegulationRegionLine'
import RegulationZoneNameLine from '../components/backoffice/create_regulation/RegulationZoneNameLine'
import RegulationSeaFrontLine from '../components/backoffice/create_regulation/RegulationSeaFrontLine'
import RegulatoryTextSection from '../components/backoffice/create_regulation/RegulatoryTextSection'
import RegulatoryTextToComeModal from '../components/backoffice/create_regulation/RegulatoryTextToComeModal'
import { formatDataForSelectPicker, addTextToRegulatoryTextList } from '../utils'
import { ValidateButton, CancelButton } from '../components/commonStyles/Buttons.style'
import { Section, SectionTitle, Footer, FooterButton } from '../components/commonStyles/Backoffice.style'
import { setSelectedRegulation, setSelectedRegulatoryTextToComeId, setSelectedRegulatoryTextToCome } from '../domain/reducers/Regulation'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  const {
    regulationBlocArray,
    zoneThemeArray,
    seaFrontArray
  } = useSelector(state => state.regulatory)

  const {
    isModalOpen,
    selectedRegulatoryTextToCome,
    selectedRegulatoryTextToComeId
  } = useSelector(state => state.regulation)

  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [reglementationBlocName, setReglementationBlocName] = useState('')

  // TODO a typer
  const [regulatoryTextList, setRegulatoryTextList] = useState([{}])
  const [regulatoryTextToComeList, setRegulatoryTextToComeList] = useState([])

  useEffect(() => {
    if (regulationBlocArray && zoneThemeArray && seaFrontArray) {
      dispatch(getAllRegulatoryZonesByRegTerritory())
    }
    const newRegulation = {
      regulatoryText: [{}],
      regulatoryTextToCome: [{}]
    }
    dispatch(setSelectedRegulation(newRegulation))
  }, [])

  useEffect(() => {
    if (!isModalOpen && selectedRegulatoryTextToCome) {
      setRegulatoryTextToComeList(addTextToRegulatoryTextList(regulatoryTextToComeList, selectedRegulatoryTextToComeId, selectedRegulatoryTextToCome))
      setSelectedRegulatoryTextToCome(null)
      setSelectedRegulatoryTextToComeId(null)
    }
  }, [isModalOpen, selectedRegulatoryTextToCome])

  const createRegulation = () => {
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
          <LinkSpan><ChevronIcon/><Link>Revenir à la liste complète des zones</Link></LinkSpan>
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
              selectData={formatDataForSelectPicker(regulationBlocArray)}
              reglementationBlocName={reglementationBlocName}
              setReglementationBlocName={setReglementationBlocName}
            />
            <RegulationZoneThemeLine
              selectedReglementationTheme={selectedReglementationTheme}
              setSelectedReglementationTheme={setSelectedReglementationTheme}
              zoneThemeList={formatDataForSelectPicker(zoneThemeArray)}
            />
            <RegulationZoneNameLine
              nameZone={nameZone}
              setNameZone={setNameZone}
            />
            <RegulationSeaFrontLine
              selectedSeaFront={selectedSeaFront}
              setSelectedSeaFront={setSelectedSeaFront}
              seaFrontList={formatDataForSelectPicker(seaFrontArray)}
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
            regulatoryTextToComeList={regulatoryTextToComeList}
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
    {isModalOpen && <RegulatoryTextToComeModal />}
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

const Link = styled.a`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.textGray};
`
const Title = styled.span`
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.textGray};
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
