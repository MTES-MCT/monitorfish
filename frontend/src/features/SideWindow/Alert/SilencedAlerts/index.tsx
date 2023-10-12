import { Button, CustomSearch, Icon } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled, { css } from 'styled-components'
import * as timeago from 'timeago.js'

import { AddSilencedAlertDialog } from './AddSilencedAlertDialog'
import { COLORS } from '../../../../constants/constants'
import { addSilencedAlert } from '../../../../domain/use_cases/alert/addSilencedAlert'
import { reactivateSilencedAlert } from '../../../../domain/use_cases/alert/reactivateSilencedAlert'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../utils'
import SearchIconSVG from '../../../icons/Loupe_dark.svg?react'
import { Flag } from '../../../VesselList/tableCells'
import { sortArrayByColumn, SortType } from '../../../VesselList/tableSort'
import { getAlertNameFromType } from '../AlertListAndReportingList/utils'

import type { SilencedAlertData } from '../../../../domain/entities/alerts/types'

export function SilencedAlerts() {
  const dispatch = useMainAppDispatch()
  const { focusedPendingAlertId, silencedAlerts } = useMainAppSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('silencedBeforeDate')
  const [sortType] = useState(SortType.ASC)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [isAddSilencedAlertDialogOpen, setIsAddSilencedAlertDialogOpen] = useState(false)

  const fuse = useMemo(
    () =>
      new CustomSearch(
        silencedAlerts,
        [
          'vesselName',
          'internalReferenceNumber',
          'externalReferenceNumber',
          'ircs',
          {
            getFn: alert => getAlertNameFromType(alert.value.type),
            name: ['value', 'type']
          }
        ],
        { threshold: 0.4 }
      ),
    [silencedAlerts]
  )

  const filteredAlerts = useMemo(() => {
    if (!searchQuery || searchQuery.length <= 1) {
      return silencedAlerts
    }

    return fuse.find(searchQuery)
  }, [silencedAlerts, searchQuery, fuse])

  const sortedAlerts = useMemo(
    () => filteredAlerts.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType)),
    [filteredAlerts, sortColumn, sortType]
  )

  const reactivateSilencedAlertCallback = useCallback(
    (id: string) => {
      dispatch(reactivateSilencedAlert(id))
    },
    [dispatch]
  )

  const addSilencedAlertCallback = useCallback(
    async (nextSilencedAlert: SilencedAlertData) => {
      await dispatch(addSilencedAlert(nextSilencedAlert))
      setIsAddSilencedAlertDialogOpen(false)
    },
    [dispatch]
  )

  const cancelAddSilencedAlertCallback = useCallback(() => {
    setIsAddSilencedAlertDialogOpen(false)
  }, [])

  return (
    <Wrapper>
      <Title>Suspension d’alertes</Title>
      <Filters>
        <SearchVesselInput
          baseUrl={baseUrl}
          data-cy="side-window-silenced-alerts-search-vessel"
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un navire ou une alerte"
          type="text"
          value={searchQuery}
        />
        <AddSilencedAlert Icon={Icon.Plus} onClick={() => setIsAddSilencedAlertDialogOpen(true)}>
          Ajouter une nouvelle suspension
        </AddSilencedAlert>
      </Filters>
      <StyledList count={sortedAlerts?.length} data-cy="side-window-silenced-alerts-list">
        <Row key={0} $isHeader index={0}>
          <FlexboxGrid>
            <VesselName>Navire</VesselName>
            <AlertType colspan={7}>Titre</AlertType>
            <Natinf>NATINF</Natinf>
            <DateColumn>Ignorée pour...</DateColumn>
            <DateColumn>Reprise le...</DateColumn>
          </FlexboxGrid>
        </Row>
        <ScrollableContainer>
          {sortedAlerts.map((alert, index) => (
            <Row
              key={alert.id}
              $isFocused={alert.id === focusedPendingAlertId}
              $toClose={alert.isReactivated || false}
              index={index + 1}
            >
              {alert.isReactivated && <AlertTransition>L’alerte est réactivée</AlertTransition>}
              {!alert.isReactivated && (
                <FlexboxGrid>
                  <VesselName>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.flagState.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: 1, width: 18 }}
                      title={countries.getName(alert.flagState.toLowerCase(), 'fr')}
                    />
                    {alert.vesselName}
                  </VesselName>
                  <AlertType>{getAlertNameFromType(alert.value.type)}</AlertType>
                  <Natinf>{alert.value.natinfCode}</Natinf>
                  <DateColumn>{timeago.format(alert.silencedBeforeDate, 'fr')}</DateColumn>
                  <DateColumn>{getDateTime(alert.silencedBeforeDate, true)}</DateColumn>
                  <EmptyColumn />
                  <IconColumn>
                    <ShowIcon
                      alt="Voir sur la carte"
                      data-cy="side-window-silenced-alerts-show-vessel"
                      onClick={() => {
                        dispatch(showVessel(alert, false, true))
                      }}
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      title="Voir sur la carte"
                    />
                  </IconColumn>
                  <IconColumn>
                    <ReactivateAlertIcon
                      alt={"Réactiver l'alerte"}
                      data-cy="side-window-silenced-alerts-delete-silenced-alert"
                      onClick={() => reactivateSilencedAlertCallback(alert.id)}
                      src={`${baseUrl}/Icone_alertes_gris.png`}
                      title={"Réactiver l'alerte"}
                    />
                  </IconColumn>
                </FlexboxGrid>
              )}
            </Row>
          ))}
        </ScrollableContainer>
        {!sortedAlerts?.length && <NoAlerts>Aucune alerte suspendue</NoAlerts>}
      </StyledList>
      {isAddSilencedAlertDialogOpen && (
        <AddSilencedAlertDialog onCancel={cancelAddSilencedAlertCallback} onConfirm={addSilencedAlertCallback} />
      )}
    </Wrapper>
  )
}

