export type MonitorFishFeature = {
  // ISO 8601
  date: string
  description: string
  for: 'ALL' | 'CNSP' | 'EXTERNAL'
  title: string
  type: 'IMPROVEMENT' | 'NEW_FEATURE'
}
