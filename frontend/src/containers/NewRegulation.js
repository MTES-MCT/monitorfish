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
import { ContentLine } from '../components/commonStyles/Backoffice.style'
import { Label, CustomInput } from '../components/commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../components/commonStyles/Buttons.style'

import { Checkbox, DatePicker } from 'rsuite'

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

  const [regulationText, setRegulatonText] = useState('')
  const [regulationTextURL, setRegulationTextURL] = useState('')

  useEffect(() => {
    if (regulationBlocArray && zoneThemeArray && seaFrontArray) {
      dispatch(getAllRegulatoryZonesByRegTerritory())
    }
  }, [])

  const addNewRegulationText = () => {
    console.log('que faire quand on valide ?')
  }

  const cancelAddNewRegulationText = () => {
    console.log('que faire quand on annule ?')
  }

  const addRegRefEnVigueur = () => {
    console.log('ajout en vigueur')
  }

  const addRegRefAVenir = () => {
    console.log('addRegRefAVenir')
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
            référenceS réglementaireS en vigueur
          </SectionTitle>
        </Section>
        <ContentLine>
          <Label>Texte réglementaire 1</Label>
          <CustomInput
            placeholder='Nom'
            value={regulationText}
            onChange={setRegulatonText}
          />
          <CustomInput
            placeholder='URL'
            value={regulationTextURL}
            onChange={setRegulationTextURL}
          />
          <ValidateButton
            disabled={false}
            isLast={false}
            onClick={addNewRegulationText}>
            Enregistrer
          </ValidateButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={cancelAddNewRegulationText}>
            Annuler
          </CancelButton>
        </ContentLine>
        <ContentLine>
          <Label>Type de texte</Label>
          <Checkbox>création de la zone</Checkbox>
          <Checkbox>réglementation de la zone</Checkbox>
        </ContentLine>
        <ContentLine>
          <Label>Début de validité</Label>
          <DatePicker placeholder="  /  /  " />
        </ContentLine>
        <ContentLine>
          <Label>Fin de validité</Label>
          <DatePicker placeholder="  /  /  " />
          ou
          <Checkbox>jusqu'à nouvel ordre</Checkbox>
        </ContentLine>
        <BottomLine>
          <ValidyDateLine>
            <ValidityDate>{'Valide du 01/03/2021 au 31/06/2021.'}</ValidityDate>
          </ValidyDateLine>
          <ButtonLine>
            <ValidateButton
              disabled={false}
              isLast={false}
              onClick={addRegRefEnVigueur}>
              Ajouter une référence reg. en vigueur
            </ValidateButton>
            <CancelButton
              disabled={false}
              isLast={false}
              onClick={addRegRefAVenir}>
              Ajouter une référence reg. à venir
            </CancelButton>
          </ButtonLine>
        </BottomLine>
      </Content>
    </CreateRegulationWrapper>
  )
}

const BottomLine = styled.div`
  display: flex;
  flex-direction: column;
`

const ValidityDate = styled.span`
  font-size: 13px;
`

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
`

const ValidyDateLine = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  width: 483px;
  background-color: ${COLORS.grayBackground};
`

const Header = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 11px 27px 0px 27px;
`

const LinkSpan = styled.span`
  display: flex;
  flex-direction: row;
  position: absolute;
  cursor: pointer;
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
