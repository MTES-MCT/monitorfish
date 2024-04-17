import { MapToolButton } from '@features/MapButtons/shared/MapToolButton'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useContext } from 'react'

import { LogoutContext } from '../../../context/LogoutContext'

export function Logout() {
  const logout = useContext(LogoutContext)

  return (
    <MapToolButton
      isActive={false}
      onClick={logout}
      style={{ bottom: 100, color: THEME.color.gainsboro, cursor: 'pointer', right: 10, zIndex: 99999 }}
      title="Se déconnecter"
    >
      <Icon.Close size={20} />
    </MapToolButton>
  )
}
