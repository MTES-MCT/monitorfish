import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import { SelectPicker, Input } from 'rsuite'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import { BlackButton, WhiteButton } from '../components/commonStyles/Buttons.style'

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
  const [selectedZoneTheme, setSelectedZoneTheme] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedRegion, setSelectedRegion] = useState()
  const [isAddReglementationBlocClicked, setIsAddReglementationBlocClicked] = useState(false)
  const [isAddThemeClicked, setIsAddThemeClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isZoneNameInfoTextShown, setIsZoneNameInfoTextShown] = useState(false)

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

  const addNewReglementationBloc = () => {
    console.log('addNewReglementationBloc')
  }

  const addNewTheme = () => {
    console.log('addNewTheme')
  }

  const selectPickerStyle = {
    width: 180,
    margin: '0',
    'border-color': COLORS.grayDarker,
    'box-sizing': 'border-box'
  }

  const getInfoText = (messageType) => {
    return INFO_TEXT[messageType]
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
          <ContentLine>
            <Label>Ensemble règlementaire</Label>
            <SelectWrapper>
              <CustomSelectPicker
                style={selectPickerStyle}
                searchable={false}
                placeholder=" Choisir un ensemble "
                value={selectedReglementationBloc}
                onChange={setSelectedReglementationBloc}
                data={reglementationBlocList}
              />
            </SelectWrapper>
            {
              isAddReglementationBlocClicked
                ? <CreateReglementationBloc>
                  <CustomInput
                    placeholder='Nommez le nouvel ensemble règlementaire'
                    value={nameZone}
                    onChange={setNameZone}
                  />
                  <ValidateButton
                    disabled={false}
                    isLast={false}
                    onClick={addNewReglementationBloc}>
                    Enregistrer
                  </ValidateButton>
                  <CancelButton
                    disabled={false}
                    isLast={false}
                    onClick={() => setIsAddReglementationBlocClicked(false)}>
                    Annuler
                  </CancelButton>
                </CreateReglementationBloc>
                : <><RectangularButton
                    onClick={() => setIsAddReglementationBlocClicked(true)}
                  />
                  <Label>Ajouter un nouvel ensemble</Label></>
          }
          </ContentLine>
          <ContentLine>
            <Label>Thématique de la zone</Label>
            <SelectWrapper>
              <CustomSelectPicker
                searchable={true}
                style={selectPickerStyle}
                placeholder=" Choisir une thématique "
                value={selectedZoneTheme}
                onChange={setSelectedZoneTheme}
                data={zoneThemeList}
              />
            </SelectWrapper>
            {
              isAddThemeClicked
                ? <CreateReglementationBloc>
                  <CustomInput
                    placeholder='Lieu (obligatoire)'
                    value={nameZone}
                    onChange={setNameZone}
                  />
                  <CustomInput
                    placeholder='Espèce (optionnel)'
                    value={nameZone}
                    onChange={setNameZone}
                  />
                  <CustomInput
                    placeholder='Engins (optionnel)'
                    value={nameZone}
                    onChange={setNameZone}
                  />
                  <CustomInput
                    placeholder='Autres indications (optionnel)'
                    value={nameZone}
                    onChange={setNameZone}
                  />
                  <ValidateButton
                    disabled={false}
                    isLast={false}
                    onClick={addNewTheme}>
                    Enregistrer
                  </ValidateButton>
                  <CancelButton
                    disabled={false}
                    isLast={false}
                    onClick={() => setIsAddThemeClicked(false)}>
                    Annuler
                  </CancelButton>
                </CreateReglementationBloc>
                : <><RectangularButton
                    onClick={() => setIsAddThemeClicked(true)}
                  />
                  <Label>Créer une nouvelle thématique</Label></>
            }
          <InfoTextParent>
              {isInfoTextShown
                ? <InfoTextWrapper >
                    <InfoPoint>!</InfoPoint>
                    <InfoText
                      onMouseLeave={() => setIsInfoTextShown(false)}
                    >
                      {getInfoText('zoneTheme')}
                    </InfoText>
                  </InfoTextWrapper>
                : <InfoPoint
                  onMouseEnter={() => setIsInfoTextShown(true)}
                  onMouseOut={() => setIsInfoTextShown(true)}
                >!</InfoPoint>
              }
            </InfoTextParent>
          </ContentLine>
          <ContentLine>
            <Label>Nom de la zone</Label>
            <CustomInput
              placeholder=''
              value={nameZone}
              onChange={setNameZone}
            />
            <InfoTextParent>
              {isZoneNameInfoTextShown
                ? <InfoTextWrapper >
                    <InfoPoint>!</InfoPoint>
                    <InfoText
                      onMouseLeave={() => setIsZoneNameInfoTextShown(false)}
                    >
                      {getInfoText('zoneName')}
                    </InfoText>
                  </InfoTextWrapper>
                : <InfoPoint
                  onMouseEnter={() => setIsZoneNameInfoTextShown(true)}
                >!</InfoPoint>
              }
            </InfoTextParent>
          </ContentLine>
          <ContentLine>
            <Label>Secteur</Label>
            <SelectWrapper>
              <CustomSelectPicker
                style={selectPickerStyle}
                searchable={true}
                placeholder=" Choisir une thématique "
                value={selectedSeaFront}
                onChange={setSelectedSeaFront}
                data={seaFrontList}
              />
            </SelectWrapper>
          </ContentLine>
          <ContentLine>
            <Label>Région</Label>
            <SelectWrapper>
              <CustomSelectPicker
                style={selectPickerStyle}
                searchable={false}
                placeholder=" Choisir une région "
                value={selectedRegion}
                onChange={setSelectedRegion}
                data={formatData(FRENCH_REGION_LIST)}
              />
            </SelectWrapper>
          </ContentLine>
        </Section>
      </Content>
    </CreateRegulationWrapper>
  )
}

