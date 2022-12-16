import type { Mission } from '../../../domain/types/mission'

export type MissionFilter = (missions: Mission[]) => Mission[]
