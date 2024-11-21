// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import { FishingPeriodSection } from '@features/BackOffice/edit_regulation/fishing_period/FishingPeriodSection'
import { GearRegulation } from '@features/BackOffice/edit_regulation/gear_regulation/GearRegulation'
import { RegulationGeometryLine } from '@features/BackOffice/edit_regulation/identification/RegulationGeometryLine'
import { RegulationLawTypeLine } from '@features/BackOffice/edit_regulation/identification/RegulationLawTypeLine'
import { RegulationLayerZoneLine } from '@features/BackOffice/edit_regulation/identification/RegulationLayerZoneLine'
import { RegulationRegionLine } from '@features/BackOffice/edit_regulation/identification/RegulationRegionLine'
import { RegulationTopicLine } from '@features/BackOffice/edit_regulation/identification/RegulationTopicLine'
import { RegulatoryTextSection } from '@features/BackOffice/edit_regulation/regulatory_text/RegulatoryTextSection'
import { RemoveRegulationModal } from '@features/BackOffice/edit_regulation/regulatory_text/RemoveRegulationModal'
import { formatDataForSelectPicker } from '@features/BackOffice/utils'
import { BaseLayer } from '@features/BaseMap/layers/BaseLayer'
import { RegulatoryPreviewLayer } from '@features/Regulation/layers/RegulatoryPreviewLayer'
import { regulationActions } from '@features/Regulation/slice'
import { createOrUpdateBackofficeRegulation } from '@features/Regulation/useCases/createOrUpdateRegulation'
import { getAllRegulatoryLayersByRegTerritory } from '@features/Regulation/useCases/getAllRegulatoryLayersByRegTerritory'
import { getGeometryWithoutRegulationReference } from '@features/Regulation/useCases/getGeometryWithoutRegulationReference'
import { showBackofficeRegulatoryZone } from '@features/Regulation/useCases/showRegulatoryZone'
import {
  DEFAULT_REGULATION,
  FRANCE,
  LAWTYPES_TO_TERRITORY,
  REGULATORY_REFERENCE_KEYS
} from '@features/Regulation/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { LayerProperties } from 'domain/entities/layers/constants'
import { setError } from 'domain/shared_slices/Global'
import { getAllSpecies } from 'domain/use_cases/species/getAllSpecies'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ConfirmRegulationModal } from './ConfirmRegulationModal'
import { SpeciesRegulation } from './species_regulation/SpeciesRegulation'
import { Footer, FooterButton, OtherRemark, Section, Title } from '../../commonStyles/Backoffice.style'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import ChevronIconSVG from '../../icons/Chevron_simple_gris.svg?react'
import { BaseMap } from '../../map/BaseMap'
import { STATUS } from '../constants'

import type { GeoJSON } from '../../../domain/types/GeoJSON'
import type { BackofficeAppThunk } from '@store'

