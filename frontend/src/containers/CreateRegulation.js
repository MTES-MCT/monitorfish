import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import ReglementationBlocLine from '../components/backoffice/create_reglementation/ReglementationBlocLine'
import RegulationZoneThemeLine from '../components/backoffice/create_reglementation/RegulationZoneThemeLine'
import RegulationRegionLine from '../components/backoffice/create_reglementation/RegulationRegionLine'
import RegulationZoneNameLine from '../components/backoffice/create_reglementation/RegulationZoneNameLine'
import RegulationThemeLine from '../components/backoffice/create_reglementation/RegulationThemeLine'
import { formatData } from '../components/backoffice/utils'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  // useRef ?
  const [reglementationBlocList, setReglementationBlocList] = useState([])
  // const [zoneThemeList, setZoneThemeList] = useState([])
  const [seaFrontList, setSeaFrontList] = useState([])

  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  // const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  // const [selectedRegionList, setSelectedRegionList] = useState([])
  // const [isAddReglementationBlocClicked, setIsAddReglementationBlocClicked] = useState(false)
  // const [isAddThemeClicked, setIsAddThemeClicked] = useState(false)
  // const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  // const [isZoneNameInfoTextShown, setIsZoneNameInfoTextShown] = useState(false)

  const [reglementationBlocName, setReglementationBlocName] = useState('')
  // const [reglementationBlocNameIsRed, setReglementationBlocNameIsRed] = useState(false)
  // const [themePlace] = useState('')
  // const [themePlaceIsRed, setThemePlaceIsRed] = useState(false)
  // const [themeGears, setThemeGears] = useState('')
  // const [themeSpecies, setThemeSpecies] = useState('')
  // const [themeOtherIndications, setThemeOtherIndications] = useState('')

  // à passer dans le state ?
  // Pourquoi un dispatch ici ?
  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByRegTerritory(dispatch))
      .then(response => {
        const {
          // zoneThemeArray,
          reglementationArray,
          seaFrontArray
        } = response
        setSeaFrontList(formatData(seaFrontArray))
        // setZoneThemeList(formatData(zoneThemeArray))
        setReglementationBlocList(formatData(reglementationArray))
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }

  useEffect(() => {
    getRegulatoryZones()
  }, [])

  /* const addNewTheme = (elem) => {
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
  } */

  /* const resetThemeForm = () => {
    setThemeGears('')
    setThemeSpecies('')
    setThemeGears('')
    setThemeOtherIndications('')
  } */

  /* const getInfoText = (messageType) => {
    return INFO_TEXT[messageType]
  } */
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
            setSelectedValue={setSelectedReglementationBloc}
            selectedValue={selectedReglementationBloc}
            selectData={reglementationBlocList}
            reglementationBlocName={reglementationBlocName}
            setReglementationBlocName={setReglementationBlocName}
          />
          <RegulationZoneThemeLine />
          <RegulationZoneNameLine
            nameZone={nameZone}
            setNameZone={setNameZone}
          />
          <RegulationThemeLine
            selectedSeaFront={selectedSeaFront}
            setSelectedSeaFront={setSelectedSeaFront}
            seaFrontList={seaFrontList}
          />
          <RegulationRegionLine />
        </Section>
      </Content>
    </CreateRegulationWrapper>
  )
}

/* const Wrapper = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`
 */

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
