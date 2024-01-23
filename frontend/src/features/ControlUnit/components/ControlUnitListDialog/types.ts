import type { ControlUnit } from '@mtes-mct/monitor-ui'

export type FiltersState = {
  administrationId?: number
  categories?: ControlUnit.ControlUnitResourceCategory[]
  query?: string
  stationId?: number
  type?: string
}
