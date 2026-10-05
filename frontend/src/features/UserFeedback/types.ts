import type { FileApi } from '@mtes-mct/monitor-ui'

export type UserFeedback = {
  files: FileApi[]
  message: string
  pageUrl: string
}
