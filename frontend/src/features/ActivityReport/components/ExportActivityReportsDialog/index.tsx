import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useTracking } from '@hooks/useTracking'
import {
  Accent,
  Button,
  DatePicker,
  Dialog,
  FieldError,
  getUtcizedDayjs,
  Select,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { JDP } from '../../constants'
import { downloadActivityReports, NO_ACTIVITY_REPORT } from '../../useCases/downloadActivityReports'

import type { Promisable } from 'type-fest'

type ExportActivityReportsDialogProps = {
  onExit: () => Promisable<void>
}
export function ExportActivityReportsDialog({ onExit }: ExportActivityReportsDialogProps) {
  const { newWindowContainerRef } = useNewWindow()
  const dispatch = useMainAppDispatch()
  const { trackEvent } = useTracking()

  const [afterDateTimeUtc, setAfterDateTimeUtc] = useState<Date | undefined>()
  const [beforeDateTimeUtc, setBeforeDateTimeUtc] = useState<Date | undefined>()
  const [jdp, setJdp] = useState<JDP | undefined>()
  const [error, setError] = useState<string | undefined>()

  const handleOnConfirm = async () => {
    if (!afterDateTimeUtc || !beforeDateTimeUtc || !jdp) {
      return
    }

    setError(undefined)
    const afterDateTimeStartOfDayUtc = getUtcizedDayjs(afterDateTimeUtc).startOf('day').toISOString()
    const beforeDateTimeEndOfDayUtc = getUtcizedDayjs(beforeDateTimeUtc).endOf('day').millisecond(0).toISOString()

    try {
      const fileName = await dispatch(
        downloadActivityReports(afterDateTimeStartOfDayUtc, beforeDateTimeEndOfDayUtc, jdp)
      )
      trackEvent({
        action: 'Téléchargement de Act-Rep',
        category: 'DOWNLOAD',
        name: fileName
      })
    } catch (e) {
      // @ts-ignore
      if (e.message === NO_ACTIVITY_REPORT) {
        setError(`Aucun contrôle trouvé dans le cadre du ${JDP[jdp]}.`)

        return
      }
    }

    onExit()
  }

  const jdpOptions = Object.keys(JDP).map(key => ({ label: JDP[key], value: key }))

  return (
    <Dialog isAbsolute>
      <Dialog.Title onClose={onExit}>Exporter les ACT-REP</Dialog.Title>
      <StyledDialogBody>
        <p>
          Exporter les <i>Activity Report</i> (ACT-REP) avec les codes ISR au format CSV.
        </p>
        <DatePickerWrapper>
          Du
          <DatePicker
            baseContainer={newWindowContainerRef.current}
            isCompact
            isErrorMessageHidden
            isHistorical
            isLabelHidden
            label="Début"
            name="afterDateTimeUtc"
            onChange={nextDate => setAfterDateTimeUtc(nextDate)}
          />
          au
          <DatePicker
            baseContainer={newWindowContainerRef.current}
            isCompact
            isErrorMessageHidden
            isHistorical
            isLabelHidden
            label="Fin"
            name="beforeDateTimeUtc"
            onChange={nextDate => setBeforeDateTimeUtc(nextDate)}
          />
        </DatePickerWrapper>
        <Select
          isCleanable
          isLabelHidden
          label="JDP"
          name="jdp"
          onChange={nextJdp => {
            if (!nextJdp) {
              setJdp(undefined)

              return
            }

            setJdp(nextJdp as JDP)
          }}
          options={jdpOptions}
          placeholder="JDP"
          style={{ width: '270px' }}
          value={jdp}
        />
        {!!error && <StyledFieldError>{error}</StyledFieldError>}
      </StyledDialogBody>

      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={onExit}>
          Annuler
        </Button>
        <Button disabled={!afterDateTimeUtc || !beforeDateTimeUtc || !jdp} onClick={handleOnConfirm}>
          Exporter
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const StyledDialogBody = styled(Dialog.Body)`
  overflow-y: inherit;
`

const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  margin-top: 24px;
`
const StyledFieldError = styled(FieldError)`
  color: ${p => p.theme.color.maximumRed} !important;
`