const AddSilencedAlert = styled(Button)`
  margin-left: auto;
  vertical-align: bottom;
  height: 34px;
`

const Wrapper = styled.div`
  margin-left: 40px;
`

const Filters = styled.div`
  display: flex;
  -moz-box-align: center;
  align-items: center;
`

const Title = styled.h2`
  color: ${COLORS.gunMetal};
  font-size: 22px;
  font-weight: 700;
  margin: 30px 0px;
  padding-bottom: 5px;
  text-align: left;
  transition: all 0.2s;
  width: fit-content;
`

const AlertTransition = styled.div`
  background: #29b36133 0% 0% no-repeat padding-box;
  color: ${p => p.theme.color.mediumSeaGreen};
  font-weight: 500;
  height: 41px;
  line-height: 41px;
  margin-top: -13px;
  text-align: center;
`

const ScrollableContainer = styled.div`
  max-height: calc(100vh - 210px);
  overflow-y: auto;
`

const NoAlerts = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-top: 20px;
  text-align: center;
`

const SearchVesselInput = styled.input<{
  baseUrl: string
}>`
  background-color: ${p => p.theme.color.white};
  background-image: ${p => `url(${p.baseUrl}${SearchIconSVG})`};
  background-position: bottom 3px right 5px;
  background-repeat: no-repeat;
  background-size: 25px;
  border: ${p => `1px ${p.theme.color.lightGray} solid`};
  border-radius: 0;
  color: ${p => p.theme.color.gunMetal};
  flex: 3;
  font-size: 13px;
  height: 40px;
  margin-bottom: 5px;
  padding: 0 5px 0 10px;
  width: 280px;
  min-width: 280px;
  flex-grow: 0;

  :hover, :focus: {
    border-bottom: ${p => `1px ${p.theme.color.lightGray} solid`};
  }
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img`
  cursor: pointer;
  flex-shrink: 0;
  float: right;
  height: 16px;
  margin-left: auto;
  padding-right: 7px;
  width: 20px;
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ReactivateAlertIcon = styled.img`
  cursor: pointer;
  flex-shrink: 0;
  float: right;
  height: 18px;
  margin-left: auto;
  padding-right: 10px;
`

const styleCenter = css`
  align-items: center;
  display: flex;
  height: 15px;
`

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
const StyledList = styled(List)<{
  count?: number
}>`
  box-shadow: unset;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  width: ${p => (p.count && p.count > 9 ? 1260 + 16 : 1260)}px;
  margin-bottom: 10px;
  margin-top: 10px;
  overflow: 'visible';
`

const Row = styled(List.Item)<{
  $isFocused?: boolean
  $isHeader?: boolean
  $toClose?: boolean
}>`
  animation: ${p => (p.$toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset')};
  background: ${p => {
    if (p.$isHeader) {
      return p.theme.color.white
    }

    if (p.$isFocused) {
      return p.theme.color.gainsboro
    }

    return p.theme.color.cultured
  }};
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 1px;
  height: 15px;
  margin-top: 6px;
  overflow: hidden;
  transition: background 3s;
  color: ${p => (p.$isHeader ? p.theme.color.slateGray : p.theme.color.gunMetal)};
`

const VesselName = styled(FlexboxGrid.Item)`
  ${styleCenter}
  display: flex;
  margin-left: 20px;
  width: 280px;
`

const AlertType = styled(FlexboxGrid.Item)`
  ${styleCenter}
  width: 410px;
`

const Natinf = styled(FlexboxGrid.Item)`
  ${styleCenter}
  width: 150px;
`

const DateColumn = styled(FlexboxGrid.Item)`
  ${styleCenter}
  width: 150px;
`

const IconColumn = styled(FlexboxGrid.Item)`
  ${styleCenter}
  margin-left: 10px;
  width: 30px;
`

const EmptyColumn = styled(FlexboxGrid.Item)`
  ${styleCenter}
  border-left: ${p => `1px solid ${p.theme.color.lightGray}`};
  height: 43px;
  margin-right: 5px;
  margin-top: -14px;
  width: 2px;
`
