import { WindowContext } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { Bold } from '@components/style'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { AutoSaveTag } from '@features/Mission/components/MissionForm/shared/AutoSaveTag'
import { REPORTING_MAP_FORM_WIDTH } from '@features/Reporting/components/IUUReportingMapForm/constants'
import { ReportingForm } from '@features/Reporting/components/ReportingForm'
import { getDuplicatedFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { reportingActions } from '@features/Reporting/slice'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { deleteReporting } from '@features/Reporting/useCases/deleteReporting'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, Icon, IconButton, Level, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'

import type { ReportingFormActions, ReportingFormDuplication } from '@features/Reporting/components/ReportingForm'
import type { Reporting } from '@features/Reporting/types'

type ConfirmationDialog = 'DELETION' | 'DRAFT_CANCELLATION' | 'DUPLICATION'

const DUPLICATION_BANNER_PROPS = {
  closingDelay: 6000,
  isClosable: true,
  withAutomaticClosing: true
}

export function IUUReportingMapForm() {
  const dispatch = useMainAppDispatch()
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const top = useGetTopOffset()
  const { isOpened, isRendered } = useDisplayMapBox(isReportingMapFormDisplayed)
  const [vesselName, setVesselName] = useState<string | undefined>(undefined)
  const [flagState, setFlagState] = useState<string | undefined>(undefined)
  const [numberOfVessels, setNumberOfVessels] = useState<number | undefined>(undefined)
  const [autoSavedLastUpdateDate, setAutoSavedLastUpdateDate] = useState<string | undefined>(undefined)
  const formActionsRef = useRef<ReportingFormActions | undefined>(undefined)
  const isDirtyRef = useRef(false)
  const reportingIdRef = useRef(editedReporting?.id)
  const reportingTypeRef = useRef(editedReporting?.type)
  const [duplication, setDuplication] = useState<ReportingFormDuplication | undefined>(undefined)
  const [openedConfirmationDialog, setOpenedConfirmationDialog] = useState<ConfirmationDialog | undefined>(undefined)

  const resetLocalState = () => {
    reportingIdRef.current = undefined
    reportingTypeRef.current = undefined
    setVesselName(undefined)
    setFlagState(undefined)
    setNumberOfVessels(undefined)
    setAutoSavedLastUpdateDate(undefined)
  }

  useEffect(() => {
    if (!editedReporting) {
      resetLocalState()

      return
    }

    setDuplication(undefined)
    reportingIdRef.current = editedReporting?.id
    reportingTypeRef.current = editedReporting?.type
  }, [editedReporting])

  const closeConfirmationDialog = () => setOpenedConfirmationDialog(undefined)

  const onClose = () => {
    if (isDirtyRef.current) {
      setOpenedConfirmationDialog('DRAFT_CANCELLATION')

      return
    }

    handleClose()
  }

  const handleClose = () => {
    closeConfirmationDialog()
    setDuplication(undefined)
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isReportingMapFormDisplayed: false
      })
    )
    dispatch(reportingActions.unsetEditedReporting())
    dispatch(reportingActions.unsetSelectedReportingFeatureId())
  }

  const handleDelete = () => {
    const deletedReportingId = reportingIdRef.current
    const deletedReportingType = reportingTypeRef.current
    assertNotNullish(deletedReportingId)
    assertNotNullish(deletedReportingType)

    handleClose()
    dispatch(deleteReporting(deletedReportingId, deletedReportingType))
  }

  const onDuplicate = () => {
    if (isDirtyRef.current) {
      setOpenedConfirmationDialog('DUPLICATION')

      return
    }

    duplicateReporting()
  }

  const duplicateReporting = () => {
    closeConfirmationDialog()

    try {
      const editedValues = formActionsRef.current?.getEditedValues()
      assertNotNullish(editedValues)

      setDuplication(previousDuplication => ({
        initialValues: getDuplicatedFormFields(editedValues),
        sessionId: (previousDuplication?.sessionId ?? 0) + 1
      }))
      resetLocalState()
      dispatch(reportingActions.unsetEditedReporting())
      dispatch(reportingActions.unsetSelectedReportingFeatureId())

      notifyDuplicationSucceeded()
    } catch (error) {
      notifyDuplicationFailed(error)
    }
  }

  const notifyDuplicationSucceeded = () => {
    dispatch(
      addMainWindowBanner({
        ...DUPLICATION_BANNER_PROPS,
        children: 'Le signalement a bien été dupliqué. Vous éditez maintenant le nouveau signalement.',
        level: Level.SUCCESS
      })
    )
  }

  const notifyDuplicationFailed = (error: unknown) => {
    dispatch(
      addMainWindowBanner({
        ...DUPLICATION_BANNER_PROPS,
        children: `Le signalement n'a pas pu être dupliqué: ${error instanceof Error ? error.message : `${error}`}`,
        level: Level.ERROR
      })
    )
  }

  const handleVesselStateChange = useCallback(
    (
      nextVesselName: string | undefined,
      nextFlagState: string | undefined,
      nextNumberOfVessels: number | undefined
    ) => {
      setVesselName(nextVesselName)
      setFlagState(nextFlagState)
      setNumberOfVessels(nextNumberOfVessels)
    },
    []
  )

  const handleAutoSaved = useCallback((reporting: Reporting.Reporting) => {
    setAutoSavedLastUpdateDate(reporting.lastUpdateDate)
    reportingIdRef.current = reporting.id
    reportingTypeRef.current = reporting.type as ReportingType.INFRACTION_SUSPICION | ReportingType.OBSERVATION
  }, [])

  const handleDirty = useCallback((isDirty: boolean) => {
    isDirtyRef.current = isDirty
  }, [])

  const lastUpdateDate = autoSavedLastUpdateDate ?? editedReporting?.lastUpdateDate

  const title = (() => {
    if (!lastUpdateDate) {
      return 'NOUVEAU SIGNALEMENT INN'
    }

    if (numberOfVessels !== undefined && numberOfVessels > 1) {
      return `${numberOfVessels} NAVIRES`
    }

    return `${vesselName ?? 'NAVIRE INCONNU'}`
  })()

  return (
    <>
      {isRendered && (
        <>
          <Wrapper $top={top} data-cy="map-reporting-form" isOpen={isOpened}>
            <Header>
              <HeaderTitle>
                <Icon.Report color={THEME.color.white} />
                <StyledTitle>
                  {!!flagState && flagState !== UNKNOWN_VESSEL.flagState && (
                    <Flag rel="preload" src={`flags/${flagState?.toLowerCase()}.svg`} />
                  )}
                  {title}
                </StyledTitle>
              </HeaderTitle>
              <CloseButton Icon={Icon.Close} onClick={onClose} title="Fermer" />
            </Header>
            <SaveHeadBand>
              {lastUpdateDate &&
                `Dernière modif. le ${customDayjs(lastUpdateDate).utc().format('DD/MM/YY [à] HH[h]mm')}`}
              {!lastUpdateDate && 'Signalement non enregistré'}
              <StyledAutoSaveTag isAutoSaveEnabled={!editedReporting?.isArchived} />
            </SaveHeadBand>
            <Body>
              <StyledReportingForm
                autoSave={!editedReporting?.isArchived}
                duplication={duplication}
                editedReporting={editedReporting}
                formActionsRef={formActionsRef}
                hasWhiteBackground
                hideButtons
                isIUU
                onAutoSaved={handleAutoSaved}
                onClose={onClose}
                onIsDirty={handleDirty}
                onVesselStateChange={handleVesselStateChange}
                windowContext={WindowContext.MainWindow}
              />
            </Body>
            <StyledFooter>
              {!!reportingIdRef.current && (
                <>
                  <DeleteButton
                    accent={Accent.SECONDARY}
                    color={THEME.color.maximumRed}
                    Icon={Icon.Delete}
                    onClick={() => {
                      setOpenedConfirmationDialog('DELETION')
                    }}
                    title="Supprimer ce signalement"
                  />
                  <DuplicateButton
                    accent={Accent.PRIMARY}
                    Icon={Icon.Duplicate}
                    onClick={onDuplicate}
                    title="Dupliquer ce signalement"
                  />
                </>
              )}

              <Button accent={Accent.TERTIARY} onClick={onClose} title="Fermer">
                Fermer
              </Button>
              {!!editedReporting?.isArchived && (
                <Button
                  accent={Accent.TERTIARY}
                  onClick={() => formActionsRef.current?.submit()}
                  title="Enregistrer et fermer"
                >
                  Enregistrer et fermer
                </Button>
              )}
            </StyledFooter>
          </Wrapper>
          {openedConfirmationDialog === 'DRAFT_CANCELLATION' && (
            <ConfirmationModal
              confirmationButtonLabel="Quitter sans enregistrer"
              message={
                <>
                  <p>Vous êtes en train d’abandonner</p>
                  <Bold>l’édition d’un signalement.</Bold>
                </>
              }
              onCancel={closeConfirmationDialog}
              onConfirm={handleClose}
              title="Quitter sans enregistrer"
            />
          )}
          {openedConfirmationDialog === 'DELETION' && (
            <ConfirmationModal
              confirmationButtonLabel="Confirmer la suppression"
              message={
                <>
                  <p>Êtes-vous sûr de vouloir</p>
                  <Bold>supprimer ce signalement ?</Bold>
                </>
              }
              onCancel={closeConfirmationDialog}
              onConfirm={handleDelete}
              title="Supprimer le signalement"
            />
          )}
          {openedConfirmationDialog === 'DUPLICATION' && (
            <ConfirmationModal
              confirmationButtonLabel="Dupliquer sans enregistrer"
              message={
                <>
                  <p>Les modifications en cours seront reprises dans la copie mais ne seront pas enregistrées sur</p>
                  <Bold>le signalement d’origine.</Bold>
                </>
              }
              onCancel={closeConfirmationDialog}
              onConfirm={duplicateReporting}
              title="Dupliquer le signalement"
            />
          )}
        </>
      )}
    </>
  )
}

