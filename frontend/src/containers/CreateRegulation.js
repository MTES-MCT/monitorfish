import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import { SelectPicker, Input, Radio, Checkbox } from 'rsuite'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import { BlackButton, WhiteButton } from '../components/commonStyles/Buttons.style'
import { ReactComponent as CloseIconSVG } from '../components/icons/Croix_grise.svg'

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
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [isAddReglementationBlocClicked, setIsAddReglementationBlocClicked] = useState(false)
  const [isAddThemeClicked, setIsAddThemeClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isZoneNameInfoTextShown, setIsZoneNameInfoTextShown] = useState(false)

  const [reglementationBlocName, setReglementationBlocName] = useState('')
  const [themeZone, setThemeZone] = useState('')
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

  const addNewReglementationBloc = () => {
    console.log('addNewReglementationBloc')
    setSelectedReglementationBloc(reglementationBlocName)
    setReglementationBlocName('')
    setIsAddReglementationBlocClicked(false)
  }

  const addNewTheme = () => {
    console.log('addNewTheme')
    setSelectedZoneTheme(`${themeZone} - ${themeSpecies} - ${themeGears} `)
    resetThemeForm()
    setIsAddThemeClicked(false)
  }

  const resetThemeForm = () => {
    setThemeGears('')
    setThemeSpecies('')
    setThemeGears('')
    setThemeOtherIndications('')
  }

  const selectPickerStyle = {
    width: 180,
    margin: '0',
    borderColor: COLORS.grayDarker,
    boxSizing: 'border-box',
    textOverflow: 'ellipsis'
  }

  const getInfoText = (messageType) => {
    return INFO_TEXT[messageType]
  }

  const renderMenuItem = (checked, item, tag) => {
    let component
    if (tag === 'Radio') {
      component = <Radio checked={checked}>{item.label}</Radio>
    } else if (tag === 'Checkbox') {
      component = <Checkbox checked={checked}>{item.label}</Checkbox>
    }
    return component
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
                placeholder='Choisir un ensemble'
                value={'Choisir un ensemble'}
                onChange={setSelectedReglementationBloc}
                data={reglementationBlocList}
                renderMenuItem={(_, item) => renderMenuItem(item.value === selectedReglementationBloc, item, 'Radio')}
              />
            </SelectWrapper>
            {selectedReglementationBloc
              ? <CustomTag>
                  <SelectedValue>{selectedReglementationBloc}</SelectedValue>
                  <CloseIcon onClick={() => setSelectedReglementationBloc()}/>
                </CustomTag>
              : null }
            {
              isAddReglementationBlocClicked
                ? <CreateReglementationBloc>
                  <CustomInput
                    placeholder='Nommez le nouvel ensemble règlementaire'
                    value={reglementationBlocName}
                    onChange={setReglementationBlocName}
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
                searchable={false}
                style={selectPickerStyle}
                menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
                placeholder='Choisir une thématique'
                value={'Choisir une thématique'}
                onChange={setSelectedZoneTheme}
                data={zoneThemeList}
                renderMenuItem={(_, item) => renderMenuItem(item.value === selectedZoneTheme, item, 'Radio')}
              />
            </SelectWrapper>
            {selectedZoneTheme
              ? <CustomTag>
                  <SelectedValue>{selectedZoneTheme}</SelectedValue>
                  <CloseIcon onClick={() => setSelectedZoneTheme()}/>
                </CustomTag>
              : null }
            {
              isAddThemeClicked
                ? <CreateReglementationBloc>
                  <CustomInput
                    placeholder='Lieu (obligatoire)'
                    value={themeZone}
                    onChange={setThemeZone}
                  />
                  <CustomInput
                    placeholder='Espèce (optionnel)'
                    value={themeSpecies}
                    onChange={setThemeSpecies}
                  />
                  <CustomInput
                    placeholder='Engins (optionnel)'
                    value={themeGears}
                    onChange={setThemeGears}
                  />
                  <CustomInput
                    placeholder='Autres indications (optionnel)'
                    value={themeOtherIndications}
                    onChange={setThemeOtherIndications}
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
                searchable={false}
                placeholder='Choisir une thématique'
                value={'Choisir une thématique'}
                onChange={setSelectedSeaFront}
                data={seaFrontList}
                renderMenuItem={(_, item) => renderMenuItem(item.value === selectedSeaFront, item, 'Radio')}
              />
            </SelectWrapper>
            {selectedSeaFront
              ? <CustomTag>
                  <SelectedValue>{selectedSeaFront}</SelectedValue>
                  <CloseIcon onClick={() => setSelectedSeaFront()}/>
                </CustomTag>
              : null }
          </ContentLine>
          <ContentLine>
            <Label>Région</Label>
            <SelectWrapper>
              <CustomSelectPicker
                menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
                style={selectPickerStyle}
                searchable={false}
                placeholder='Choisir une région'
                onChange={addRegionToSelectedRegionList}
                value={'Choisir une région'}
                data={formatData(FRENCH_REGION_LIST)}
                renderMenuItem={(_, item) => renderMenuItem(selectedRegionList.includes(item.value), item, 'Checkbox')}
                block
              />
            </SelectWrapper>
            <>
            {
            selectedRegionList && selectedRegionList.length > 0 &&
              <SelectedRegionList />
            }
            </>
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

const CustomTag = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #EDEDED;
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 2.5px;
`

// Pourrait être dans common car on l'utilise souvent
const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding: 2.5px 2.5px 2.5px 7px;
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
  a {
    box-sizing: border-box;
  }
`

const CustomInput = styled(Input)`
  font-size: 13px;
  width: 180px; 
  height: 35px;
  margin: 0px 10px 0px 0px;
  padding: 8px;
`
const SelectWrapper = styled.div`
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
