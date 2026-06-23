import type { VesselGroup } from '@features/VesselGroup/types'

export function isHardcodedGroup(groupId: number) {
  return groupId < 0
}

export function isPriorityGroup(group: VesselGroup) {
  return group.isPriorityGroup === true
}
