import type { Mission } from '../../../domain/entities/mission/types'

export type MissionFilter = (missions: Mission.Mission[]) => Mission.Mission[]
