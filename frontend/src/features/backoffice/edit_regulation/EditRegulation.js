import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import {
  FishingPeriodSection,
  GearRegulation,
  RegulationGeometryLine,
  RegulationLawTypeLine,
  RegulationLayerZoneLine,
  RegulationRegionLine,
  RegulationTopicLine,
  RegulatoryTextSection,
  RemoveRegulationModal,
} from '.'
import { COLORS } from '../../../constants/constants'
import Layers from '../../../domain/entities/layers'
import { DEFAULT_REGULATION, FRANCE, LAWTYPES_TO_TERRITORY } from '../../../domain/entities/regulatory'
import { setError } from '../../../domain/shared_slices/Global'
import {
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview,
  setRegulatoryGeometriesToPreview,
  setRegulatoryTopics,
  setRegulatoryZoneMetadata,
} from '../../../domain/shared_slices/Regulatory'
import createOrUpdateRegulation from '../../../domain/use_cases/layer/regulation/createOrUpdateRegulation'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/layer/regulation/getAllRegulatoryLayersByRegTerritory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/layer/regulation/getGeometryWithoutRegulationReference'
import showRegulatoryZone from '../../../domain/use_cases/layer/regulation/showRegulatoryZone'
import BaseLayer from '../../../layers/BaseLayer'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import BaseMap from '../../map/BaseMap'
import {
  resetState,
  setAtLeastOneValueIsMissing,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setRegulationModified,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
} from '../Regulation.slice'
import ConfirmRegulationModal from './ConfirmRegulationModal'
import RegulatoryPreviewLayer from '../../../layers/RegulatoryPreviewLayer'
import { formatDataForSelectPicker } from '../../../utils'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Section, Title } from '../../commonStyles/Backoffice.style'
import SpeciesRegulation from './species_regulation/SpeciesRegulation'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'

