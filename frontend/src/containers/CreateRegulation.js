import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import ReglementationBlocLine from '../components/backoffice/create_reglementation/ReglementationBlocLine'
import RegulationZoneThemeLine from '../component/backoffice/create_reglementation/RegulationZoneThemeLine'
import RegulationRegionLine from '../components/backoffice/create_reglementation/RegulationRegionLine'
import RegulationZoneNameLine from '../components/backoffice/create_reglementation/RegulationZoneNameLine'
import RegulationThemeLine from '../components/backoffice/create_reglementation/RegulationThemeLine'

const INFO_TEXT = {
  zoneName: `De mme que pour les thmatiques, le nom des zones doit être aussi explicite que possible. 
  Le couple thmatique / zone fonctionne comme un tout, qui permet à l'utilisateur de comprendre rapidement
   quelle rglementation il consulte. Le nom de la zone peut tre - un nom gographique 
   ("Ile-Rousse", ou "Bande des 3 miles"), - ou numérique ("Zone 1"), - ou encore spcifiant une autre caractristique 
   ("Zone d'autorisation ponctuelle", ou "Zone pour navire > 10m")`,
  zoneTheme: `Avant de créer une nouvelle thématique, vérifiez bien qu'il n'en existe pas déjà une qui pourrait correspondre. 
  Le nom de la thématique doit permettre de connaître en un coup d'œil le lieu et le sujet de la réglementation : 
  des espèces, et/ou des engins, et/ou d'autres points réglementaires spécifiques. 
  Il peut être intéressant notamment de mentionner si la zone est totalement 
  interdite à la pêche avec le mot "interdiction". 
  NB : le lieu indiqué peut être une façade maritime (NAMO), une région (Bretagne), un département (Vendée), 
  une commune (Saint-Malo), une zone géographique (Cotentin), une mer (Mer Baltique), 
  un secteur européen (Ouest-Écosse-Rockhall)...`
}

