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

import { JDP } from './constants'
import { downloadActivityReports, NO_ACTIVITY_REPORT } from './useCases/downloadActivityReports'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { Promisable } from 'type-fest'

type ExportActivityReportsDialogProps = {
  onExit: () => Promisable<void>
}
export function ExportActivityReportsDialog({ onExit }: ExportActivityReportsDialogProps) {
  const { newWindowContainerRef } = useNewWindow()
  const dispatch = useMainAppDispatch()

  const [afterDateTimeUtc, setAfterDateTimeUtc] = useState<Date | undefined>()
  const [beforeDateTimeUtc, setBeforeDateTimeUtc] = useState<Date | undefined>()
  const [jdp, setJdp] = useState<JDP | undefined>()
  const [error, setError] = useState<string | undefined>()

  const handleOnConfirm = async () => {
    if (!afterDateTimeUtc || !beforeDateTimeUtc || !jdp) {
      return
    }

    const afterDateTimeStartOfDayUtc = getUtcizedDayjs(afterDateTimeUtc).startOf('day').toISOString()
    const beforeDateTimeEndOfDayUtc = getUtcizedDayjs(beforeDateTimeUtc).endOf('day').millisecond(0).toISOString()

    try {
      await dispatch(downloadActivityReports(afterDateTimeStartOfDayUtc, beforeDateTimeEndOfDayUtc, jdp))
    } catch (e) {
      // @ts-ignore
      if (e.message === NO_ACTIVITY_REPORT) {
        setError(`Aucun contrôle trouvé dans le cadre du ${JDP[jdp]}.`)

        return
      }
    }

    setError(undefined)
    onExit()
  }

  const jdpOptions = Object.keys(JDP).map(key => ({ label: JDP[key], value: key }))

  return (
    <Dialog isAbsolute>
      <StyledDialogTitle>Exporter les ACT-REP</StyledDialogTitle>
      <StyledDialogBody>
        <StyledParagraph>
          Exporter les <i>Activity Report</i> (ACT-REP) au format CSV.
          <br />
          Attention à bien finaliser le document avec les infractions avant envoi.
        </StyledParagraph>
        <div>
          Du
          <DatePicker
            baseContainer={newWindowContainerRef.current}
            isCompact
            isErrorMessageHidden
            isHistorical
            isLabelHidden
            label="Début"
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
            onChange={nextDate => setBeforeDateTimeUtc(nextDate)}
          />
        </div>
        <StyledSelect
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
          searchable
          value={jdp || undefined}
        />
      </StyledDialogBody>
      {!!error && (
        <StyledDialogErrorAction>
          <FieldError>{error}</FieldError>
        </StyledDialogErrorAction>
      )}
      <StyledDialogAction>
        <Button accent={Accent.TERTIARY} onClick={onExit}>
          Annuler
        </Button>
        <Button
          accent={Accent.PRIMARY}
          disabled={!afterDateTimeUtc || !beforeDateTimeUtc || !jdp}
          onClick={handleOnConfirm}
        >
          Exporter
        </Button>
      </StyledDialogAction>
    </Dialog>
  )
}

// TODO Remove that once we get rid of global legacy CSS.
const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`

const StyledDialogAction = styled(Dialog.Action)`
  padding: 24px 8px;
`

const StyledDialogErrorAction = styled(Dialog.Action)`
  padding: 8px 0px 0px 0px;
`

const StyledDialogBody = styled(Dialog.Body)`
  padding-top: 24px;

  > div {
    align-items: center;
    display: flex;
    margin-right: auto;
    margin-left: auto;

    > .Field-DatePicker {
      margin-left: 12px;

      :first-child {
        margin-right: 12px;
      }
    }
  }
`

const StyledSelect = styled(Select)`
  margin-top: 24px;
  margin-left: calc(36%);

  .rs-picker-menu {
    min-width: 270px !important;
  }
`

const StyledParagraph = styled.p`
  margin-bottom: 24px;
`
