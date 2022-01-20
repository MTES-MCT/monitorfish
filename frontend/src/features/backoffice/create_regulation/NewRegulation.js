import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector, batch } from 'react-redux'
import { useHistory } from 'react-router-dom'
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
  FishingPeriodSection,
  RegulatoryGearSection
} from './'
import ConfirmRegulationModal from './ConfirmRegulationModal'
import BaseMap from '../../map/BaseMap'
import updateRegulation from '../../../domain/use_cases/updateRegulation'

import {
  setRegulatoryGeometriesToPreview,
  setRegulatoryZoneMetadata,
  setRegulatoryTopics,
  closeRegulatoryZoneMetadataPanel
} from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

import { formatDataForSelectPicker } from '../../../utils'
import {
  CancelButton,
  ValidateButton
} from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Title, Section } from '../../commonStyles/Backoffice.style'
import {
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing,
  setIsRemoveModalOpen,
  setIsConfirmModalOpen,
  resetState,
  setRegulationByKey,
  setRegulation,
  setUpcomingRegulatoryText
} from '../Regulation.slice'
import Feature from 'ol/Feature'
import {
  mapToRegulatoryFeatureObject,
  emptyRegulatoryFeatureObject,
  getRegulatoryFeatureId,
  REGULATION_ACTION_TYPE,
  REGULATORY_TEXT_SOURCE,
  REG_LOCALE,
  LAWTYPES_TO_TERRITORY,
  FRANCE,
  INITIAL_REGULATION,
  REGULATORY_REFERENCE_KEYS,
  INITIAL_UPCOMING_REG_REFERENCE
} from '../../../domain/entities/regulatory'
import RegulatorySpeciesSection from './regulatory_species/RegulatorySpeciesSection'
import getAllSpecies from '../../../domain/use_cases/getAllSpecies'

