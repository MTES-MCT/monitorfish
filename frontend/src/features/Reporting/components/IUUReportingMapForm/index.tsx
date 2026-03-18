import { WindowContext } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { AutoSaveTag } from '@features/Mission/components/MissionForm/shared/AutoSaveTag'
import { ReportingForm } from '@features/Reporting/components/ReportingForm'
import { reportingActions } from '@features/Reporting/slice'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { deleteReporting } from '@features/Reporting/useCases/deleteReporting'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, Icon, IconButton, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'

import type { Reporting } from '@features/Reporting/types'

export const REPORTING_MAP_FORM_WIDTH = 480

export function IUUReportingMapForm() {
  const dispatch = useMainAppDispatch()
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const top = useGetTopOffset()
  const { isOpened, isRendered } = useDisplayMapBox(isReportingMapFormDisplayed)
  const [vesselName, setVesselName] = useState<string | undefined>(undefined)
  const [flagState, setFlagState] = useState<string | undefined>(undefined)
  const [autoSavedLastUpdateDate, setAutoSavedLastUpdateDate] = useState<string | undefined>(undefined)
  const submitRef = useRef<(() => Promise<void>) | undefined>(undefined)
  const isDirtyRef = useRef(false)
  const reportingIdRef = useRef(editedReporting?.id)
  const reportingTypeRef = useRef(editedReporting?.type)
  const [isDraftCancellationConfirmationDialogOpen, setIsDraftCancellationConfirmationDialogOpen] = useState(false)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)

  useEffect(() => {
    if (!editedReporting) {
      reportingIdRef.current = undefined
      reportingTypeRef.current = undefined
      setVesselName(undefined)
      setFlagState(undefined)
      setAutoSavedLastUpdateDate(undefined)

      return
    }

    reportingIdRef.current = editedReporting?.id
    reportingTypeRef.current = editedReporting?.type
  }, [editedReporting])

  const onClose = () => {
    if (isDirtyRef.current) {
      setIsDraftCancellationConfirmationDialogOpen(true)

      return
    }

    handleClose()
  }

  const handleClose = () => {
    setIsDraftCancellationConfirmationDialogOpen(false)
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isReportingMapFormDisplayed: false
      })
    )
    dispatch(reportingActions.unsetEditedReporting())
  }

  const handleDelete = () => {
    assertNotNullish(reportingIdRef.current)
    assertNotNullish(reportingTypeRef.current)

    setIsDeletionConfirmationDialogOpen(false)
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isReportingMapFormDisplayed: false
      })
    )
    dispatch(reportingActions.unsetEditedReporting())
    dispatch(deleteReporting(reportingIdRef.current, reportingTypeRef.current))
  }

  const handleVesselStateChange = useCallback((name: string | undefined, flag: string | undefined) => {
    setVesselName(name)
    setFlagState(flag)
  }, [])

  const handleAutoSaved = useCallback((reporting: Reporting.Reporting) => {
    setAutoSavedLastUpdateDate(reporting.lastUpdateDate)
    reportingIdRef.current = reporting.id
    reportingTypeRef.current = reporting.type as ReportingType.INFRACTION_SUSPICION | ReportingType.OBSERVATION
  }, [])

  const handleDirty = useCallback((isDirty: boolean) => {
    isDirtyRef.current = isDirty
  }, [])

  const lastUpdateDate = autoSavedLastUpdateDate ?? editedReporting?.lastUpdateDate

  return (
    <>
      {isRendered && (
        <>
          <Wrapper $top={top} data-cy="map-reporting-form" isOpen={isOpened}>
            <Header>
              <HeaderTitle>
                <Icon.Report color={THEME.color.white} />
                <StyledTitle>
                  {vesselName && (
                    <>
                      {flagState && <Flag rel="preload" src={`flags/${flagState?.toLowerCase()}.svg`} />}
                      {vesselName}
                    </>
                  )}
                  {!vesselName && 'NOUVEAU SIGNALEMENT INN'}
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
                editedReporting={editedReporting}
                hasWhiteBackground
                hideButtons
                isIUU
                onAutoSaved={handleAutoSaved}
                onClose={onClose}
                onIsDirty={handleDirty}
                onVesselStateChange={handleVesselStateChange}
                submitRef={submitRef}
                windowContext={WindowContext.MainWindow}
              />
            </Body>
            <StyledFooter>
              {!!reportingIdRef.current && (
                <DeleteButton
                  accent={Accent.SECONDARY}
                  color={THEME.color.maximumRed}
                  Icon={Icon.Delete}
                  onClick={() => {
                    setIsDeletionConfirmationDialogOpen(true)
                  }}
                  title="Supprimer ce signalement"
                />
              )}

              <Button accent={Accent.TERTIARY} onClick={onClose} title="Fermer">
                Fermer
              </Button>
              {!!editedReporting?.isArchived && (
                <Button accent={Accent.TERTIARY} onClick={() => submitRef.current?.()} title="Enregistrer et fermer">
                  Enregistrer et fermer
                </Button>
              )}
            </StyledFooter>
          </Wrapper>
          {isDraftCancellationConfirmationDialogOpen && (
            <ConfirmationModal
              cancelButtonLabel="Retourner à l’édition"
              color={THEME.color.maximumRed}
              confirmationButtonLabel="Quitter sans enregistrer"
              message={
                <>
                  <p>Vous êtes en train d’abandonner l’édition d’un signalement.</p>
                  <p>Voulez-vous enregistrer les modifications avant de quitter ?</p>
                </>
              }
              onCancel={() => setIsDraftCancellationConfirmationDialogOpen(false)}
              onConfirm={handleClose}
              title="Abandon des modifications"
            />
          )}
          {isDeletionConfirmationDialogOpen && (
            <ConfirmationModal
              color={THEME.color.maximumRed}
              confirmationButtonLabel="Supprimer"
              message={
                <>
                  <p>Êtes-vous sûr de vouloir supprimer ce signalement ?</p>
                </>
              }
              onCancel={() => setIsDeletionConfirmationDialogOpen(false)}
              onConfirm={handleDelete}
              title="Suppression d'un signalement"
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
  padding: 4px;
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

  button[title='Supprimer ce signalement'] {
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
