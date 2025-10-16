import { addSilencedAlert } from '@features/Alert/useCases/addSilencedAlert'
import { reactivateSilencedAlert } from '@features/Alert/useCases/reactivateSilencedAlert'
import { Flag } from '@features/commonComponents/Flag'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, CustomSearch, Icon, pluralize, Size, TextInput } from '@mtes-mct/monitor-ui'
import { sortArrayByColumn, SortType } from '@utils/sortArrayByColumn'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled, { css } from 'styled-components'
import * as timeago from 'timeago.js'

import { AddSilencedAlertDialog } from './AddSilencedAlertDialog'
import { getDateTime } from '../../../../../utils'

import type { SilencedAlertData } from '../../../types'

export function SilencedAlerts() {
  const dispatch = useMainAppDispatch()
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)
  const silencedAlerts = useMainAppSelector(state => state.alert.silencedAlerts)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('silencedBeforeDate')
  const [sortType] = useState(SortType.ASC)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [isAddSilencedAlertDialogOpen, setIsAddSilencedAlertDialogOpen] = useState(false)

  const fuse = useMemo(
    () =>
      new CustomSearch(
        structuredClone(silencedAlerts),
        ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs', 'value.name'],
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
    (id: number) => {
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
        <StyledTextInput
          data-cy="side-window-silenced-alerts-search-vessel"
          isLabelHidden
          isSearchInput
          isTransparent
          label="Rechercher un navire ou une alerte"
          name="searchQuery"
          onChange={setSearchQuery}
          placeholder="Rechercher un navire ou une alerte"
          size={Size.LARGE}
          value={searchQuery}
        />
        <AddSilencedAlert Icon={Icon.Plus} onClick={() => setIsAddSilencedAlertDialogOpen(true)}>
          Ajouter une nouvelle suspension
        </AddSilencedAlert>
      </Filters>
      <NumberOfAlerts>
        {sortedAlerts.length} {pluralize('suspension', sortedAlerts.length)}
      </NumberOfAlerts>
      <StyledList $count={sortedAlerts?.length} data-cy="side-window-silenced-alerts-list">
        <Row key={0} $isHeader index={0}>
          <FlexboxGrid>
            <VesselName>Navire</VesselName>
            <AlertName colspan={7}>Titre</AlertName>
            <Natinf>NATINF</Natinf>
            <DateColumn>Suspendue pour...</DateColumn>
            <DateColumn>Reprise le...</DateColumn>
          </FlexboxGrid>
        </Row>
        <ScrollableContainer>
          {sortedAlerts.map((alert, index) => (
            <Row
              key={alert.id}
              $isFocused={alert.id === focusedPendingAlertId}
              $toClose={!!alert.isReactivated || false}
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
                  <AlertName>{alert.value.name}</AlertName>
                  <Natinf>{alert.value.natinfCode}</Natinf>
                  <DateColumn>{timeago.format(alert.silencedBeforeDate, 'fr')}</DateColumn>
                  <DateColumn>{getDateTime(alert.silencedBeforeDate, true)}</DateColumn>
                  <EmptyColumn />
                  <IconColumn>
                    <ShowIcon
                      alt="Voir sur la carte"
                      data-cy="side-window-silenced-alerts-show-vessel"
                      onClick={() => {
                        const identity = extractVesselIdentityProps(alert)
                        dispatch(showVessel(identity, false))
                      }}
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      title="Voir sur la carte"
                    />
                  </IconColumn>
                  <IconColumn>
                    <ReactivateAlertIcon
                      alt="Réactiver l'alerte"
                      data-cy="side-window-silenced-alerts-delete-silenced-alert"
                      onClick={() => reactivateSilencedAlertCallback(alert.id)}
                      src={`${baseUrl}/Icone_alertes_gris.png`}
                      title="Réactiver l'alerte"
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

const NumberOfAlerts = styled.span`
  font-weight: 500;
  margin-top: 28px;
  display: flex;
`

const StyledTextInput = styled(TextInput)`
  width: 310px;
`

const AddSilencedAlert = styled(Button)`
  margin-left: auto;
  vertical-align: bottom;
  height: 34px;
`

const Wrapper = styled.div`
  margin-left: 32px;
  margin-bottom: 20px;
`

const Filters = styled.div`
  display: flex;
  -moz-box-align: center;
  align-items: center;
`

const Title = styled.h2`
  color: ${p => p.theme.color.gunMetal};
  font-size: 22px;
  font-weight: 700;
  margin: 30px 0;
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
  max-height: calc(100vh - 240px);
  overflow-y: auto;
`

const NoAlerts = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-top: 20px;
  text-align: center;
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
  $count?: number
}>`
  box-shadow: unset;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  width: ${p => (p.$count && p.$count > 9 ? 1260 + 16 : 1260)}px;
  margin-bottom: 10px;
  margin-top: 13px;
  overflow: visible;
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
  height: 42px;
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

const AlertName = styled(FlexboxGrid.Item)`
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
