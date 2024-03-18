// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import FishingPeriodSection from '@features/Backoffice/edit_regulation/fishing_period/FishingPeriodSection'
import GearRegulation from '@features/Backoffice/edit_regulation/gear_regulation/GearRegulation'
import { RegulationGeometryLine } from '@features/Backoffice/edit_regulation/identification/RegulationGeometryLine'
import { RegulationLawTypeLine } from '@features/Backoffice/edit_regulation/identification/RegulationLawTypeLine'
import { RegulationLayerZoneLine } from '@features/Backoffice/edit_regulation/identification/RegulationLayerZoneLine'
import { RegulationRegionLine } from '@features/Backoffice/edit_regulation/identification/RegulationRegionLine'
import { RegulationTopicLine } from '@features/Backoffice/edit_regulation/identification/RegulationTopicLine'
import RegulatoryTextSection from '@features/Backoffice/edit_regulation/regulatory_text/RegulatoryTextSection'
import RemoveRegulationModal from '@features/Backoffice/edit_regulation/regulatory_text/RemoveRegulationModal'
import { formatDataForSelectPicker } from '@features/Backoffice/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { batch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ConfirmRegulationModal from './ConfirmRegulationModal'
import SpeciesRegulation from './species_regulation/SpeciesRegulation'
import { COLORS } from '../../../constants/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { setError } from '../../../domain/shared_slices/Global'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import { useBackofficeAppDispatch } from '../../../hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '../../../hooks/useBackofficeAppSelector'
import { BaseLayer } from '../../BaseMap/layers/BaseLayer'
import { Footer, FooterButton, OtherRemark, Section, Title } from '../../commonStyles/Backoffice.style'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import ChevronIconSVG from '../../icons/Chevron_simple_gris.svg?react'
import { BaseMap } from '../../map/BaseMap'
import { RegulatoryPreviewLayer } from '../../Regulation/layers/RegulatoryPreviewLayer'
import {
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview,
  setRegulatoryGeometriesToPreview,
  setRegulatoryTopics,
  setRegulatoryZoneMetadata
} from '../../Regulation/slice'
import { createOrUpdateRegulation } from '../../Regulation/useCases/createOrUpdateRegulation'
import { getAllRegulatoryLayersByRegTerritory } from '../../Regulation/useCases/getAllRegulatoryLayersByRegTerritory'
import { getGeometryWithoutRegulationReference } from '../../Regulation/useCases/getGeometryWithoutRegulationReference'
import showRegulatoryZone from '../../Regulation/useCases/showRegulatoryZone'
import { DEFAULT_REGULATION, FRANCE, LAWTYPES_TO_TERRITORY, REGULATORY_REFERENCE_KEYS } from '../../Regulation/utils'
import { STATUS } from '../constants'
import {
  resetState,
  setHasOneOrMoreValuesMissing,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setStatus,
  updateProcessingRegulationByKey
} from '../slice'

import type { GeoJSON } from '../../../domain/types/GeoJSON'

