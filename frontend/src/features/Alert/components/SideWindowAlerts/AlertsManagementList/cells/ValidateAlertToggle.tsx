import { hasCriterias } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/utils'
import { Toggle } from '@mtes-mct/monitor-ui'

import type { AlertSpecification } from '@features/Alert/types'

export function ValidateAlertToggle({
  alertSpecification,
  onToggleConfirmation
}: {
  alertSpecification: AlertSpecification
  onToggleConfirmation?:
    | ((alertSpecification: AlertSpecification, action: 'activate' | 'deactivate') => void)
    | undefined
}) {
  const handleChange = (checked: boolean) => {
    if (onToggleConfirmation) {
      const action = checked ? 'activate' : 'deactivate'
      onToggleConfirmation(alertSpecification, action)
    }
  }

  const { hasNoCriteria } = hasCriterias(alertSpecification)

  const title = hasNoCriteria
    ? 'L’alerte ne peut pas être activée tant qu’elle n’a pas de critères définis'
    : `${alertSpecification.isActivated ? 'Désactiver' : 'Activer'} l'alerte "${alertSpecification.name}"`

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={e => e.stopPropagation()}>
        <Toggle
          checked={hasNoCriteria ? false : alertSpecification.isActivated}
          disabled={!alertSpecification.isUserDefined || hasNoCriteria}
          isLabelHidden
          label={title}
          name={`activate-alert-${alertSpecification.type}-${alertSpecification.id ?? 0}`}
          onChange={handleChange}
          size="sm"
          title={title}
        />
      </div>
    </>
  )
}
