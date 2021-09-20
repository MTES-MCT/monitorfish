import React, { useEffect, useMemo, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch, useSelector, batch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import {
  RegulationGeometryLine,
  RegulationLawTypeLine,
  RegulationLayerZoneLine,
  RegulationRegionLine,
  RegulationSeaFrontLine,
  RegulationTopicLine,
  RegulatoryTextSection,
  UpcomingRegulationModal
} from './'
import BaseMap from '../../map/BaseMap'
import createOrUpdateRegulationInGeoserver from '../../../domain/use_cases/createOrUpdateRegulationInGeoserver'
import Layers from '../../../domain/entities/layers'

// A déplacer ?
import { setRegulatoryGeometryToPreview } from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

import { formatDataForSelectPicker } from '../../../utils'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { setSelectedRegulation, setRegulationSaved, setRegulatoryTextListValidityMap } from '../Regulation.slice'
import Feature from 'ol/Feature'

const CreateRegulation = ({ title, isEdition }) => {
  const dispatch = useDispatch()
  const {
    regulatoryTopics,
    regulatoryLawTypes,
    seaFronts,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const {
    isModalOpen,
    regulationSaved
  } = useSelector(state => state.regulation)

  /** @type {string} */
  const [selectedRegulationLawType, setSelectedRegulationLawType] = useState()
  const [lawTypeIsMissing, setLawTypeIsMissing] = useState(false)
  /** @type {string} */
  const [selectedRegulationTopic, setSelectedRegulationTopic] = useState()
  const [regulationTopicIsMissing, setRegulationTopicIsMissing] = useState(false)
  /** @type {string} */
  const [nameZone, setNameZone] = useState()
  const [nameZoneIsMissing, setNameZoneIsMissing] = useState()
  /** @type {string} */
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [seaFrontIsMissing, setSeaFrontIsMissing] = useState(false)
  /** @type {[String]} */
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [regionIsMissing, setRegionIsMissing] = useState(false)
  /** @type {[regulatoryText]} */
  const [regulatoryTextList, setRegulatoryTextList] = useState([{}])
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  /** @type {GeoJSONGeometry} selectedGeometry */
  const [selectedGeometryId, setSelectedGeometry] = useState()
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {[Number]} geometryIdList */
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])

  const [saveOrUpdateRegulation, setSaveOrUpdateRegulation] = useState(false)
  const { regulatoryTextListValidityMap } = useSelector(state => state.regulation)
  const [atLeastOneValueIsMissing, setAtLeastOneValueIsMissing] = useState(undefined)

  let originalGeometryId = null

  useEffect(() => {
    if (regulatoryTopics && regulatoryLawTypes && seaFronts) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }
    const newRegulation = {
      regulatoryText: [],
      upcomingRegulation: [{}]
    }
    getGeometryObjectList()
    dispatch(setSelectedRegulation(newRegulation))
  }, [])

  useEffect(() => {
    if (isEdition && regulatoryZoneMetadata) {
      initForm()
    }
  }, [isEdition, regulatoryZoneMetadata])

  const history = useHistory()
  useEffect(() => {
    if (regulationSaved) {
      history.push('/backoffice')
    }
    batch(() => {
      dispatch(setRegulationSaved(false))
      dispatch(setSelectedRegulation({}))
    })
  }, [regulationSaved])

  useEffect(() => {
    if (regulatoryTextListValidityMap) {
      const values = Object.values(regulatoryTextListValidityMap)
      if (saveOrUpdateRegulation && values.length > 0 && values.length === regulatoryTextList.length) {
        if (!values.includes(false) && atLeastOneValueIsMissing) {
          createOrUpdateRegulation()
        }
        dispatch(setRegulatoryTextListValidityMap({}))
        setSaveOrUpdateRegulation(false)
      }
    }
  }, [saveOrUpdateRegulation, regulatoryTextListValidityMap, atLeastOneValueIsMissing])

  const initForm = () => {
    setSelectedRegulationLawType(`${regulatoryZoneMetadata.lawType} / ${regulatoryZoneMetadata.seafront}`)
    setSelectedRegulationTopic(regulatoryZoneMetadata.topic)
    setNameZone(regulatoryZoneMetadata.zone)
    setSelectedRegionList(regulatoryZoneMetadata.region.split(', '))
    setSelectedSeaFront(regulatoryZoneMetadata.seafront)
    setRegulatoryTextList(JSON.parse(regulatoryZoneMetadata.regulatoryReferences))
    setSelectedGeometry(regulatoryZoneMetadata.id)
    originalGeometryId = regulatoryZoneMetadata.id
  }

  const checkRequiredValues = () => {
    let atLeastOneValueIsMissing = false
    let valueIsMissing = !(selectedRegulationLawType && selectedRegulationLawType !== '')
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    setLawTypeIsMissing(valueIsMissing)
    valueIsMissing = !(selectedRegulationTopic && selectedRegulationTopic !== '')
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    setRegulationTopicIsMissing(valueIsMissing)
    valueIsMissing = !(nameZone && nameZone !== '')
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    setNameZoneIsMissing(valueIsMissing)
    valueIsMissing = !(selectedSeaFront && selectedSeaFront !== '')
    atLeastOneValueIsMissing = atLeastOneValueIsMissing && valueIsMissing
    setSeaFrontIsMissing(valueIsMissing)
    valueIsMissing = !(selectedRegionList && selectedRegionList.length !== 0)
    atLeastOneValueIsMissing = atLeastOneValueIsMissing && valueIsMissing
    setRegionIsMissing(valueIsMissing)
    valueIsMissing = !(geometryIsMissing && geometryIsMissing !== '')
    atLeastOneValueIsMissing = atLeastOneValueIsMissing && valueIsMissing
    setGeometryIsMissing(valueIsMissing)
    setAtLeastOneValueIsMissing(!atLeastOneValueIsMissing)
  }

  useEffect(() => {
    if (geometryObjectList && selectedGeometryId && showRegulatoryPreview) {
      dispatch(setRegulatoryGeometryToPreview(geometryObjectList[selectedGeometryId] ? geometryObjectList[selectedGeometryId] : regulatoryZoneMetadata.geometry))
    }
  }, [selectedGeometryId, geometryObjectList, showRegulatoryPreview])

  const getGeometryObjectList = () => {
    dispatch(getGeometryWithoutRegulationReference())
      .then(geometryListAsObject => {
        if (geometryListAsObject !== undefined) {
          setGeometryObjectList(geometryListAsObject)
        }
      })
  }

  const formatRegionList = (list) => {
    let regionListAsString = ''
    list.map((region, id) => {
      regionListAsString += region
      if (id < selectedRegionList.length - 1) {
        regionListAsString += ', '
      }
      return regionListAsString
    })
    return regionListAsString
  }
  const createOrUpdateRegulation = () => {
    let featureObject = {
      layer_name: selectedRegulationTopic,
      law_type: selectedRegulationLawType.split(' /')[0],
      zones: nameZone,
      region: formatRegionList(selectedRegionList),
      facade: selectedSeaFront,
      references_reglementaires: JSON.stringify(regulatoryTextList)
    }
    const feature = new Feature(featureObject)
    feature.setId(`${Layers.REGULATORY.code}.${selectedGeometryId}`)

    const actionType = isEdition ? 'update' : 'insert'
    dispatch(createOrUpdateRegulationInGeoserver(feature, actionType))
    if (originalGeometryId && originalGeometryId !== selectedGeometryId) {
      featureObject = new Feature({
        layer_name: null,
        law_type: null,
        zones: null,
        region: null,
        seafront: null,
        regulatoryTextList: null
      })
      feature.setId(`${Layers.REGULATORY.code}.${originalGeometryId}`)
      dispatch(createOrUpdateRegulationInGeoserver(feature, 'update'))
    }
  }

  const saveAsDraft = () => {
    console.log('saveAsDraft')
  }

  return (
    <>
    <Wrapper>
      <CreateRegulationWrapper>
        <Body>
          <Header>
            <LinkSpan><ChevronIcon/>
              <BackLink to={'/backoffice'}>Revenir à la liste complète des zones</BackLink>
            </LinkSpan>
            <HeaderTitle>{title}</HeaderTitle>
            <Span />
          </Header>
          <ContentWrapper>
            <Content>
              <Section>
                <SectionTitle>
                  identification de la zone réglementaire
                </SectionTitle>
                <RegulationLawTypeLine
                  setSelectedValue={setSelectedRegulationLawType}
                  selectedValue={selectedRegulationLawType}
                  selectData={formatDataForSelectPicker(regulatoryLawTypes)}
                  lawTypeIsMissing={lawTypeIsMissing}
                />
                <RegulationTopicLine
                  selectedRegulationTopic={selectedRegulationTopic}
                  setSelectedRegulationTopic={setSelectedRegulationTopic}
                  zoneThemeList={formatDataForSelectPicker(regulatoryTopics)}
                  regulationTopicIsMissing={regulationTopicIsMissing}
                />
                <RegulationLayerZoneLine
                  nameZone={nameZone}
                  setNameZone={setNameZone}
                  nameZoneIsMissing={nameZoneIsMissing}
                />
                <RegulationSeaFrontLine
                  selectedSeaFront={selectedSeaFront}
                  setSelectedSeaFront={setSelectedSeaFront}
                  seaFrontList={formatDataForSelectPicker(seaFronts)}
                  seaFrontIsMissing={seaFrontIsMissing}
                />
                <RegulationRegionLine
                  setSelectedRegionList={setSelectedRegionList}
                  selectedRegionList={selectedRegionList}
                  regionIsMissing={regionIsMissing}
                />
                <RegulationGeometryLine
                  setSelectedGeometry={setSelectedGeometry}
                  geometryIdList={geometryIdList}
                  selectedGeometry={selectedGeometryId}
                  setShowRegulatoryPreview={setShowRegulatoryPreview}
                  showRegulatoryPreview={showRegulatoryPreview}
                  geometryIsMissing={geometryIsMissing}
                />
              </Section>
            </Content>
            <Content>
              <RegulatoryTextSection
                regulatoryTextList={regulatoryTextList}
                setRegulatoryTextList={setRegulatoryTextList}
                source={'regulation'}
                saveForm={saveOrUpdateRegulation}
              />
            </Content>
          </ContentWrapper>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton
              disabled={false}
              isLast={false}
              onClick={() => {
                checkRequiredValues()
                setSaveOrUpdateRegulation(true)
              }}
            >
            { isEdition
              ? 'Enregister les modifications'
              : 'Créer la réglementation'
            }
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
    { showRegulatoryPreview && <BaseMap />}
    </Wrapper>
    {isModalOpen && <UpcomingRegulationModal />}
    </>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const Body = styled.div`
  height: calc(100vh - 75px);
  overflow-y: scroll;
`

const Header = styled.div`
  display: flex;
  margin: 15px 27px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  padding: 11px 27px 11px 27px;
  background-color: ${COLORS.background};
  height: 100vh;
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

const BackLink = styled(Link)`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.slateGray}!important;
  align-self: center;
  &:visited {
    color: ${COLORS.slateGray}!important;
  }
`

const HeaderTitle = styled.span`
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(270deg);
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
`

const ContentWrapper = styled.div`
  padding: 40px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export default CreateRegulation
