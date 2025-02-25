export type MonitorFishFeature = {
  date: string
  // ISO 8601
  description: string
  for: 'ALL' | 'CNSP' | 'EXTERNAL'
  title: string
  type: 'IMPROVEMENT' | 'NEW_FEATURE'
}
