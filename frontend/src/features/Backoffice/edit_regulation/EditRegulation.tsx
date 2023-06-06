// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { batch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  RemoveRegulationModal
} from '.'
import ConfirmRegulationModal from './ConfirmRegulationModal'
import SpeciesRegulation from './species_regulation/SpeciesRegulation'
import { COLORS } from '../../../constants/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import {
  DEFAULT_REGULATION,
  FRANCE,
  LAWTYPES_TO_TERRITORY,
  REGULATORY_REFERENCE_KEYS
} from '../../../domain/entities/regulation'
import { setError } from '../../../domain/shared_slices/Global'
import {
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview,
  setRegulatoryGeometriesToPreview,
  setRegulatoryTopics,
  setRegulatoryZoneMetadata
} from '../../../domain/shared_slices/Regulatory'
import createOrUpdateRegulation from '../../../domain/use_cases/layer/regulation/createOrUpdateRegulation'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/layer/regulation/getAllRegulatoryLayersByRegTerritory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/layer/regulation/getGeometryWithoutRegulationReference'
import showRegulatoryZone from '../../../domain/use_cases/layer/regulation/showRegulatoryZone'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import { useBackofficeAppDispatch } from '../../../hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '../../../hooks/useBackofficeAppSelector'
import { formatDataForSelectPicker } from '../../../utils'
import { Footer, FooterButton, OtherRemark, Section, Title } from '../../commonStyles/Backoffice.style'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import { BaseMap } from '../../map/BaseMap'
import { BaseLayer } from '../../map/layers/BaseLayer'
import { RegulatoryPreviewLayer } from '../../map/layers/RegulatoryPreviewLayer'
import { STATUS } from '../constants'
import {
  resetState,
  setAtLeastOneValueIsMissing,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setStatus,
  updateProcessingRegulationByKey
} from '../slice'

import type { GeoJSONGeometry } from 'ol/format/GeoJSON'