const CreateRegulation = ({ title, isEdition }) => {
  const dispatch = useDispatch()

  const history = useHistory()

  const {
    layersTopicsByRegTerritory,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  /** @type {boolean} */
  const [lawTypeIsMissing, setLawTypeIsMissing] = useState(false)
  /** @type {boolean} */
  const [regulationTopicIsMissing, setRegulationTopicIsMissing] = useState(false)
  /** @type {boolean} */
  const [nameZoneIsMissing, setNameZoneIsMissing] = useState()
  /** @type {boolean} */
  const [regionIsMissing, setRegionIsMissing] = useState(false)
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  /** @type {GeoJSONGeometry} selectedGeometry */
  const [initialGeometryId, setInitialGeometryId] = useState()
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {Number[]} geometryIdList */
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])
  /** @type {boolean} saveIsForbidden */
  const [saveIsForbidden, setSaveIsForbidden] = useState(false)
  const {
    isModalOpen,
    regulationSaved,
    regulatoryTextCheckedMap,
    saveOrUpdateRegulation,
    atLeastOneValueIsMissing,
    isRemoveModalOpen,
    isConfirmModalOpen,
    regulationDeleted,
    currentRegulation,
    fishingPeriod,
    regulatorySpecies
  } = useSelector(state => state.regulation)

  const {
    lawType: selectedRegulationLawType,
    topic: selectedRegulationTopic,
    zone: nameZone,
    region: selectedRegionList,
    id: selectedGeometryId,
    regulatoryReferences: regulatoryTextList,
    upcomingRegulatoryReferences,
    regulatoryGears
  } = currentRegulation

  useEffect(() => {
    if (!layersTopicsByRegTerritory || Object.keys(layersTopicsByRegTerritory).length === 0) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }

    const newRegulation = {
      regulatoryText: [],
      upcomingRegulation: [{}]
    }
    getGeometryObjectList()
    batch(() => {
      dispatch(getAllSpecies())
      dispatch(setSelectedRegulation(newRegulation))
      dispatch(closeRegulatoryZoneMetadataPanel())
    })

    return () => {
      dispatch(setRegulation(INITIAL_REGULATION))
      dispatch(setRegulatoryZoneMetadata(undefined))
      dispatch(setUpcomingRegulatoryText(INITIAL_UPCOMING_REG_REFERENCE))
    }
  }, [])

  useEffect(() => {
    if (isEdition && regulatoryZoneMetadata) {
      setInitialGeometryId(regulatoryZoneMetadata.id)
    }
  }, [isEdition, regulatoryZoneMetadata])

  const goBackofficeHome = useCallback(() => {
    batch(() => {
      dispatch(resetState())
    })
    history.push('/backoffice/regulation')
  }, [resetState])

  useEffect(() => {
    if (regulationSaved || regulationDeleted) {
      goBackofficeHome()
    }
  }, [regulationSaved, regulationDeleted, goBackofficeHome])

  const onGoBack = () => {
    dispatch(setIsConfirmModalOpen(true))
  }

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

  const createOrUpdateRegulation = useCallback((featureObject) => {
    const feature = new Feature(featureObject)
    feature.setId(getRegulatoryFeatureId(selectedGeometryId))
    dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.UPDATE))

    if (initialGeometryId && initialGeometryId !== selectedGeometryId) {
      const emptyFeature = new Feature(emptyRegulatoryFeatureObject)
      emptyFeature.setId(getRegulatoryFeatureId(initialGeometryId))
      dispatch(updateRegulation(emptyFeature, REGULATION_ACTION_TYPE.UPDATE))
    }
  }, [selectedGeometryId, initialGeometryId])

  const checkRequiredValues = useCallback(() => {
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
  }, [selectedRegulationLawType, nameZone, selectedRegulationTopic, selectedRegionList, selectedGeometryId])

  useEffect(() => {
    if (saveOrUpdateRegulation && atLeastOneValueIsMissing === undefined) {
      checkRequiredValues()
    }
  }, [saveOrUpdateRegulation, atLeastOneValueIsMissing, checkRequiredValues])

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
            upcomingRegulatoryReferences,
            fishingPeriod,
            regulatorySpecies,
            regulatoryGears
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
  }, [atLeastOneValueIsMissing, saveOrUpdateRegulation, regulatoryTextCheckedMap, setSaveIsForbidden, createOrUpdateRegulation])

  useEffect(() => {
    if (showRegulatoryPreview &&
      ((isEdition && regulatoryZoneMetadata.geometry) || (geometryObjectList && geometryObjectList[selectedGeometryId]))) {
      dispatch(setRegulatoryGeometriesToPreview(isEdition
        ? [regulatoryZoneMetadata.geometry]
        : [geometryObjectList[selectedGeometryId]]))
    }
  }, [isEdition, regulatoryZoneMetadata, selectedGeometryId, geometryObjectList, showRegulatoryPreview])

  const getGeometryObjectList = () => {
    dispatch(getGeometryWithoutRegulationReference())
      .then(geometryListAsObject => {
        if (geometryListAsObject !== undefined) {
          setGeometryObjectList(geometryListAsObject)
        }
      })
  }

  const setRegulatoryTextList = (texts) => {
    dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGULATORY_REFERENCES, value: texts }))
  }

  return (
    <>
    <Wrapper>
      <CreateRegulationWrapper>
        <Body>
          <Header>
            <LinkSpan><ChevronIcon/>
              <BackLink
                data-cy='go-back-link'
                onClick={onGoBack}
              >Revenir à la liste complète des zones</BackLink>
            </LinkSpan>
            <HeaderTitle>{title}</HeaderTitle>
            <Span />
          </Header>
          <ContentWrapper>
            {/** j'ai  supprimé une CONTENT */}
            <Section show>
              <Title>
                identification de la zone réglementaire
              </Title>
              <RegulationLawTypeLine
                selectData={formatDataForSelectPicker(Object.keys(LAWTYPES_TO_TERRITORY))}
                lawTypeIsMissing={lawTypeIsMissing}
              />
              <RegulationTopicLine
                disabled={!selectedRegulationLawType}
                regulationTopicIsMissing={regulationTopicIsMissing}
              />
              <RegulationLayerZoneLine nameZoneIsMissing={nameZoneIsMissing} />
              <RegulationRegionLine
                disabled={!selectedRegulationLawType || LAWTYPES_TO_TERRITORY[selectedRegulationLawType] !== FRANCE}
                regionIsMissing={regionIsMissing}
              />
              <RegulationGeometryLine
                geometryIdList={geometryIdList}
                setShowRegulatoryPreview={setShowRegulatoryPreview}
                showRegulatoryPreview={showRegulatoryPreview}
                geometryIsMissing={geometryIsMissing}
              />
            </Section>
            {/** j'ai supprimé un content */}
            <RegulatoryTextSection
              regulatoryTextList={regulatoryTextList}
              setRegulatoryTextList={setRegulatoryTextList}
              source={REGULATORY_TEXT_SOURCE.REGULATION}
              saveForm={saveOrUpdateRegulation}
            />
            <FishingPeriodSection />
            <RegulatorySpeciesSection />
            <RegulatoryGearSection />
          </ContentWrapper>
        </Body>
        <Footer>
          <FooterButton>
            <Validate>
              {saveIsForbidden && <ErrorMessage data-cy='save-forbidden-btn'>
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
    {isConfirmModalOpen && <ConfirmRegulationModal goBackofficeHome={goBackofficeHome} />}
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

export default CreateRegulation
