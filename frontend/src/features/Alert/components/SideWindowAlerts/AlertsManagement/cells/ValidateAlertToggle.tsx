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

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={e => e.stopPropagation()}>
        <Toggle
          checked={alertSpecification.isActivated}
          disabled={!alertSpecification.isUserDefined}
          isLabelHidden
          label={`${alertSpecification.isActivated ? 'Activer' : 'Désactiver'} l'alerte "${alertSpecification.name}"`}
          name={`activate-alert-${alertSpecification.type}-${alertSpecification.id ?? 0}`}
          onChange={handleChange}
          size="sm"
        />
      </div>
    </>
  )
}