const DeleteButton = styled(IconButton)`
  background-color: ${p => p.theme.color.cultured};
  border-color: ${p => p.theme.color.maximumRed};
`

const DuplicateButton = styled(IconButton)`
  border-color: ${p => p.theme.color.white};
`

const StyledTitle = styled(MapMenuDialog.Title)`
  font-weight: 500;
  align-items: center;
  display: flex;
`

const Flag = styled.img<{
  rel?: 'preload'
}>`
  height: 14px;
  display: inline-block;
  margin-right: 8px;
`

const StyledAutoSaveTag = styled(AutoSaveTag)`
  margin-left: auto;
  margin-right: 0;
`

const StyledReportingForm = styled(ReportingForm)`
  padding: 16px;
`

const StyledFooter = styled(MapMenuDialog.Footer)`
  background-color: ${p => p.theme.color.charcoal};
  height: 30px;
  padding: 9px 14px;
  flex-shrink: 0;
  text-align: right;
  width: unset;
  flex-direction: row;
  gap: 4px;

  button[title='Dupliquer ce signalement'] {
    margin-right: auto;
  }
`

const SaveHeadBand = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  padding: 9px 16px;
  height: 22px;
  box-shadow: 0 3px 4px #7077854d;
  display: flex;
`

const HeaderTitle = styled.span`
  display: flex;
  gap: 8px;
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const Header = styled(MapMenuDialog.Header)`
  height: 30px;
  padding-left: 14px;
  padding-right: 14px;
`

const Body = styled(MapMenuDialog.Body)`
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const Wrapper = styled(MapToolBox)<{
  $top: number
}>`
  background-color: ${p => p.theme.color.white};
  top: ${p => p.$top}px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: ${REPORTING_MAP_FORM_WIDTH}px;
  height: ${p => `calc(100% - ${p.$top}px)`};
  z-index: 9999999999;
`