const InfoTextParent = styled.div`
  min-height: 20px;
  min-width: 20px;
  position: relative;
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

const InfoTextWrapper = styled.div`
  display: flex;
  position: absolute;
  border: 1px solid ${COLORS.grayDarker};
  background: ${COLORS.grayBackground} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  min-width: 560px;
  max-width: 600px;
  padding: 8px;
  box-sizing: border-box;
  z-index: 30;
  top: -6px;
  left: 0;
`

const InfoText = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  padding-left: 8px;
`

const Header = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
`

const ValidateButton = styled(BlackButton)`
  margin: 0px 10px 0px 0px;
`

const CancelButton = styled(WhiteButton)`
  margin: 0px 10px 0px 0px;
`

const CreateReglementationBloc = styled.div`
  display:flex;
  align-items: center;
  justify-content: space-between;
`

const CustomSelectPicker = styled(SelectPicker)`
  width: 180;
  margin: '0';
  border-color: ${COLORS.grayDarker};
  box-sizing: border-box;
  a {
    box-sizing: border-box;
  }
`
const CustomInput = styled(Input)`
  font-size: 13px;
  width: 180px; 
  height: 35px;
  margin: 0px 10px 0px 0px;
`
const SelectWrapper = styled.div`
  width: 180px;
  display: inline-block;
  margin: 0px 10px 0px 0px;
  vertical-align: sub;
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
const ContentLine = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  margin-bottom: 8px;
`
const Label = styled.span`
  text-align: left;
  color: ${COLORS.textGray};
  min-width: 154px;
  font-size: 13px;
  margin-right: 8px;
`
const RectangularButton = styled.a`
  position: relative;
  width: 35px;
  height: 35px;
  border: 1px solid ${COLORS.grayDarker};
  border-radius: 2px;
  color: ${COLORS.grayDarker};
  margin-right: 8px;

  &:after {
    content: "";  
    display: block;
    background-color: ${COLORS.grayDarker};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:before {
    content: "";  
    display: block;
    background-color: ${COLORS.grayDarker};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:before {
    height: 15px;
    width: 1.5px;
  }
  &:after {
    height: 1.5px;
    width: 15px;
  }
`

export default CreateRegulation
