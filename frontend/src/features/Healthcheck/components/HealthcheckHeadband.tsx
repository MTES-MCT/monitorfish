import { TransparentButton } from '@components/style'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { FIVE_MINUTES } from '../../../api/APIWorker'
import { setHealthcheckTextWarning } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ChevronIconButton } from '../../commonStyles/icons/ChevronIconButton'
import WarningSVG from '../../icons/Picto_alerte.svg?react'
import { useGetHealthcheckQuery } from '../apis'
import { useIsOnline } from '../hooks/useIsOnline'
import { getHealthcheckWarnings } from '../utils'

export function HealthcheckHeadband() {
  const dispatch = useMainAppDispatch()
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const isOnline = useIsOnline()
  const {
    data: healthcheck,
    error,
    isError
  } = useGetHealthcheckQuery(undefined, {
    pollingInterval: FIVE_MINUTES
  })
  const [areAllWarningsOpened, setAreAllWarningsOpened] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      // This warning replace the other warnings as an offline app will have other data outdated.
      dispatch(setHealthcheckTextWarning(['Vous êtes hors-ligne.']))

      return
    }

    if (isError || !healthcheck) {
      if (error) {
        dispatch(
          addMainWindowBanner({
            children: (error as Error).message,
            closingDelay: 6000,
            isClosable: true,
            level: Level.ERROR,
            withAutomaticClosing: true
          })
        )
      }

      return
    }

    const warnings = getHealthcheckWarnings(healthcheck)
    dispatch(setHealthcheckTextWarning(warnings))
  }, [dispatch, healthcheck, isOnline, isError, error])

  return (
    <>
      {!!healthcheckTextWarning.length && !previewFilteredVesselsMode && (
        <HealthcheckWarnings>
          <StyledTransparentButton
            as={healthcheckTextWarning.length > 1 ? 'button' : 'div'}
            onClick={() => setAreAllWarningsOpened(!areAllWarningsOpened)}
          >
            <WarningIcon />
            {healthcheckTextWarning.length === 1
              ? healthcheckTextWarning
              : `${healthcheckTextWarning.length} alertes concernant les données VMS et JPE.`}
          </StyledTransparentButton>
          {healthcheckTextWarning.length > 1 && (
            <StyledChevronIcon
              isOpen={areAllWarningsOpened}
              onClick={() => setAreAllWarningsOpened(!areAllWarningsOpened)}
            />
          )}
        </HealthcheckWarnings>
      )}
      {healthcheckTextWarning.length > 1 && !previewFilteredVesselsMode && (
        <ul>
          {healthcheckTextWarning.map((warning, index) => (
            <MultipleWarningsHeadband
              // eslint-disable-next-line react/no-array-index-key
              key={`${index}-${warning}`}
              $isLast={healthcheckTextWarning.length === index + 1}
              $isOpen={areAllWarningsOpened}
              $topOffset={index + 1}
            >
              {warning}
            </MultipleWarningsHeadband>
          ))}
        </ul>
      )}
    </>
  )
}

const StyledTransparentButton = styled(TransparentButton)`
  text-align: center;
  width: unset;
`
const StyledChevronIcon = styled(ChevronIconButton)`
  background: ${p => p.theme.color.goldenPoppy};

  svg {
    color: ${p => p.theme.color.charcoal};
  }
`

const WarningIcon = styled(WarningSVG)`
  width: 20px;
  vertical-align: sub;
  margin-right: 8px;
  height: 18px;
`

const HealthcheckWarnings = styled.div`
  z-index: 1045;
  position: absolute;
  top: 0;
  font: normal normal bold 16px/22px Marianne;
  background: ${p => p.theme.color.goldenPoppy} 0% 0% no-repeat padding-box;
  width: calc(100vw - 26px);
  height: 22px;
  text-align: center;
  padding: 13px;
  border-bottom: 2px solid #e3be05;
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`

const MultipleWarningsHeadband = styled.li<{
  $isLast: boolean
  $isOpen: boolean
  $topOffset: number
}>`
  position: absolute;
  top: ${p => (p.$isOpen ? p.$topOffset * 50 : 0)}px;
  background: ${p => p.theme.color.goldenPoppy25} 0% 0% no-repeat padding-box;
  width: 100vw;
  height: ${p => (p.$isOpen ? 22 : 0)}px;
  text-align: center;
  padding: ${p => (p.$isOpen ? '13px 0 13px 0' : '0 0 0 0')};
  border-bottom: 2px solid #e3be05;
  color: ${p => p.theme.color.gunMetal};
  z-index: 1044;
  font: normal normal bold 16px/22px Marianne;
  transition: all 0.5s;
  opacity: ${p => (p.$isOpen ? 1 : 0)};
  ${p => p.$isLast && `box-shadow: 0px 2px ${p.$isOpen ? 4 : 0}px #707785bf;`}
`
