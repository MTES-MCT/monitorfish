import type { MissionActionFormValues, MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

export type MissionWithActionsDraft = {
  actionsFormValues: MissionActionFormValues[]
  mainFormValues: MissionMainFormValues
}
