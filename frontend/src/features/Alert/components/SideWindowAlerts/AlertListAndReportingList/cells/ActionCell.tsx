import { validateAlert } from '@features/Alert/useCases/validateAlert'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { PendingAlert } from '@features/Alert/types'
import type { Promisable } from 'type-fest'

type ActionCellProps = Readonly<{
  alert: PendingAlert
  openSilenceAlertMenu: (pendingAlert: PendingAlert, anchorElement: HTMLElement) => Promisable<void>
}>
export function ActionCell({ alert, openSilenceAlertMenu }: ActionCellProps) {
  const dispatch = useMainAppDispatch()

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy="side-window-alerts-show-vessel"
        Icon={Icon.ViewOnMap}
        onClick={e => {
          const identity = extractVesselIdentityProps(alert)
          dispatch(showVessel(identity, false))
          e.stopPropagation()
        }}
        title="Voir sur la carte"
      />
      <IconButton
        accent={Accent.TERTIARY}
        color={THEME.color.mediumSeaGreen}
        data-cy="side-window-alerts-validate-alert"
        Icon={Icon.Confirm}
        onClick={() => dispatch(validateAlert(alert.id))}
        title="Valider l'alerte"
      />
      <IconButton
        accent={Accent.TERTIARY}
        color={THEME.color.maximumRed}
        data-cy="side-window-alerts-silence-alert"
        Icon={Icon.Reject}
        onClick={e => {
          openSilenceAlertMenu(alert, e.currentTarget as HTMLElement)
          e.stopPropagation()
        }}
        title="Suspendre l'alerte"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
