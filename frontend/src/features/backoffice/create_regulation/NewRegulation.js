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
  RegulationTopicLine,
  RegulatoryTextSection,
  UpcomingRegulationModal,
  RemoveRegulationModal,
  FishingPeriodSection
} from './'
import BaseMap from '../../map/BaseMap'
import updateRegulation from '../../../domain/use_cases/updateRegulation'

import {
  setRegulatoryGeometryToPreview,
  setRegulatoryZoneMetadata,
  setRegulatoryTopics
} from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

import { formatDataForSelectPicker } from '../../../utils'
import {
  CancelButton,
  ValidateButton
} from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Section, Title } from '../../commonStyles/Backoffice.style'
import {
  resetState,
  setSelectedRegulation,
  setRegulatoryTextCheckedMap,
  setUpcomingRegulation,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing,
  setIsRemoveModalOpen,
  setSelectedGeometryId
} from '../Regulation.slice'
import Feature from 'ol/Feature'
import {
  mapToRegulatoryFeatureObject,
  emptyRegulatoryFeatureObject,
  getRegulatoryFeatureId,
  REGULATION_ACTION_TYPE,
  REGULATORY_TEXT_SOURCE,
  DEFAULT_REGULATORY_TEXT,
  REG_LOCALE,
  LAWTYPES_TO_TERRITORY,
  UE,
  FRANCE,
  initialFishingPeriodValues, initialRegulatorySpeciesValues
} from '../../../domain/entities/regulatory'
import RegulatorySpeciesSection from './regulatory_species/RegulatorySpeciesSection'
import getAllSpecies from '../../../domain/use_cases/getAllSpecies'