const CreateRegulation = () => {
  const dispatch = useDispatch()
  // useRef ?
  const [reglementationBlocList, setReglementationBlocList] = useState([])
  const [zoneThemeList, setZoneThemeList] = useState([])
  const [seaFrontList, setSeaFrontList] = useState([])

  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [isAddReglementationBlocClicked, setIsAddReglementationBlocClicked] = useState(false)
  const [isAddThemeClicked, setIsAddThemeClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isZoneNameInfoTextShown, setIsZoneNameInfoTextShown] = useState(false)

  const [reglementationBlocName, setReglementationBlocName] = useState('')
  const [reglementationBlocNameIsRed, setReglementationBlocNameIsRed] = useState(false)
  const [themePlace, setThemePlace] = useState('')
  const [themePlaceIsRed, setThemePlaceIsRed] = useState(false)
  const [themeGears, setThemeGears] = useState('')
  const [themeSpecies, setThemeSpecies] = useState('')
  const [themeOtherIndications, setThemeOtherIndications] = useState('')

  const FRENCH_REGION_LIST = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Ile-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d’Azur'
  ]

  // à passer dans le state ?
  // Pourquoi un dispatch ici ?
  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByRegTerritory(dispatch))
      .then(response => {
        const {
          zoneThemeArray,
          reglementationArray,
          seaFrontArray
        } = response
        setSeaFrontList(formatData(seaFrontArray))
        setZoneThemeList(formatData(zoneThemeArray))
        setReglementationBlocList(formatData(reglementationArray))
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }

  useEffect(() => {
    getRegulatoryZones()
  }, [])

  const formatData = list => {
    const array = list.map(e => {
      const obj = {
        label: e,
        value: e
      }
      return obj
    })
    return array
  }

  const addNewTheme = (elem) => {
    if (themePlace === '') {
      setThemePlaceIsRed(true)
    } else {
      const reglementationPlace = `${themePlace}
      ${themeSpecies ? ' - ' + themeSpecies : ''}
      ${themeGears ? ' - ' + themeGears : ''}`
      setSelectedReglementationTheme(reglementationPlace)
      resetThemeForm()
      setIsAddThemeClicked(false)
      setThemePlaceIsRed(false)
    }
  }

  const resetThemeForm = () => {
    setThemeGears('')
    setThemeSpecies('')
    setThemeGears('')
    setThemeOtherIndications('')
  }

  const getInfoText = (messageType) => {
    return INFO_TEXT[messageType]
  }

  const addRegionToSelectedRegionList = (elem) => {
    const newArray = [...selectedRegionList]
    newArray.push(elem)
    setSelectedRegionList(newArray)
  }

  const removeRegionToSelectedRegionList = (elem) => {
    const idx = selectedRegionList.find(e => elem === e)
    const newArray = [...selectedRegionList]
    newArray.splice(idx, 1)
    setSelectedRegionList(newArray)
  }

  function SelectedRegionList () {
    return selectedRegionList.map(selectedRegion => {
      return (<CustomTag key={selectedRegion}>
        <SelectedValue>{selectedRegion}</SelectedValue>
        <CloseIcon onClick={removeRegionToSelectedRegionList}/>
      </CustomTag>)
    })
  }

  const displayInfoBox = (isInfoTextShown, setIsInfoTextShown, isFormOpened, text) => {
    return (<InfoTextParent
              isInfoTextShown={isInfoTextShown}
              isFormOpened={isFormOpened}
        >
        {isInfoTextShown
          ? <InfoTextWrapper
            isFormOpened={isFormOpened}
          >
            <InfoPoint>!</InfoPoint>
            <InfoText>
              {getInfoText(text)}
            </InfoText>
          </InfoTextWrapper>
          : <InfoPoint
            onMouseEnter={() => setIsInfoTextShown(true)}
            onMouseOut={() => setIsInfoTextShown(true)}
          >!</InfoPoint>}
      </InfoTextParent>)
  }

  return (
    <CreateRegulationWrapper>
      <Header>
        <LinkSpan><ChevronIcon/><Link>Revenir à la liste complète des zones</Link></LinkSpan>
        <Title>Saisir une nouvelle réglementation</Title>
      </Header>
      <Content>
        <Section>
          <SectionTitle>
            identification de la zone réglementaire
          </SectionTitle>
          <ReglementationBlocLine
            setSelectedValue={selectedReglementationBloc}
            selectedValue={setSelectedReglementationBloc}
            selectData={reglementationBlocList}
            reglementationBlocName={reglementationBlocName}
            setReglementationBlocName={setReglementationBlocName}
          />
          <RegulationZoneThemeLine />
          <RegulationZoneNameLine />
          <RegulationThemeLine />
          <RegulationRegionLine />
        </Section>
      </Content>
    </CreateRegulationWrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`

const InfoTextParent = styled.div`
  display: flex;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  ${props => props.isFormOpened && props.isInfoTextShown ? 'left: 352px' : ''};
`

const InfoTextWrapper = styled.div`
  display: flex;
  ${props => props.isFormOpened ? '' : 'position: absolute;'};
  border: 1px solid ${COLORS.grayDarker};
  background: ${COLORS.grayBackground} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  min-width: 560px;
  max-width: 600px;
  padding: 8px;
  box-sizing: border-box;
  z-index: 30;
  top: '-6px';
  left: '0';
`

const InfoText = styled.span`
  align-self: center;
  display: 'flex';
  font-size: 13px;
  color: ${COLORS.textGray};
  padding-left: 8px;
`

const InfoPoint = styled.a`
  display: inline-block;
  align-self: start;
  min-height: 20px;
  min-width: 20px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: ${COLORS.grayDarkerThree} 0% 0% no-repeat padding-box;
  color: ${COLORS.grayBackground};
  text-align: center;
  font: normal normal bold 13px Arial;
  text-align: center;
  line-height: 20px;
  &:hover {
    text-decoration: none;
    color: ${COLORS.grayBackground};
  }
  &:focus {
    text-decoration: none;
    color: ${COLORS.grayBackground};
  }
`

const Header = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 15px 45px 0px 45px;
`

const LinkSpan = styled.span`
  display: flex;
  flex-direction: row;
  position: absolute;
`

const Link = styled.a`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.textGray};
`
const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.textGray};
  text-transform: uppercase;
  left: 50%;
  position: relative;
  margin-left: -168px;
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
