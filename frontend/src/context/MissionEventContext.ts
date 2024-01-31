import React from 'react'

import type { Mission } from '../domain/entities/mission/types'

export const MissionEventContext = React.createContext<Mission.Mission | undefined>(undefined)
