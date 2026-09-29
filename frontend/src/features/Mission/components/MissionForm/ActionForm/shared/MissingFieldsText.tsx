import { useIsMissionEnded } from '@features/Mission/components/MissionForm/hooks/useIsMissionEnded'
import { getMissingFieldsSummary } from '@features/Mission/components/MissionForm/utils/getMissingFieldsSummary'
import { getMissionActionMissingFields } from '@features/Mission/components/MissionForm/utils/getMissionActionMissingFields'
import { scrollToFirstMissingField } from '@features/Mission/components/MissionForm/utils/scrollToFirstMissingField'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon, pluralize, THEME, Tooltip } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useRef } from 'react'
import styled from 'styled-components'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export function MissingFieldsText() {
  const dispatch = useMainAppDispatch()
  const { values } = useFormikContext<MissionActionFormValues>()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const missingFieldPaths = getMissionActionMissingFields(values, dispatch)
  const isMissionEnded = useIsMissionEnded()

  if (missingFieldPaths.length === 0) {
    return (
      <CompletionStatus data-cy="action-completion-status" isCompleted>
        <Icon.Confirm color={THEME.color.mediumSeaGreen} size={20} />
        Les champs nécessaires aux statistiques sont complétés.
      </CompletionStatus>
    )
  }

  const color = isMissionEnded ? THEME.color.maximumRed : THEME.color.charcoal
  const count = missingFieldPaths.length

  const scrollToFirstMissingFieldOfThisForm = () => {
    if (wrapperRef.current) {
      scrollToFirstMissingField(wrapperRef.current, missingFieldPaths)
    }
  }

  return (
    <CompletionStatus data-cy="action-completion-status">
      <Icon.AttentionFilled color={color} />
      <TooltipWrapper ref={wrapperRef} onClick={scrollToFirstMissingFieldOfThisForm}>
        <StyledTooltip
          color={color}
          isSideWindow
          linkText={`${count} ${pluralize('champ', count)} ${pluralize('nécessaire', count)} aux statistiques à compléter`}
        >
          <MissingFieldList data-cy="action-missing-fields-tooltip">
            {getMissingFieldsSummary(missingFieldPaths, values).map(line => (
              <li key={line}>{line}</li>
            ))}
          </MissingFieldList>
        </StyledTooltip>
      </TooltipWrapper>
    </CompletionStatus>
  )
}

const TooltipWrapper = styled.div`
  > div > span {
    text-decoration: none;
  }

  > div > span:hover {
    text-decoration: underline;
  }
`

const StyledTooltip = styled(Tooltip)`
  margin-top: 22px;
  max-width: 420px;
  z-index: 99;
`

const MissingFieldList = styled.ul`
  margin: 0;
`

const CompletionStatus = styled.div<{
  isCompleted?: boolean
}>`
  display: flex;
  margin-top: 6px;
  font-weight: 700;
  color: ${p => (p.isCompleted ? THEME.color.mediumSeaGreen : THEME.color.gunMetal)};

  span {
    margin-right: 6px;
    margin-left: 2px;
  }

  div {
    vertical-align: top;
    margin-right: 4px;
  }
`
