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
  RegulationGeometryLine
} from './index'
import { COLORS } from '../../../constants/constants'
import { formatDataForSelectPicker } from '../../../utils'
import { setRegulatoryGeometryToPreview } from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

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