const CreateRegulation = ({ title, isEdition }) => {
  const dispatch = useDispatch()
  const {
    layersTopicsByRegTerritory,
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
  /** @type {[String]} */
  const [selectedRegionList, setSelectedRegionList] = useState([])
  const [regionIsMissing, setRegionIsMissing] = useState(false)
  /** @type {[regulatoryText]} */
  const [regulatoryTextList, setRegulatoryTextList] = useState([DEFAULT_REGULATORY_TEXT])
  /** @type {FishingPeriod} */
  const [fishingPeriod, setFishingPeriod] = useState(initialFishingPeriodValues)
  /** @type {RegulatorySpecies} */
  const [regulatorySpecies, setRegulatorySpecies] = useState(initialRegulatorySpeciesValues)
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  /** @type {GeoJSONGeometry} selectedGeometry */
  const [initialGeometryId, setInitialGeometryId] = useState()
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {[Number]} geometryIdList */
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])
  /** @type {boolean} saveIsForbidden */
  const [saveIsForbidden, setSaveIsForbidden] = useState(false)
  const {
    isModalOpen,
    regulationSaved,
    regulatoryTextCheckedMap,
    upcomingRegulation,
    saveOrUpdateRegulation,
    atLeastOneValueIsMissing,
    selectedGeometryId,
    isRemoveModalOpen,
    regulationDeleted
  } = useSelector(state => state.regulation)

  useEffect(() => {
    if (!layersTopicsByRegTerritory || Object.keys(layersTopicsByRegTerritory).length === 0) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }

    dispatch(getAllSpecies())

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
    history.push('/backoffice/regulation')
  }

  useEffect(() => {
    return () => {
      dispatch(setRegulatoryZoneMetadata(undefined))
    }
  }, [])

  useEffect(() => {
    if (selectedRegulationLawType) {
      const territory = layersTopicsByRegTerritory[LAWTYPES_TO_TERRITORY[selectedRegulationLawType]]
      let regulatoryTopicList = []
      if (territory) {
        const lawTypeObject = territory[selectedRegulationLawType]
        regulatoryTopicList = lawTypeObject ? Object.keys(lawTypeObject) : []
      }
      dispatch(setRegulatoryTopics(regulatoryTopicList))
    }
  }, [selectedRegulationLawType, layersTopicsByRegTerritory])

  useEffect(() => {
    if (!isModalOpen && regulatoryTextCheckedMap && saveOrUpdateRegulation) {
      const regulatoryTextCheckList = Object.values(regulatoryTextCheckedMap)
      const allTextsHaveBeenChecked = regulatoryTextCheckList?.length > 0 && regulatoryTextCheckList.length === regulatoryTextList.length

      if (allTextsHaveBeenChecked) {
        const allRequiredValuesHaveBeenFilled = !regulatoryTextCheckList.includes(false) && !atLeastOneValueIsMissing

        if (allRequiredValuesHaveBeenFilled) {
          const featureObject = mapToRegulatoryFeatureObject({
            layerName: selectedRegulationTopic,
            lawType: selectedRegulationLawType,
            zone: nameZone,
            region: selectedRegionList?.join(', '),
            regulatoryReferences: regulatoryTextList,
            upcomingRegulatoryReferences: upcomingRegulation,
            fishingPeriod,
            regulatorySpecies
          })
          createOrUpdateRegulation(featureObject)
          setSaveIsForbidden(false)
        } else {
          batch(() => {
            dispatch(setRegulatoryTextCheckedMap({}))
            dispatch(setSaveOrUpdateRegulation(false))
            dispatch(setAtLeastOneValueIsMissing(undefined))
          })
          setSaveIsForbidden(true)
        }
      }
    }
  }, [atLeastOneValueIsMissing, saveOrUpdateRegulation, regulatoryTextCheckedMap])

  const initForm = () => {
    const {
      lawType,
      topic,
      zone,
      region,
      regulatoryReferences,
      id,
      upcomingRegulatoryReferences,
      fishingPeriod,
      regulatorySpecies
    } = regulatoryZoneMetadata

    setSelectedRegulationLawType(lawType)
    setSelectedRegulationTopic(topic)
    setNameZone(zone)
    setSelectedRegionList(region ? region.split(', ') : [])
    setRegulatoryTextList(regulatoryReferences?.length > 0 ? regulatoryReferences : [DEFAULT_REGULATORY_TEXT])
    setInitialGeometryId(id)
    setFishingPeriod(fishingPeriod)
    setRegulatorySpecies(regulatorySpecies)

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
    valueIsMissing = selectedRegulationLawType && selectedRegulationLawType !== '' &&
      selectedRegulationLawType.includes(REG_LOCALE) &&
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
      ((isEdition && regulatoryZoneMetadata.geometry) || (geometryObjectList && geometryObjectList[selectedGeometryId]))) {
      dispatch(setRegulatoryGeometryToPreview(isEdition
        ? regulatoryZoneMetadata.geometry
        : geometryObjectList[selectedGeometryId]))
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

  const onLawTypeChange = (value) => {
    if (LAWTYPES_TO_TERRITORY[value] !== UE) {
      setSelectedRegionList([])
    }
    setSelectedRegulationTopic(undefined)
    setSelectedRegulationLawType(value)
  }

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
                <Title>
                  identification de la zone réglementaire
                </Title>
                <RegulationLawTypeLine
                  setSelectedValue={onLawTypeChange}
                  selectedValue={selectedRegulationLawType}
                  selectData={formatDataForSelectPicker(Object.keys(LAWTYPES_TO_TERRITORY))}
                  lawTypeIsMissing={lawTypeIsMissing}
                />
                <RegulationTopicLine
                  disabled={!selectedRegulationLawType}
                  selectedRegulationTopic={selectedRegulationTopic}
                  setSelectedRegulationTopic={setSelectedRegulationTopic}
                  regulationTopicIsMissing={regulationTopicIsMissing}
                />
                <RegulationLayerZoneLine
                  nameZone={nameZone}
                  setNameZone={setNameZone}
                  nameZoneIsMissing={nameZoneIsMissing}
                />
                <RegulationRegionLine
                  disabled={!selectedRegulationLawType || LAWTYPES_TO_TERRITORY[selectedRegulationLawType] !== FRANCE}
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
            <Content>
              <FishingPeriodSection
                fishingPeriod={fishingPeriod}
                setFishingPeriod={setFishingPeriod}
              />
            </Content>
            <Content>
              <RegulatorySpeciesSection
                regulatorySpecies={regulatorySpecies}
                setRegulatorySpecies={setRegulatorySpecies}
              />
            </Content>
          </ContentWrapper>
        </Body>
        <Footer>
          <FooterButton>
            <Validate>
              {saveIsForbidden && <ErrorMessage>
                Veuillez vérifier les champs surlignés en rouge dans le formulaire
              </ErrorMessage>}
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
            </Validate>
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

const Validate = styled.div`
  display: block;
`

const ErrorMessage = styled.div`
  color: ${COLORS.red};
  width: 250px;
  margin-bottom: 10px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
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