export function EditRegulation({ isEdition, title }) {
  const dispatch = useBackofficeAppDispatch()

  const navigate = useNavigate()

  const layersTopicsByRegTerritory = useBackofficeAppSelector(state => state.regulatory.layersTopicsByRegTerritory)

  /** @type {boolean} */
  const [lawTypeIsMissing, setLawTypeIsMissing] = useState(false)
  /** @type {boolean} */
  const [regulationTopicIsMissing, setProcessingRegulationTopicIsMissing] = useState(false)
  /** @type {boolean} */
  const [nameZoneIsMissing, setNameZoneIsMissing] = useState()
  /** @type {boolean} */
  const [regionIsMissing, setRegionIsMissing] = useState(false)
  const [geometryObjectList, setGeometryObjectList] = useState<GeoJSONGeometry[]>([])
  const [geometryIsMissing, setGeometryIsMissing] = useState(false)
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {Number[]} geometryIdList */
  const geometryIdList = useMemo(
    () => (geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : []),
    [geometryObjectList]
  )
  /** @type {boolean} saveIsForbidden */
  const [saveIsForbidden, setSaveIsForbidden] = useState(false)

  const {
    hasOneOrMoreValuesMission,
    isConfirmModalOpen,
    isRemoveModalOpen,
    processingRegulation,
    regulationDeleted,
    regulationModified,
    regulationSaved,
    regulatoryTextCheckedMap,
    saveOrUpdateRegulation,
    selectedRegulatoryZoneId
  } = useBackofficeAppSelector(state => state.regulation)

  const { id, lawType, otherInfo, region, regulatoryReferences, topic, zone } = processingRegulation as any

  const getGeometryObjectList = useCallback(() => {
    dispatch(getGeometryWithoutRegulationReference()).then(geometryListAsObject => {
      if (geometryListAsObject !== undefined) {
        setGeometryObjectList(geometryListAsObject)
      }
    })
  }, [dispatch])

  useEffect(() => {
    getGeometryObjectList()
    batch(async () => {
      await dispatch(getAllSpecies())
      if (!layersTopicsByRegTerritory || Object.keys(layersTopicsByRegTerritory).length === 0) {
        dispatch(getAllRegulatoryLayersByRegTerritory())
      }
      dispatch(closeRegulatoryZoneMetadataPanel())
    })

    return () => {
      dispatch(setStatus(STATUS.IDLE))
      dispatch(setProcessingRegulation(DEFAULT_REGULATION))
      dispatch(setRegulatoryZoneMetadata(undefined))
      dispatch(resetRegulatoryGeometriesToPreview())
    }
  }, [dispatch, getGeometryObjectList, layersTopicsByRegTerritory])

  useEffect(
    () => () => {
      if (isEdition && processingRegulation?.geometry) {
        dispatch(
          showRegulatoryZone({
            type: LayerProperties.REGULATORY.code,
            ...processingRegulation,
            namespace: 'backoffice'
          } as any)
        )
      }
    },
    [isEdition, processingRegulation, dispatch]
  )

  const goBackofficeHome = useCallback(() => {
    dispatch(resetState())
    navigate('/backoffice/regulation')
  }, [dispatch, navigate])

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
      let regulatoryTopicList = [] as any
      if (territory) {
        const lawTypeObject = territory[lawType]
        regulatoryTopicList = lawTypeObject ? Object.keys(lawTypeObject) : []
      }
      dispatch(setRegulatoryTopics(regulatoryTopicList))
    }
  }, [lawType, layersTopicsByRegTerritory, dispatch])

  const checkRequiredValues = useCallback(() => {
    let willHaveOneOrMoreValuesMissing = false
    let valueIsMissing = !(lawType && lawType !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    setLawTypeIsMissing(valueIsMissing)

    valueIsMissing = !(topic && topic !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    setProcessingRegulationTopicIsMissing(valueIsMissing)

    valueIsMissing = !(zone && zone !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    setNameZoneIsMissing(valueIsMissing as any)

    valueIsMissing =
      lawType && lawType !== '' && LAWTYPES_TO_TERRITORY[lawType] === FRANCE && !(region && region.length !== 0)
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    setRegionIsMissing(valueIsMissing)

    valueIsMissing = !(id && id !== '')
    setGeometryIsMissing(valueIsMissing)
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    dispatch(setAtLeastOneValueIsMissing(willHaveOneOrMoreValuesMissing))
  }, [lawType, topic, zone, region, id, dispatch])

  useEffect(() => {
    if (saveOrUpdateRegulation && hasOneOrMoreValuesMission === undefined) {
      checkRequiredValues()
    }
  }, [saveOrUpdateRegulation, hasOneOrMoreValuesMission, checkRequiredValues])

  useEffect(() => {
    if (regulatoryTextCheckedMap && saveOrUpdateRegulation) {
      const regulatoryTextCheckList = Object.values(regulatoryTextCheckedMap)
      const allTextsHaveBeenChecked =
        regulatoryTextCheckList?.length > 0 && regulatoryTextCheckList.length === regulatoryReferences.length

      if (allTextsHaveBeenChecked) {
        const allRequiredValuesHaveBeenFilled = !regulatoryTextCheckList.includes(false) && !hasOneOrMoreValuesMission

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
    hasOneOrMoreValuesMission,
    dispatch,
    id,
    processingRegulation,
    regulatoryReferences.length,
    regulatoryTextCheckedMap,
    saveOrUpdateRegulation,
    selectedRegulatoryZoneId,
    setSaveIsForbidden
  ])

  useEffect(() => {
    if (showRegulatoryPreview) {
      if (geometryObjectList && geometryObjectList[id]) {
        dispatch(setRegulatoryGeometriesToPreview([geometryObjectList[id]]))
      } else if (isEdition && processingRegulation?.geometry) {
        dispatch(setRegulatoryGeometriesToPreview([processingRegulation?.geometry] as any))
      } else {
        dispatch(setError(new Error("Aucune géométrie n'a été trouvée pour cette identifiant.")))
      }
    }
  }, [
    dispatch,
    geometryObjectList,
    id,
    isEdition,
    processingRegulation,
    selectedRegulatoryZoneId,
    showRegulatoryPreview
  ])

  const setOtherInfo = value => {
    dispatch(
      updateProcessingRegulationByKey({
        key: REGULATORY_REFERENCE_KEYS.OTHER_INFO,
        value
      })
    )
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
              {/* @ts-ignore */}
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
              {/* @ts-ignore */}
              <OtherRemark show>
                <Label>Remarques générales</Label>
                {/* @ts-ignore */}
                <CustomInput
                  $isGray={otherInfo && otherInfo !== ''}
                  as="textarea"
                  data-cy="regulatory-general-other-info"
                  onChange={event => setOtherInfo(event.target.value)}
                  placeholder=""
                  rows={2}
                  value={otherInfo || ''}
                  width="500px"
                />
              </OtherRemark>
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
                  // @ts-ignore
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
                <CancelButton
                  disabled={false}
                  // @ts-ignore
                  isLast={false}
                  onClick={() => dispatch(setIsRemoveModalOpen(true))}
                >
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
  background-color: ${COLORS.white};
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
