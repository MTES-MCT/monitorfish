import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import BaseMap from './../../map/BaseMap'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import {
  RegulationBlocLine,
  RegulationZoneThemeLine,
  RegulationRegionLine,
  RegulationZoneNameLine,
  RegulationSeaFrontLine,
  RegulationGeometryLine,
  RegulationText
} from './index'
import { COLORS } from '../../../constants/constants'
import { formatDataForSelectPicker } from '../../../utils'
import { setRegulatoryGeometryToPreview } from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  const {
    regulatoryLawTypes,
    regulatoryTopics,
    seaFronts
  } = useSelector(state => state.regulatory)

  const [geometryObjectList, setGeometryObjectList] = useState()
  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [reglementationBlocName, setReglementationBlocName] = useState('')
  const [selectedGeometry, setSelectedGeometry] = useState()
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])

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
    if (regulatoryLawTypes && regulatoryTopics && seaFronts) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }
    getGeometryObjectList()
  }, [])

  useEffect(() => {
    if (geometryObjectList && selectedGeometry && showRegulatoryPreview) {
      dispatch(setRegulatoryGeometryToPreview(geometryObjectList[selectedGeometry]))
    }
  }, [selectedGeometry, geometryObjectList, showRegulatoryPreview])

  const getGeometryObjectList = () => {
    dispatch(getGeometryWithoutRegulationReference())
      .then(geometryListAsObject => {
        if (geometryListAsObject !== undefined) {
          setGeometryObjectList(geometryListAsObject)
        }
      })
  }

  const addRegRefEnVigueur = () => {
    updateRegulationText()
  }

  const addRegRefAVenir = () => {
    console.log('addRegRefAVenir')
    // display a modale
  }

  const updateRegulationText = (id, regulationText) => {
    let newRegulationTextList = [...regulationTextList]
    if (id === undefined) {
      newRegulationTextList.push(regulationText)
    } else {
      if (regulationText && regulationText !== {}) {
        newRegulationTextList[id] = regulationText
      } else {
        if (newRegulationTextList.length === 1) {
          newRegulationTextList = {}
        } else {
          newRegulationTextList.slice(id, 1)
        }
      }
    }
    setRegulationTextList(newRegulationTextList)
  }

  return (
    <Wrapper>
    <CreateRegulationWrapper>
      <Header>
        <Title>Saisir une nouvelle réglementation</Title>
        <LinkSpan><ChevronIcon/><Link>Revenir à la liste complète des zones</Link></LinkSpan>
      </Header>
      <Content>
        <Section>
          <SectionTitle>
            identification de la zone réglementaire
          </SectionTitle>
          <RegulationBlocLine
            setSelectedValue={setSelectedReglementationBloc}
            selectedValue={selectedReglementationBloc}
            selectData={formatDataForSelectPicker(regulatoryLawTypes)}
            reglementationBlocName={reglementationBlocName}
            setReglementationBlocName={setReglementationBlocName}
          />
          <RegulationZoneThemeLine
            selectedReglementationTheme={selectedReglementationTheme}
            setSelectedReglementationTheme={setSelectedReglementationTheme}
            zoneThemeList={formatDataForSelectPicker(regulatoryTopics)}
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
          <RegulationGeometryLine
            setSelectedGeometry={setSelectedGeometry}
            geometryIdList={geometryIdList}
            selectedGeometry={selectedGeometry}
            setShowRegulatoryPreview={setShowRegulatoryPreview}
            showRegulatoryPreview={showRegulatoryPreview}
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
                  id={id}
                  regulationText={regulationText}
                  updateRegulationText={updateRegulationText}
                />
            })
            : <RegulationText
                updateRegulationText={updateRegulationText}
              />
        }
        <BottomLine>
          <ButtonLine>
            <ValidateButton
              disabled={false}
              isLast={false}
              onClick={addRegRefEnVigueur}>
              Ajouter une référence reg. en vigueur
            </ValidateButton>
            <CustomCancelButton
              disabled={false}
              isLast={false}
              onClick={addRegRefAVenir}>
              Ajouter une référence reg. à venir
            </CustomCancelButton>
          </ButtonLine>
        </BottomLine>
      </Content>
    </CreateRegulationWrapper>
    { showRegulatoryPreview && <BaseMap />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const CustomCancelButton = styled(CancelButton)`
  margin: 0px;
`
const BottomLine = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
`

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 10px;
  background-color: ${COLORS.background};
`

const Header = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  height: 100vh;
  padding: 11px 27px 0px 27px;
  background-color: ${COLORS.background};
`

const LinkSpan = styled.span`
  display: flex;
  cursor: pointer;
`

const Link = styled.a`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.gunMetal};
`
const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.gunMetal};
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
  color: ${COLORS.gunMetal};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 20px;
`

export default CreateRegulation
