import styled from 'styled-components'

import { closeSideWindow, openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes.svg'
import { SideWindowMenuKey } from '../constants'

export function AlertsMapButton() {
  const dispatch = useAppDispatch()
  const { healthcheckTextWarning, openedSideWindowTab, previewFilteredVesselsMode } = useAppSelector(
    state => state.global
  )

  return (
    <AlertsButton
      data-cy="alerts-button"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={Boolean(previewFilteredVesselsMode)}
      isVisible={openedSideWindowTab === SideWindowMenuKey.ALERTS}
      onClick={() => {
        if (openedSideWindowTab !== SideWindowMenuKey.ALERTS) {
          dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))

          return
        }

        if (openedSideWindowTab === SideWindowMenuKey.ALERTS) {
          dispatch(closeSideWindow())
        }
      }}
      title="Alertes"
    >
      <AlertsIcon />
    </AlertsButton>
  )
}

const AlertsButton = styled(MapButtonStyle)<{
  isVisible: boolean
}>`
  position: absolute;
  display: inline-block;
  background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 120px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  }
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 5px;
  width: 20px;
`
