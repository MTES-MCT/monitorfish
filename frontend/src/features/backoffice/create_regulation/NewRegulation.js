import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
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
  UpcomingRegulationModal,
  RemoveRegulationModal
} from './'
import BaseMap from '../../map/BaseMap'
import updateRegulation from '../../../domain/use_cases/updateRegulation'

import { setRegulatoryGeometryToPreview, setRegulatoryZoneMetadata } from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

import { formatDataForSelectPicker } from '../../../utils'
import {
  CancelButton,
  ValidateButton
} from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import {
  resetState,
  setSelectedRegulation,
  setRegulatoryTextCheckedMap,
  setUpcomingRegulation,
  setSaveOrUpdateRegulation,
  setIsRemoveModalOpen,
  setSelectedGeometryId,
  setAtLeastOneValueIsMissing
} from '../Regulation.slice'
import Feature from 'ol/Feature'
import {
  mapToRegulatoryFeatureObject,
  emptyRegulatoryFeatureObject,
  getRegulatoryFeatureId,
  REGULATION_ACTION_TYPE,
  REGULATORY_TEXT_SOURCE,
  SeafrontByRegulatoryTerritory,
  UE,
  DEFAULT_REGULATORY_TEXT
} from '../../../domain/entities/regulatory'

const CreateRegulation = ({ title, isEdition }) => {
  const dispatch = useDispatch()
  const {
    regulatoryTopics,
    regulatoryLawTypes,
    seaFronts,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

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
  const [regulatoryTextList, setRegulatoryTextList] = useState([DEFAULT_REGULATORY_TEXT])
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  /** @type {GeoJSONGeometry} selectedGeometry */
  const [initialGeometryId, setInitialGeometryId] = useState()
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {[Number]} geometryIdList */
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])

  const {
    isModalOpen,
    regulationSaved,
    regulatoryTextCheckedMap,
    upcomingRegulation,
    saveOrUpdateRegulation,
    selectedGeometryId,
    isRemoveModalOpen,
    regulationDeleted,
    atLeastOneValueIsMissing
  } = useSelector(state => state.regulation)

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
    if (regulationSaved || regulationDeleted) {
      onGoBack()
    }
  }, [regulationSaved, regulationDeleted])

  const onGoBack = () => {
    dispatch(resetState())
    history.push('/backoffice')
  }

  useEffect(() => {
    return () => {
      dispatch(setRegulatoryZoneMetadata(undefined))
    }
  }, [])

  useEffect(() => {
    if (!isModalOpen && regulatoryTextCheckedMap && saveOrUpdateRegulation) {
      const regulatoryTextCheckList = Object.values(regulatoryTextCheckedMap)
      const allTextsHaveBeenChecked = regulatoryTextCheckList?.length > 0 && regulatoryTextCheckList.length === regulatoryTextList.length
      if (allTextsHaveBeenChecked) {
        const allRequiredValuesHaveBeenFilled = !regulatoryTextCheckList.includes(false) && !atLeastOneValueIsMissing
        if (allRequiredValuesHaveBeenFilled) {
          const featureObject = mapToRegulatoryFeatureObject({
            selectedRegulationTopic,
            selectedRegulationLawType,
            nameZone: nameZone,
            selectedSeaFront,
            selectedRegionList,
            regulatoryTexts: [...regulatoryTextList],
            upcomingRegulation
          })
          createOrUpdateRegulation(featureObject)
        } else {
          batch(() => {
            dispatch(setRegulatoryTextCheckedMap({}))
            dispatch(setSaveOrUpdateRegulation(false))
            dispatch(setAtLeastOneValueIsMissing(undefined))
          })
        }
      }
    }
  }, [atLeastOneValueIsMissing, saveOrUpdateRegulation, regulatoryTextCheckedMap])

  const initForm = () => {
    const {
      lawType,
      seafront,
      topic,
      zone,
      region,
      regulatoryReferences,
      id,
      upcomingRegulatoryReferences
    } = regulatoryZoneMetadata
    setSelectedRegulationLawType(`${lawType} / ${seafront}`)
    setSelectedRegulationTopic(topic)
    setNameZone(zone)
    setSelectedSeaFront(seafront)
    setSelectedRegionList(region ? region.split(', ') : [])
    setRegulatoryTextList(regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT])
    setInitialGeometryId(id)
    batch(() => {
      dispatch(setSelectedGeometryId(id))
      dispatch(setUpcomingRegulation(upcomingRegulatoryReferences))
    })
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
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    setSeaFrontIsMissing(valueIsMissing)
    valueIsMissing = selectedSeaFront && !SeafrontByRegulatoryTerritory[UE].includes(selectedSeaFront) &&
      !(selectedRegionList && selectedRegionList.length !== 0)
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    setRegionIsMissing(valueIsMissing)
    valueIsMissing = !(selectedGeometryId && selectedGeometryId !== '')
    setGeometryIsMissing(valueIsMissing)
    atLeastOneValueIsMissing = atLeastOneValueIsMissing || valueIsMissing
    dispatch(setAtLeastOneValueIsMissing(atLeastOneValueIsMissing))
  }

  useEffect(() => {
    if (showRegulatoryPreview &&
      ((isEdition && regulatoryZoneMetadata.geometry) ||
        (geometryObjectList && geometryObjectList[selectedGeometryId]))) {
      dispatch(setRegulatoryGeometryToPreview(isEdition ? regulatoryZoneMetadata.geometry : geometryObjectList[selectedGeometryId]))
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

  const createOrUpdateRegulation = (featureObject) => {
    const feature = new Feature(featureObject)
    feature.setId(getRegulatoryFeatureId(selectedGeometryId))
    dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))
    if (initialGeometryId && initialGeometryId !== selectedGeometryId) {
      const emptyFeature = new Feature(emptyRegulatoryFeatureObject)
      emptyFeature.setId(getRegulatoryFeatureId(initialGeometryId))
      dispatch(updateRegulation(emptyFeature, REGULATION_ACTION_TYPE.UPDATE))
    }
  }

  /* const saveAsDraft = () => {
    console.log('saveAsDraft')
  } */

  return (
    <>
    <Wrapper>
      <CreateRegulationWrapper>
        <Body>
          <Header>
            <LinkSpan><ChevronIcon/>
              <BackLink onClick={onGoBack} >Revenir à la liste complète des zones</BackLink>
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
                  disabled={!selectedSeaFront || SeafrontByRegulatoryTerritory[UE].includes(selectedSeaFront)}
                  setSelectedRegionList={setSelectedRegionList}
                  selectedRegionList={selectedRegionList}
                  regionIsMissing={regionIsMissing}
                />
                <RegulationGeometryLine
                  geometryIdList={geometryIdList}
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
                source={REGULATORY_TEXT_SOURCE.REGULATION}
                saveForm={saveOrUpdateRegulation}
              />
            </Content>
          </ContentWrapper>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton
              data-cy="validate-button"
              disabled={false}
              isLast={false}
              onClick={() => {
                checkRequiredValues()
                dispatch(setSaveOrUpdateRegulation(true))
              }}
            >
            { isEdition
              ? 'Enregister les modifications'
              : 'Créer la réglementation'
            }
            </ValidateButton>
            {/* <CancelButton
              disabled={false}
              isLast={false}
              onClick={saveAsDraft}
            >
              Enregistrer un brouillon
            </CancelButton> */}
            {isEdition &&
              <CancelButton
                disabled={false}
                isLast={false}
                onClick={() => dispatch(setIsRemoveModalOpen(true))}
              >
                Supprimer la réglementation
              </CancelButton>}
          </FooterButton>
        </Footer>
      </CreateRegulationWrapper>
    { showRegulatoryPreview && <BaseMap />}
    </Wrapper>
    {isModalOpen && <UpcomingRegulationModal />}
    {isRemoveModalOpen && <RemoveRegulationModal />}
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

const BackLink = styled.a`
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
