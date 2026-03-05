import styled from "styled-components"
import {MapToolBox} from "@features/Map/components/MapButtons/shared/MapToolBox";
import {useMainAppSelector} from "@hooks/useMainAppSelector";
import { useDisplayMapBox } from "@hooks/useDisplayMapBox";
import {useGetTopOffset} from "@hooks/useGetTopOffset";
import {Accent, Button, Icon, MapMenuDialog, THEME} from "@mtes-mct/monitor-ui";
import {ReportingForm} from "@features/Reporting/components/ReportingForm";
import {WindowContext} from "@api/constants";
import {displayedComponentActions} from "../../../../domain/shared_slices/DisplayedComponent";
import {useMainAppDispatch} from "@hooks/useMainAppDispatch";

export function ReportingMapForm() {
  const dispatch = useMainAppDispatch()
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const top = useGetTopOffset()
  const { isOpened, isRendered } = useDisplayMapBox(isReportingMapFormDisplayed)

  const onClose = () => {
    dispatch(displayedComponentActions.setDisplayedComponents({
      isReportingMapFormDisplayed: false
    }))
  }

  const saveAndClose = () => {}

  return (
    <>
      {isRendered && (
        <Wrapper $top={top} isOpen={isOpened} data-cy="map-reporting-form">
          <Header>
            <HeaderTitle>
              <Icon.Report color={THEME.color.white} />
              <MapMenuDialog.Title>NOUVEAU SIGNALEMENT INN</MapMenuDialog.Title>
            </HeaderTitle>
            <CloseButton Icon={Icon.Close} onClick={onClose} title="Fermer" />
          </Header>
          <Body>
            <ReportingForm hasWhiteBackground editedReporting={undefined} onClose={onClose} windowContext={WindowContext.MainWindow} />
          </Body>
          <StyledFooter>
            <Button accent={Accent.TERTIARY} onClick={onClose} title="Fermer">
              Fermer
            </Button>
            <Button accent={Accent.TERTIARY} onClick={saveAndClose} title="Enregistrer et fermer">
              Enregistrer et fermer
            </Button>
          </StyledFooter>
        </Wrapper>
      )}
    </>
  )
}

const StyledFooter = styled(MapMenuDialog.Footer)`
  background-color: ${p => p.theme.color.charcoal};
  height: 30px;
  padding: 9px 14px;
  flex-shrink: 0;
  text-align: right;
  width: unset;

  button {
    margin-left: auto;
  }
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
  padding: 16px;
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
