export type Gear = {
  category: string
  /** ID. */
  code: string
  // TODO Use an enum to represent the group ID.
  groupId: 1 | 2
  isMeshRequiredForSegment: boolean
  name: string
}
