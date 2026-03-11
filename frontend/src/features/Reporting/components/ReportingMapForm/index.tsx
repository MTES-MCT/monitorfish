import { WindowContext } from '@api/constants'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { ReportingForm } from '@features/Reporting/components/ReportingForm'
import type { Reporting } from '@features/Reporting/types'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import {AutoSaveTag} from "@features/Mission/components/MissionForm/shared/AutoSaveTag";

export function ReportingMapForm() {
  const dispatch = useMainAppDispatch()
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const top = useGetTopOffset()
  const { isOpened, isRendered } = useDisplayMapBox(isReportingMapFormDisplayed)
  const [vesselName, setVesselName] = useState<string | undefined>(undefined)
  const [flagState, setFlagState] = useState<string | undefined>(undefined)
  const [autoSavedLastUpdateDate, setAutoSavedLastUpdateDate] = useState<string | undefined>(undefined)
  const submitRef = useRef<(() => Promise<void>) | undefined>(undefined)

  const onClose = () => {
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isReportingMapFormDisplayed: false
      })
    )
  }

  const handleVesselStateChange = useCallback((name: string | undefined, flag: string | undefined) => {
    setVesselName(name)
    setFlagState(flag)
  }, [])

  const handleAutoSaved = useCallback((reporting: Reporting.Reporting) => {
    setAutoSavedLastUpdateDate(reporting.lastUpdateDate)
  }, [])

  const lastUpdateDate = autoSavedLastUpdateDate ?? editedReporting?.lastUpdateDate

  return (
    <>
      {isRendered && (
        <Wrapper $top={top} data-cy="map-reporting-form" isOpen={isOpened}>
          <Header>
            <HeaderTitle>
              <Icon.Report color={THEME.color.white} />
              <StyledTitle>
                {vesselName && <>
                  {flagState && <Flag rel="preload" src={`flags/${flagState?.toLowerCase()}.svg`} />}
                  {vesselName}
                </>}
                {!vesselName && 'NOUVEAU SIGNALEMENT INN'}
              </StyledTitle>
            </HeaderTitle>
            <CloseButton Icon={Icon.Close} onClick={onClose} title="Fermer" />
          </Header>
          <SaveHeadBand>
            {lastUpdateDate && `Dernière modif. le ${customDayjs(lastUpdateDate).utc().format('DD/MM/YY [à] HH[h]mm')}`}
            {!lastUpdateDate && 'Signalement non enregistré'}
            <StyledAutoSaveTag isAutoSaveEnabled={!editedReporting?.isArchived}/>
          </SaveHeadBand>
          <Body>
            <StyledReportingForm
              autoSave={!editedReporting?.isArchived}
              editedReporting={editedReporting}
              hasWhiteBackground
              hideButtons
              onAutoSaved={handleAutoSaved}
              onClose={onClose}
              onVesselStateChange={handleVesselStateChange}
              submitRef={submitRef}
              windowContext={WindowContext.MainWindow}
            />
          </Body>
          <StyledFooter>
            <Button accent={Accent.TERTIARY} onClick={onClose} title="Fermer">
              Fermer
            </Button>
            {!!editedReporting?.isArchived && <Button accent={Accent.TERTIARY} onClick={() => submitRef.current?.()} title="Enregistrer et fermer">
              Enregistrer et fermer
            </Button>}
          </StyledFooter>
        </Wrapper>
      )}
    </>
  )
}

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

  button {
    margin-left: auto;
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
  width: 480px;
  height: ${p => `calc(100% - ${p.$top}px)`};
  z-index: 9999999999;
`
