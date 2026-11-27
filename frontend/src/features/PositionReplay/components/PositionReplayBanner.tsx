import { POSITION_REPLAY_BANNER_HEIGHT } from '@features/PositionReplay/constants'
import {
  canStepForward,
  DATE_TIME_STEPS,
  getKeyboardStep,
  stepReplayedDateTime,
  toReplayedDateTime
} from '@features/PositionReplay/replayedDateTime'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { quitPositionReplay } from '@features/PositionReplay/useCases/quitPositionReplay'
import { setReplayedDateTime } from '@features/PositionReplay/useCases/setReplayedDateTime'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, customDayjs, DatePicker, Icon, Size } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ReplayedPositionsErrorBanner, ReplayedPositionsLoading } from './ReplayedPositionsStatus'

import type { DateTimeStep } from '@features/PositionReplay/replayedDateTime'
import type { KeyboardEvent } from 'react'

export function PositionReplayBanner() {
  const dispatch = useMainAppDispatch()
  const dateTime = useMainAppSelector(selectPositionsDateTime)
  const topOffset = useGetTopOffset({ isPositionReplayBannerExcluded: true })

  // Only defined while replaying
  if (!dateTime) {
    return null
  }

  const now = customDayjs()

  const step = (dateTimeStep: DateTimeStep, direction: 1 | -1) => {
    void dispatch(setReplayedDateTime(stepReplayedDateTime(dateTime, dateTimeStep, direction, now)))
  }

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
    event.stopPropagation()
  }

  const updateDateTime = (nextDateTime: string | undefined) => {
    // A cleared date keeps the last replayed one
    if (!nextDateTime) {
      return
    }

    void dispatch(setReplayedDateTime(toReplayedDateTime(nextDateTime)))
  }

  return (
    <>
      {/* A click anywhere in the banner focuses it, so that its keyboard shortcuts apply */}
      <Wrapper $top={topOffset} data-cy="position-replay-banner" onKeyDown={stepWithKeyboard} tabIndex={-1}>
        <Texts>
          <Title>Vous êtes en mode rejeu des positions de navires.</Title>
          <Note>NB : il n’y a pas de positions AIS de plus d’un mois dans MonitorFish.</Note>
          <ReplayedPositionsLoading />
        </Texts>
        <Fields>
          {DATE_TIME_STEPS.map((dateTimeStep, index) => (
            <StepButton
              key={`backward-${dateTimeStep.label}`}
              $isGroupStart={index > 0}
              accent={Accent.TERTIARY}
              aria-keyshortcuts={dateTimeStep.unit === 'day' ? 'Shift+ArrowLeft' : 'ArrowLeft'}
              Icon={Icon.Chevron}
              onClick={() => step(dateTimeStep, -1)}
              size={Size.SMALL}
              style={{ order: index * 3 }}
              title={`Reculer de ${dateTimeStep.label}`}
            >
              {`- ${dateTimeStep.label}`}
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
              accent={Accent.TERTIARY}
              aria-keyshortcuts={dateTimeStep.unit === 'day' ? 'Shift+ArrowRight' : 'ArrowRight'}
              disabled={!canStepForward(dateTime, dateTimeStep, now)}
              Icon={Icon.Chevron}
              onClick={() => step(dateTimeStep, 1)}
              size={Size.SMALL}
              style={{ order: index * 3 + 2 }}
              title={`Avancer de ${dateTimeStep.label}`}
            >
              {`+ ${dateTimeStep.label}`}
            </StepButton>
          ))}
        </Fields>
        <QuitButtonBox>
          <Button
            accent={Accent.SECONDARY}
            onClick={() => dispatch(quitPositionReplay())}
            size={Size.SMALL}
            title="Quitter le mode rejeu des positions"
          >
            Quitter le mode rejeu
          </Button>
        </QuitButtonBox>
      </Wrapper>
      <ReplayedPositionsErrorBanner dateTime={dateTime} top={topOffset + POSITION_REPLAY_BANNER_HEIGHT} />
    </>
  )
}

const Wrapper = styled.div<{
  $top: number
}>`
  align-items: center;
  background: ${p => p.theme.color.white};
  box-shadow: 0 2px 4px ${p => p.theme.color.slateGray}80;
  box-sizing: border-box;
  display: flex;
  height: ${POSITION_REPLAY_BANNER_HEIGHT}px;
  left: 0;
  outline: none;
  padding: 0 20px;
  position: absolute;
  right: 0;
  top: ${p => p.$top}px;
  /* Over the map menus and the error banner: the date picker calendar opens over them */
  z-index: 1001;
`

/** The texts and the quit button share the remaining width, so that the date and time fields stay centered. */
const Texts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 13px;
  gap: 2px;
  min-width: 0;

  p {
    margin: 0;
    padding: 0;
  }
`

const Title = styled.p`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
`

const Note = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-size: 11px;
  font-style: italic;
`

const QuitButtonBox = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
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
  && {
    background: transparent;
    border: 0;
    color: ${p => p.theme.color.slateGray};
    flex-direction: ${p => (p.$isForward ? 'row-reverse' : 'row')};
    font-size: 11px;
    gap: 4px;
    margin-left: ${p => (p.$isGroupStart ? 20 : 0)}px;
    padding: 0 4px;

    &:hover:not(:disabled),
    &._hover:not(:disabled) {
      color: ${p => p.theme.color.charcoal};
    }

    &:disabled {
      opacity: 0.4;
    }
  }

  .Element-IconBox {
    color: ${p => p.theme.color.charcoal};
    margin-right: 1px;
  }

  svg {
    height: 20px;
    width: 20px;
    transform: rotate(${p => (p.$isForward ? -90 : 90)}deg);
  }
`