export function EditRegulation({ isEdition, title }) {
  const dispatch = useBackofficeAppDispatch()

  const navigate = useNavigate()

  const layersTopicsByRegTerritory = useBackofficeAppSelector(state => state.regulation.layersTopicsByRegTerritory)

  const [geometryObjectList, setGeometryRecord] = useState<Record<string, GeoJSON.Geometry>>({})
  const [isRegulatoryPreviewDisplayed, setIsRegulatoryPreviewDisplayed] = useState(false)
  const geometryIdList = useMemo(
    () => (geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : []),
    [geometryObjectList]
  )
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
    regulatoryZonesToPreview,
    saveOrUpdateRegulation,
    selectedRegulatoryZoneId
  } = useBackofficeAppSelector(state => state.regulation)

  const { lawType, otherInfo, region, regulatoryReferences, topic, zone } = processingRegulation

  useEffect(() => {
    ;(async () => {
      const geometryRecord = await dispatch(getGeometryWithoutRegulationReference())
      setGeometryRecord(geometryRecord)

      await dispatch(getAllSpecies<BackofficeAppThunk>())
      await dispatch(getAllRegulatoryLayersByRegTerritory())
      dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
    })()

    return () => {
      dispatch(regulationActions.setStatus(STATUS.IDLE))
      dispatch(regulationActions.setProcessingRegulation(DEFAULT_REGULATION))
      dispatch(regulationActions.setRegulatoryZoneMetadata(undefined))
      dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
    }
  }, [dispatch])

  useEffect(
    () => () => {
      if (isEdition && processingRegulation?.geometry) {
        dispatch(
          showBackofficeRegulatoryZone({
            type: LayerProperties.REGULATORY.code,
            ...processingRegulation
          })
        )
      }
    },
    [isEdition, processingRegulation, dispatch]
  )

  const goBackofficeHome = useCallback(() => {
    dispatch(regulationActions.resetState())
    navigate('/backoffice/regulation')
  }, [dispatch, navigate])

  useEffect(() => {
    if (regulationSaved || regulationDeleted) {
      goBackofficeHome()
    }
  }, [regulationSaved, regulationDeleted, goBackofficeHome])

  const onGoBack = () => {
    if (regulationModified) {
      dispatch(regulationActions.setIsConfirmModalOpen(true))
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
      dispatch(regulationActions.setRegulatoryTopics(regulatoryTopicList))
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
      !!lawType && lawType !== '' && LAWTYPES_TO_TERRITORY[lawType] === FRANCE && !(region && region.length !== 0)
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing

    valueIsMissing = !(processingRegulation.id && processingRegulation.id !== '')
    willHaveOneOrMoreValuesMissing = willHaveOneOrMoreValuesMissing || valueIsMissing
    dispatch(regulationActions.setHasOneOrMoreValuesMissing(willHaveOneOrMoreValuesMissing))
  }, [lawType, topic, zone, region, processingRegulation.id, dispatch])

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
          dispatch(createOrUpdateBackofficeRegulation(processingRegulation, selectedRegulatoryZoneId))
          setSaveIsForbidden(false)
        } else {
          dispatch(regulationActions.setRegulatoryTextCheckedMap({}))
          dispatch(regulationActions.setSaveOrUpdateRegulation(false))
          dispatch(regulationActions.setHasOneOrMoreValuesMissing(undefined))
          setSaveIsForbidden(true)
        }
      }
    }
  }, [
    hasOneOrMoreValuesMissing,
    dispatch,
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

    const geometryFromId =
      !!geometryObjectList && !!processingRegulation.id && geometryObjectList[processingRegulation.id]
    if (geometryFromId) {
      dispatch(regulationActions.setRegulatoryGeometriesToPreview([{ geometry: geometryFromId }]))
    } else if (isEdition && processingRegulation?.geometry) {
      dispatch(
        regulationActions.setRegulatoryGeometriesToPreview([{ geometry: processingRegulation?.geometry }] as any)
      )
    } else {
      dispatch(setError(new Error("Aucune géométrie n'a été trouvée pour cette identifiant.")))
    }
  }, [
    dispatch,
    geometryObjectList,
    isEdition,
    processingRegulation,
    selectedRegulatoryZoneId,
    isRegulatoryPreviewDisplayed
  ])

  const setOtherInfo = value => {
    dispatch(
      regulationActions.updateProcessingRegulationByKey({
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
                  value={otherInfo ?? ''}
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
                    dispatch(regulationActions.setSaveOrUpdateRegulation(true))
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
                  onClick={() => dispatch(regulationActions.setIsRemoveModalOpen(true))}
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
            <RegulatoryPreviewLayer dispatch={dispatch} regulatoryZonesToPreview={regulatoryZonesToPreview} />
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
  color: ${p => p.theme.color.maximumRed};
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
  background-color: ${p => p.theme.color.white};
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
  color: ${p => p.theme.color.slateGray}!important;
  align-self: center;
  &:visited {
    color: ${p => p.theme.color.slateGray}!important;
  }
`

const HeaderTitle = styled.span`
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
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
