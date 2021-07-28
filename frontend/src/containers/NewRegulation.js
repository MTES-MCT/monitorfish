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
import { formatDataForSelectPicker } from '../utils'
import { ValidateButton, CancelButton } from '../components/commonStyles/Buttons.style'
import RegulationText from '../components/backoffice/RegulationText'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  const {
    regulationBlocArray,
    zoneThemeArray,
    seaFrontArray
  } = useSelector(state => state.regulatory)

  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [reglementationBlocName, setReglementationBlocName] = useState('')

  /*
  * List d'objests [
  *   {
  *     name:
  *     url:
  *     dateIn:
  *     dateOut:
  *   }
  * ]
  */
  const [regulationTextList, setRegulationTextList] = useState([{}])

  useEffect(() => {
    if (regulationBlocArray && zoneThemeArray && seaFrontArray) {
      dispatch(getAllRegulatoryZonesByRegTerritory())
    }
  }, [])

  const addRegRefEnVigueur = () => {
    updateRegulationText()
  }

  const addRegRefAVenir = () => {
    console.log('addRegRefAVenir')
    // display a modale
  }

  const createRegulation = () => {
    console.log('createRegulation')
  }

  const saveAsDraft = () => {
    console.log('saveAsDraft')
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

  return (
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
          <Section>
            <SectionTitle>
              références réglementaires en vigueur
            </SectionTitle>
          </Section>
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
            <ValidateButton
              disabled={false}
              isLast={false}
              onClick={addRegRefEnVigueur}>
              Ajouter un autre texte en vigueur
            </ValidateButton>
            <CustomCancelButton
              disabled={false}
              isLast={false}
              onClick={addRegRefAVenir}>
              Ajouter un texte à venir
            </CustomCancelButton>
          </ButtonLine>
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
  )
}

const Body = styled.div`
  height: calc(100vh - 75px);
  overflow-y: scroll;
`

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color:${COLORS.white};
  z-index: 100;
`

const FooterButton = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 15px 0;
`

const CustomCancelButton = styled(CancelButton)`
  margin: 0px;
`

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${COLORS.background};
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
const Section = styled.div`
  display: flex;
  flex-direction: column;
`
const SectionTitle = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.textGray};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${COLORS.grayDarker};
  margin-bottom: 20px;
`

export default CreateRegulation
