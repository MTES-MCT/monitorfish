import {
  canStepForward,
  DATE_TIME_STEPS,
  getKeyboardStep,
  isOlderThanAISRetention,
  stepReplayedDateTime,
  toReplayedDateTime
} from '@features/PositionReplay/replayedDateTime'
import { selectIsPositionReplayActive, selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { quitPositionReplay } from '@features/PositionReplay/useCases/quitPositionReplay'
import { setReplayedDateTime } from '@features/PositionReplay/useCases/setReplayedDateTime'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, DatePicker, Dialog, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ReplayedPositionsStatus } from './ReplayedPositionsStatus'

import type { DateTimeStep } from '@features/PositionReplay/replayedDateTime'
import type { KeyboardEvent } from 'react'

export function PositionReplayDialog() {
  const dispatch = useMainAppDispatch()
  const isActive = useMainAppSelector(selectIsPositionReplayActive)
  const dateTime = useMainAppSelector(selectPositionsDateTime)
  const topOffset = useGetTopOffset()

  if (!isActive) {
    return null
  }

  const now = customDayjs()

  const step = (dateTimeStep: DateTimeStep, direction: 1 | -1) =>
    dispatch(setReplayedDateTime(stepReplayedDateTime(dateTime, dateTimeStep, direction, now)))

  const stepWithKeyboard = (event: KeyboardEvent) => {
    // The arrows move the caret in the date and time inputs
    if (event.target instanceof HTMLInputElement) {
      return
    }

    const keyboardStep = getKeyboardStep(event.key, event.shiftKey)
    if (!keyboardStep) {
      return
    }

    event.preventDefault()
    if (keyboardStep.direction === 1 && !canStepForward(dateTime, keyboardStep.dateTimeStep, now)) {
      return
    }

    step(keyboardStep.dateTimeStep, keyboardStep.direction)
  }

  const updateDateTime = (nextDateTime: string | undefined) => {
    dispatch(setReplayedDateTime(nextDateTime ? toReplayedDateTime(nextDateTime) : undefined))
  }

  return (
    // A click anywhere in the dialog focuses it, so that its keyboard shortcuts apply
    <Wrapper $top={topOffset} data-cy="position-replay-dialog" onKeyDown={stepWithKeyboard} tabIndex={-1}>
      {/* `Dialog` itself is a modal: its overlay would block the map during the whole replay */}
      <Dialog.Title>
        <Title>Vous êtes en mode “rejeu” des positions de navires</Title>
        <IconButton
          accent={Accent.TERTIARY}
          color={THEME.color.white}
          Icon={Icon.Close}
          onClick={() => dispatch(quitPositionReplay())}
          title="Quitter le mode rejeu des positions"
        />
      </Dialog.Title>
      <Body>
        <p>Veuillez saisir une date et une heure (UTC) de rejeu des positions.</p>
        <Note>
          NB : les positions AIS de plus d’un mois ne sont pas stockées dans MonitorFish.
          {isOlderThanAISRetention(dateTime, now) && (
            <strong> Seules les positions VMS sont affichées pour cette date.</strong>
          )}
        </Note>
        <Fields>
          {DATE_TIME_STEPS.map((dateTimeStep, index) => (
            <StepButton
              key={`backward-${dateTimeStep.label}`}
              $isGroupStart={index > 0}
              accent={Accent.SECONDARY}
              aria-keyshortcuts={dateTimeStep.unit === 'day' ? 'Shift+ArrowLeft' : 'ArrowLeft'}
              Icon={Icon.Chevron}
              onClick={() => step(dateTimeStep, -1)}
              size={Size.SMALL}
              style={{ order: index * 3 }}
              title={`Reculer de ${dateTimeStep.label}`}
            >
              {`-${dateTimeStep.label}`}
            </StepButton>
          ))}
          <DatePicker
            defaultValue={dateTime}
            isHistorical
            isLabelHidden
            isStringDate
            label="Date et heure de rejeu des positions"
            name="positionReplayDateTime"
            onChange={updateDateTime}
            withTime
          />
          {DATE_TIME_STEPS.map((dateTimeStep, index) => (
            <StepButton
              key={`forward-${dateTimeStep.label}`}
              $isForward
              accent={Accent.SECONDARY}
              aria-keyshortcuts={dateTimeStep.unit === 'day' ? 'Shift+ArrowRight' : 'ArrowRight'}
              disabled={!canStepForward(dateTime, dateTimeStep, now)}
              Icon={Icon.Chevron}
              onClick={() => step(dateTimeStep, 1)}
              size={Size.SMALL}
              style={{ order: index * 3 + 2 }}
              title={`Avancer de ${dateTimeStep.label}`}
            >
              {`+${dateTimeStep.label}`}
            </StepButton>
          ))}
        </Fields>
        <ReplayedPositionsStatus dateTime={dateTime} />
      </Body>
    </Wrapper>
  )
}

// `Dialog.Title` does not forward `className`, and it sets the font size of its `h4` children
const Title = styled.span`
  font-size: 16px;
`

const Wrapper = styled.div<{
  $top: number
}>`
  box-shadow: 0 3px 6px ${p => p.theme.color.slateGray};
  left: 50%;
  outline: none;
  position: absolute;
  top: ${p => p.$top + 10}px;
  transform: translateX(-50%);
  width: 460px;
  /* Same level as the map menus, rendered after it: the boxes the user opens are displayed over this dialog */
  z-index: 1;
`

const Body = styled(Dialog.Body)`
  font-size: 13px;
  /* The date picker calendar overflows the dialog: monitor-ui does not portal it */
  overflow: visible;
  padding: 24px;

  p {
    margin: 0;
    padding: 0;
    font-weight: 500;
  }
`

const Note = styled.p`
  color: ${p => p.theme.color.slateGray} !important;
  font-style: italic;
`

/**
 * Splits the date picker into a date group and a time group, each one surrounded by its step buttons
 * (`DATE_TIME_STEPS` is ordered as the date picker inputs: day, then hour).
 * The date picker wrappers are flattened with `display: contents` so that its inputs are ordered among the buttons.
 */
const Fields = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  margin-top: 16px;
  position: relative;

  .Field-DatePicker,
  .Field-DatePicker > .Element-Fieldset__InnerBox,
  .Field-DatePicker > .Element-Fieldset__InnerBox > div:first-child {
    display: contents;
  }

  .Field-DatePicker > .Element-Fieldset__InnerBox > div:first-child > span {
    margin-left: 0 !important;

    &:first-child {
      order: 1;
    }

    &:nth-child(2) {
      order: 4;
    }

    /* The calendar also opens on a click on the date */
    .Element-IconBox {
      display: none;
    }
  }

  /* The calendar opens under the whole row */
  .Field-DatePicker__CalendarPicker {
    left: 0;
    position: absolute !important;
    top: 100%;
  }
`

const StepButton = styled(Button)<{
  $isForward?: boolean
  $isGroupStart?: boolean
}>`
  flex-direction: ${p => (p.$isForward ? 'row-reverse' : 'row')};
  gap: 4px;
  margin-left: ${p => (p.$isGroupStart ? 20 : 0)}px;

  .Element-IconBox {
    margin-right: 1px;
  }

  svg {
    height: 16px;
    width: 16px;
    transform: rotate(${p => (p.$isForward ? -90 : 90)}deg);
  }
`
