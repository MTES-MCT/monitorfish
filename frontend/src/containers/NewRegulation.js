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
  const [regulationTextList, setRegulationTextList] = useState('')

  useEffect(() => {
    if (regulationBlocArray && zoneThemeArray && seaFrontArray) {
      dispatch(getAllRegulatoryZonesByRegTerritory())
    }
  }, [])

  const addRegRefEnVigueur = () => {
    console.log('ajout en vigueur')
  }

  const addRegRefAVenir = () => {
    console.log('addRegRefAVenir')
  }

  const updateRegulationText = (id, regulationText) => {
    const newRegulationTextList = Object.slice({}, regulationTextList)
    if (!id) {
      newRegulationTextList.append(regulationText)
    } else {
      newRegulationTextList[id] = regulationText
    }
    setRegulationTextList(newRegulationTextList)
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
            références réglementaires en vigueur
          </SectionTitle>
        </Section>
        {
          regulationTextList && regulationTextList.length > 0
            ? regulationTextList.map((regulationText, id) => {
              return <RegulationText
                  key={id}
                  isEmpty={false}
                  regulationText={regulationText}
                />
            })
            : <RegulationText
                isEmpty={true}
                updateRegulationText={updateRegulationText}
              />
        }
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
