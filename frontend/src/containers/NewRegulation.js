import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import BaseMap from './BaseMap'
import { setRegulatoryGeometryToPreview } from '../domain/reducers/Regulatory'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import {
  RegulationBlocLine,
  RegulationZoneThemeLine,
  RegulationRegionLine,
  RegulationZoneNameLine,
  RegulationSeaFrontLine,
  RegulationGeometryLine
} from '../components/backoffice/create_regulation/index'
import { formatDataForSelectPicker } from '../utils'
import getGeometryWithoutRegulationReference from '../domain/use_cases/getGeometryWithoutRegulationReference'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  const {
    regulationBlocArray,
    zoneThemeArray,
    seaFrontArray
  } = useSelector(state => state.regulatory)

  const [geometryObjectList, setGeometryObjectList] = useState()
  const [geometryIdList, setGeometryIdList] = useState([])
  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedReglementationTheme, setSelectedReglementationTheme] = useState()
  const [nameZone, setNameZone] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [reglementationBlocName, setReglementationBlocName] = useState('')
  const [selectedGeometry, setSelectedGeometry] = useState()
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)

  useEffect(() => {
    if (regulationBlocArray && zoneThemeArray && seaFrontArray) {
      dispatch(getAllRegulatoryZonesByRegTerritory())
    }
    getGeometryId()
  }, [])

  useEffect(() => {
    if (geometryObjectList && selectedGeometry && showRegulatoryPreview) {
      dispatch(setRegulatoryGeometryToPreview(geometryObjectList[selectedGeometry]))
    }
  }, [selectedGeometry, geometryObjectList, showRegulatoryPreview])

  const getGeometryId = () => {
    dispatch(getGeometryWithoutRegulationReference())
      .then(geometryListAsObject => {
        console.log(geometryListAsObject)
        if (geometryListAsObject !== undefined) {
          setGeometryObjectList(geometryListAsObject)
          setGeometryIdList(formatDataForSelectPicker(Object.keys(geometryListAsObject)))
        }
      })
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
          <RegulationGeometryLine
            setSelectedGeometry={setSelectedGeometry}
            geometryIdList={geometryIdList}
            selectedGeometry={selectedGeometry}
            setShowRegulatoryPreview={setShowRegulatoryPreview}
            showRegulatoryPreview={showRegulatoryPreview}
          />
        </Section>
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
const Header = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  height: 100vh;
  margin: 11px 27px 0px 27px;
`

const LinkSpan = styled.span`
  display: flex;
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
