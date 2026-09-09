import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapBox } from '@features/Map/constants'
import { ReportingZoneFilter } from '@features/Reporting/components/ReportingZoneFilter'
import {
  IUU_OPTIONS,
  REPORTING_ORIGIN_AS_OPTIONS,
  REPORTING_SEARCH_PERIOD_AS_OPTIONS,
  REPORTING_TYPE_OPTIONS,
  STATUS_OPTIONS
} from '@features/Reporting/constants'
import {
  getArchivedValue,
  getCustomPeriodValue,
  getIUUValue,
  useReportingsFilters
} from '@features/Reporting/hooks/useReportingsFilters'
import { reportingActions } from '@features/Reporting/slice'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, DateRangePicker, Icon, MapMenuDialog, Select } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'

export function ReportingMapMenuDialog() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isReportingLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingLayerDisplayed)

  const {
    filters,
    updateCustomPeriod,
    updateIsIUU,
    updateOrigin,
    updateReportingPeriod,
    updateReportingStatus,
    updateReportingType
  } = useReportingsFilters()

  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.REPORTINGS)

  const toggleMenu = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.REPORTINGS ? undefined : MapBox.REPORTINGS))
  }

  const toggleReportingLayer = () => {
    dispatch(
      displayedComponentActions.setDisplayedComponents({ isReportingLayerDisplayed: !isReportingLayerDisplayed })
    )
    dispatch(reportingActions.unsetSelectedReportingFeatureId())
  }
  const toggleCreateReporting = () => {
    dispatch(setRightMapBoxDisplayed(undefined))
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isReportingMapFormDisplayed: true
      })
    )
  }
  const toggleReportingList = () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
  }

  const iuuValue = getIUUValue(filters.isIUU)
  const archivedValue = getArchivedValue(filters.isArchived)
  const customValue = getCustomPeriodValue(filters)

  return (
    isRendered && (
      <Wrapper data-cy="reporting-map-menu-box" isOpen={isOpened}>
        <Header>
          <CloseButton Icon={Icon.Close} onClick={toggleMenu} title="Fermer" />
          <MapMenuDialog.Title>Signalements</MapMenuDialog.Title>
          <MapMenuDialog.VisibilityButton
            accent={Accent.SECONDARY}
            Icon={isReportingLayerDisplayed ? Icon.Display : Icon.Hide}
            onClick={toggleReportingLayer}
            title={isReportingLayerDisplayed ? 'Masquer les signalements' : 'Afficher les signalements'}
          />
        </Header>
        <StyledBody>
          <FilterRow>
            <Select
              isCleanable={false}
              isLabelHidden
              isLight
              label="Période"
              name="reportingPeriod"
              onChange={value => updateReportingPeriod(value as ReportingSearchPeriod)}
              options={REPORTING_SEARCH_PERIOD_AS_OPTIONS}
              placeholder="Période"
              value={filters.reportingPeriod}
            />
            {filters.reportingPeriod === ReportingSearchPeriod.CUSTOM && (
              <StyledCustomPeriodContainer>
                <DateRangePicker
                  defaultValue={customValue}
                  hasSingleCalendar
                  isCompact
                  isLabelHidden
                  isStringDate
                  isTransparent
                  label="Période spécifique"
                  name="customPeriod"
                  onChange={updateCustomPeriod}
                  withFullDayDefaults
                />
              </StyledCustomPeriodContainer>
            )}
            <Select
              isLabelHidden
              isLight
              label="Statut"
              name="status"
              onChange={value => updateReportingStatus(value)}
              options={STATUS_OPTIONS}
              placeholder="Statut"
              value={archivedValue}
            />
            <Select
              isLabelHidden
              isLight
              label="Type"
              name="reportingType"
              onChange={value => updateReportingType(value)}
              options={REPORTING_TYPE_OPTIONS}
              placeholder="Type"
              value={filters.reportingType}
            />
            <Select
              isLabelHidden
              isLight
              label="INN / non INN"
              name="isIUU"
              onChange={value => updateIsIUU(value)}
              options={IUU_OPTIONS}
              placeholder="INN / non INN"
              value={iuuValue}
            />
            <Select
              isLabelHidden
              isLight
              label="Source"
              name="origin"
              onChange={value => updateOrigin(value)}
              options={REPORTING_ORIGIN_AS_OPTIONS}
              placeholder="Source"
              value={filters.origin}
            />
            <ReportingZoneFilter />
          </FilterRow>
          <StyledFooter>
            <Button accent={Accent.PRIMARY} Icon={Icon.Plus} onClick={toggleCreateReporting}>
              Créer un nouveau signalement INN
            </Button>
            <Button accent={Accent.SECONDARY} Icon={Icon.Expand} onClick={toggleReportingList}>
              Voir la vue détaillée des signalements
            </Button>
          </StyledFooter>
        </StyledBody>
      </Wrapper>
    )
  )
}

const FilterRow = styled.div`
  padding: 0 16px 8px;
  gap: 8px;
  display: flex;
  flex-direction: column;

  .rs-picker-select {
    border: 1px solid ${p => p.theme.color.lightGray};
  }
  .rs-picker-toggle {
    z-index: unset !important;
  }
`

const StyledCustomPeriodContainer = styled.div`
  display: flex;
  align-items: start;
  text-align: left;

  .Field-DateRangePicker__RangeCalendarPicker {
    position: absolute;
  }
`

const StyledBody = styled(MapMenuDialog.Body)`
  padding: 16px 0 0;
`

const Wrapper = styled(MapToolBox)`
  top: 0;
  width: 320px;
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const Header = styled(MapMenuDialog.Header)`
  height: 22px;
`

const StyledFooter = styled(MapMenuDialog.Footer)`
  padding: 32px 16px 16px 16px;
  width: unset;

  button {
    width: 100%;
  }
`
