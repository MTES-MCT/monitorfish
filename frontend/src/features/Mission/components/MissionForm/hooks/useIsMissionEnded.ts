import {useMainAppSelector} from '@hooks/useMainAppSelector'
import {customDayjs} from '@mtes-mct/monitor-ui'

export function useGetIsMissionEnded(): boolean {
  const draft = useMainAppSelector(state => state.missionForm.draft)
  const now = customDayjs()
  const endDateTimeUtc = draft?.mainFormValues.endDateTimeUtc

  return endDateTimeUtc ? now.isAfter(endDateTimeUtc) : false
}
