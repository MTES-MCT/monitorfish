import React from 'react'

import type { Mission } from '@features/Mission/mission.types'

export const MissionEventContext = React.createContext<Mission.Mission | undefined>(undefined)