export function EditRegulation({ isEdition, title }) {
  const dispatch = useBackofficeAppDispatch()

  const navigate = useNavigate()

  const layersTopicsByRegTerritory = useBackofficeAppSelector(state => state.regulatory.layersTopicsByRegTerritory)

  const [geometryObjectList, setGeometryRecord] = useState<Record<string, GeoJSON.Geometry>>({})
  const [isRegulatoryPreviewDisplayed, setIsRegulatoryPreviewDisplayed] = useState(false)
  /** @type {Number[]} geometryIdList */
  const geometryIdList = useMemo(
    () => (geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : []),
    [geometryObjectList]
  )
  /** @type {boolean} saveIsForbidden */
  const [saveIsForbidden, setSaveIsForbidden] = useState(false)

  const {
    hasOneOrMoreValuesMissing,
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

  useEffect(() => {
    ;(async () => {
      const geometryRecord = await dispatch(getGeometryWithoutRegulationReference())
      setGeometryRecord(geometryRecord)

      await dispatch(getAllSpecies())

      await dispatch(getAllRegulatoryLayersByRegTerritory())

      dispatch(closeRegulatoryZoneMetadataPanel())
    })()

    return () => {
      dispatch(setStatus(STATUS.IDLE))
      dispatch(setProcessingRegulation(DEFAULT_REGULATION))
      dispatch(setRegulatoryZoneMetadata(undefined))
      dispatch(resetRegulatoryGeometriesToPreview())
    }
  }, [dispatch])

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

    valueIsMissing = !(topic && topic !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing

    valueIsMissing = !(zone && zone !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing

    valueIsMissing =
      lawType && lawType !== '' && LAWTYPES_TO_TERRITORY[lawType] === FRANCE && !(region && region.length !== 0)
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing

    valueIsMissing = !(id && id !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    dispatch(setHasOneOrMoreValuesMissing(willHaveOneOrMoreValuesMissing))
  }, [lawType, topic, zone, region, id, dispatch])

  useEffect(() => {
    if (saveOrUpdateRegulation && hasOneOrMoreValuesMissing === undefined) {
      checkRequiredValues()
    }
  }, [saveOrUpdateRegulation, hasOneOrMoreValuesMissing, checkRequiredValues])

  useEffect(() => {
    if (regulatoryTextCheckedMap && saveOrUpdateRegulation) {
      const regulatoryTextCheckList = Object.values(regulatoryTextCheckedMap)
      const allTextsHaveBeenChecked =
        regulatoryTextCheckList?.length > 0 && regulatoryTextCheckList.length === regulatoryReferences?.length

      if (allTextsHaveBeenChecked) {
        const allRequiredValuesHaveBeenFilled = !regulatoryTextCheckList.includes(false) && !hasOneOrMoreValuesMissing

        if (allRequiredValuesHaveBeenFilled) {
          dispatch(createOrUpdateRegulation(processingRegulation, id, selectedRegulatoryZoneId))
          setSaveIsForbidden(false)
        } else {
          batch(() => {
            dispatch(setRegulatoryTextCheckedMap({}))
            dispatch(setSaveOrUpdateRegulation(false))
            dispatch(setHasOneOrMoreValuesMissing(undefined))
          })
          setSaveIsForbidden(true)
        }
      }
    }
  }, [
    hasOneOrMoreValuesMissing,
    dispatch,
    id,
    processingRegulation,
    regulatoryReferences?.length,
    regulatoryTextCheckedMap,
    saveOrUpdateRegulation,
    selectedRegulatoryZoneId,
    setSaveIsForbidden
  ])

  useEffect(() => {
    if (!isRegulatoryPreviewDisplayed) {
      return
    }

    const geometryFromId = geometryObjectList && geometryObjectList[id]
    if (geometryFromId) {
      dispatch(setRegulatoryGeometriesToPreview([{ geometry: geometryFromId }]))
    } else if (isEdition && processingRegulation?.geometry) {
      dispatch(setRegulatoryGeometriesToPreview([{ geometry: processingRegulation?.geometry }] as any))
    } else {
      dispatch(setError(new Error("Aucune géométrie n'a été trouvée pour cette identifiant.")))
    }
  }, [
    dispatch,
    geometryObjectList,
    id,
    isEdition,
    processingRegulation,
    selectedRegulatoryZoneId,
    isRegulatoryPreviewDisplayed
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
                <RegulationLawTypeLine selectData={formatDataForSelectPicker(Object.keys(LAWTYPES_TO_TERRITORY))} />
                <RegulationTopicLine isDisabled={!lawType} />
                <RegulationLayerZoneLine />
                <RegulationRegionLine isDisabled={!lawType || LAWTYPES_TO_TERRITORY[lawType] !== FRANCE} />
                <RegulationGeometryLine
                  geometryIdList={geometryIdList}
                  isRegulatoryPreviewDisplayed={isRegulatoryPreviewDisplayed}
                  setIsRegulatoryPreviewDisplayed={setIsRegulatoryPreviewDisplayed}
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
        {isRegulatoryPreviewDisplayed && (
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
  overflow-y: auto;
  width: 100%;
`

const Body = styled.div`
  flex-grow: 1;
  padding-bottom: 50px;
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