function EditRegulation({ isEdition, title }) {
  const dispatch = useDispatch()

  const history = useHistory()

  const layersTopicsByRegTerritory = useSelector(state => state.regulatory.layersTopicsByRegTerritory)

  /** @type {boolean} */
  const [lawTypeIsMissing, setLawTypeIsMissing] = useState(false)
  /** @type {boolean} */
  const [regulationTopicIsMissing, setProcessingRegulationTopicIsMissing] = useState(false)
  /** @type {boolean} */
  const [nameZoneIsMissing, setNameZoneIsMissing] = useState()
  /** @type {boolean} */
  const [regionIsMissing, setRegionIsMissing] = useState(false)
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {Number[]} geometryIdList */
  const geometryIdList = useMemo(
    () => (geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : []),
    [geometryObjectList],
  )
  /** @type {boolean} saveIsForbidden */
  const [saveIsForbidden, setSaveIsForbidden] = useState(false)

  const {
    atLeastOneValueIsMissing,
    isConfirmModalOpen,
    isRemoveModalOpen,
    processingRegulation,
    regulationDeleted,
    regulationModified,
    regulationSaved,
    regulatoryTextCheckedMap,
    saveOrUpdateRegulation,
    selectedRegulatoryZoneId,
  } = useSelector(state => state.regulation)

  const { id, lawType, region, regulatoryReferences, topic, zone } = processingRegulation

  useEffect(() => {
    getGeometryObjectList()
    batch(async () => {
      await dispatch(getAllSpecies())
      if (!layersTopicsByRegTerritory || Object.keys(layersTopicsByRegTerritory).length === 0) {
        dispatch(getAllRegulatoryLayersByRegTerritory())
      }
      dispatch(closeRegulatoryZoneMetadataPanel())
      dispatch(setRegulationModified(false))
    })

    return () => {
      dispatch(setProcessingRegulation(DEFAULT_REGULATION))
      dispatch(setRegulatoryZoneMetadata(undefined))
      dispatch(resetRegulatoryGeometriesToPreview())
    }
  }, [])

  useEffect(
    () => () => {
      if (isEdition && processingRegulation?.geometry) {
        dispatch(
          showRegulatoryZone({
            type: Layers.REGULATORY.code,
            ...processingRegulation,
            namespace: 'backoffice',
          }),
        )
      }
    },
    [isEdition, processingRegulation, dispatch],
  )

  const goBackofficeHome = useCallback(() => {
    dispatch(resetState())
    history.push('/backoffice/regulation')
  }, [dispatch, history])

  useEffect(() => {
    if (regulationSaved || regulationDeleted) {
      goBackofficeHome()
    }
  }, [regulationSaved, regulationDeleted, goBackofficeHome])

  const onGoBack = () => {
    if (regulationModified) {
      dispatch(setIsConfirmModalOpen(true))
    } else {
      goBackofficeHome()
    }
  }

  useEffect(() => {
    if (lawType) {
      const territory = layersTopicsByRegTerritory[LAWTYPES_TO_TERRITORY[lawType]]
      let regulatoryTopicList = []
      if (territory) {
        const lawTypeObject = territory[lawType]
        regulatoryTopicList = lawTypeObject ? Object.keys(lawTypeObject) : []
      }
      dispatch(setRegulatoryTopics(regulatoryTopicList))
    }
  }, [lawType, layersTopicsByRegTerritory, dispatch])

  const checkRequiredValues = useCallback(() => {
    let _atLeastOneValueIsMissing = false
    let valueIsMissing = !(lawType && lawType !== '')
    _atLeastOneValueIsMissing = _atLeastOneValueIsMissing || valueIsMissing
    setLawTypeIsMissing(valueIsMissing)

    valueIsMissing = !(topic && topic !== '')
    _atLeastOneValueIsMissing = _atLeastOneValueIsMissing || valueIsMissing
    setProcessingRegulationTopicIsMissing(valueIsMissing)

    valueIsMissing = !(zone && zone !== '')
    _atLeastOneValueIsMissing = _atLeastOneValueIsMissing || valueIsMissing
    setNameZoneIsMissing(valueIsMissing)

    valueIsMissing =
      lawType && lawType !== '' && LAWTYPES_TO_TERRITORY[lawType] === FRANCE && !(region && region.length !== 0)
    _atLeastOneValueIsMissing = _atLeastOneValueIsMissing || valueIsMissing
    setRegionIsMissing(valueIsMissing)

    valueIsMissing = !(id && id !== '')
    setGeometryIsMissing(valueIsMissing)
    _atLeastOneValueIsMissing = _atLeastOneValueIsMissing || valueIsMissing
    dispatch(setAtLeastOneValueIsMissing(_atLeastOneValueIsMissing))
  }, [lawType, topic, zone, region, id, dispatch])

  useEffect(() => {
    if (saveOrUpdateRegulation && atLeastOneValueIsMissing === undefined) {
      checkRequiredValues()
    }
  }, [saveOrUpdateRegulation, atLeastOneValueIsMissing, checkRequiredValues])

  useEffect(() => {
    if (regulatoryTextCheckedMap && saveOrUpdateRegulation) {
      const regulatoryTextCheckList = Object.values(regulatoryTextCheckedMap)
      const allTextsHaveBeenChecked =
        regulatoryTextCheckList?.length > 0 && regulatoryTextCheckList.length === regulatoryReferences.length

      if (allTextsHaveBeenChecked) {
        const allRequiredValuesHaveBeenFilled = !regulatoryTextCheckList.includes(false) && !atLeastOneValueIsMissing

        if (allRequiredValuesHaveBeenFilled) {
          dispatch(createOrUpdateRegulation(processingRegulation, id, selectedRegulatoryZoneId))
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
  }, [
    atLeastOneValueIsMissing,
    saveOrUpdateRegulation,
    regulatoryTextCheckedMap,
    setSaveIsForbidden,
    id,
    selectedRegulatoryZoneId,
  ])

  useEffect(() => {
    if (showRegulatoryPreview) {
      if (geometryObjectList && geometryObjectList[id]) {
        dispatch(setRegulatoryGeometriesToPreview([geometryObjectList[id]]))
      } else if (isEdition && processingRegulation?.geometry) {
        dispatch(setRegulatoryGeometriesToPreview([processingRegulation?.geometry]))
      } else {
        dispatch(setError(new Error("Aucune géométrie n'a été trouvée pour cette identifiant.")))
      }
    }
  }, [
    isEdition,
    processingRegulation,
    id,
    geometryObjectList,
    showRegulatoryPreview,
    selectedRegulatoryZoneId,
    dispatch,
  ])

  const getGeometryObjectList = () => {
    dispatch(getGeometryWithoutRegulationReference()).then(geometryListAsObject => {
      if (geometryListAsObject !== undefined) {
        setGeometryObjectList(geometryListAsObject)
      }
    })
  }

  return (
    <>
      <Wrapper>
        <CreateRegulationWrapper>
          <Body>
            <Header>
              <LinkSpan>
                <ChevronIcon />
                <BackLink data-cy="go-back-link" onClick={onGoBack}>
                  Revenir à la liste complète des zones
                </BackLink>
              </LinkSpan>
              <HeaderTitle>{title}</HeaderTitle>
              <Span />
            </Header>
            <ContentWrapper>
              <Section show>
                <Title>identification de la zone réglementaire</Title>
                <RegulationLawTypeLine
                  lawTypeIsMissing={lawTypeIsMissing}
                  selectData={formatDataForSelectPicker(Object.keys(LAWTYPES_TO_TERRITORY))}
                />
                <RegulationTopicLine disabled={!lawType} regulationTopicIsMissing={regulationTopicIsMissing} />
                <RegulationLayerZoneLine nameZoneIsMissing={nameZoneIsMissing} />
                <RegulationRegionLine
                  disabled={!lawType || LAWTYPES_TO_TERRITORY[lawType] !== FRANCE}
                  regionIsMissing={regionIsMissing}
                />
                <RegulationGeometryLine
                  geometryIdList={geometryIdList}
                  geometryIsMissing={geometryIsMissing}
                  setShowRegulatoryPreview={setShowRegulatoryPreview}
                  showRegulatoryPreview={showRegulatoryPreview}
                />
              </Section>
              <RegulatoryTextSection regulatoryTextList={regulatoryReferences} saveForm={saveOrUpdateRegulation} />
              <FishingPeriodSection />
              <SpeciesRegulation />
              <GearRegulation />
            </ContentWrapper>
          </Body>
          <Footer>
            <FooterButton>
              <Validate>
                {saveIsForbidden && (
                  <ErrorMessage data-cy="save-forbidden-btn">
                    Veuillez vérifier les champs surlignés en rouge dans le formulaire
                  </ErrorMessage>
                )}
                <ValidateButton
                  data-cy="validate-button"
                  disabled={false}
                  isLast={false}
                  onClick={() => {
                    checkRequiredValues()
                    dispatch(setSaveOrUpdateRegulation(true))
                  }}
                >
                  {isEdition ? 'Enregister les modifications' : 'Créer la réglementation'}
                </ValidateButton>
              </Validate>
              {isEdition && (
                <CancelButton disabled={false} isLast={false} onClick={() => dispatch(setIsRemoveModalOpen(true))}>
                  Supprimer la réglementation
                </CancelButton>
              )}
            </FooterButton>
          </Footer>
        </CreateRegulationWrapper>
        {showRegulatoryPreview && (
          <BaseMap>
            <BaseLayer />
            <RegulatoryPreviewLayer />
          </BaseMap>
        )}
      </Wrapper>
      {isRemoveModalOpen && <RemoveRegulationModal />}
      {isConfirmModalOpen && <ConfirmRegulationModal goBackofficeHome={goBackofficeHome} />}
    </>
  )
}

const Validate = styled.div`
  display: block;
`

const ErrorMessage = styled.div`
  color: ${COLORS.maximumRed};
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

export default EditRegulation
