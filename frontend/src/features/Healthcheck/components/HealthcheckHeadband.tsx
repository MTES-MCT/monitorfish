import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { FIVE_MINUTES } from '../../../api/APIWorker'
import { setError, setHealthcheckTextWarning } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'
import { ReactComponent as WarningSVG } from '../../icons/Picto_alerte.svg'
import { useGetHealthcheckQuery } from '../apis'
import { useIsOnline } from '../hooks/useIsOnline'
import { getHealthcheckWarnings } from '../utils'

export function HealthcheckHeadband() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
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
      dispatch(setError(error))

      return
    }

    const warnings = getHealthcheckWarnings(healthcheck)
    dispatch(setHealthcheckTextWarning(warnings))
  }, [dispatch, healthcheck, isOnline, isError, error])

  return (
    <>
      {healthcheckTextWarning.length && !previewFilteredVesselsMode && (
        <HealthcheckWarnings>
          <WarningIcon />
          {healthcheckTextWarning.length === 1
            ? healthcheckTextWarning
            : `${healthcheckTextWarning.length} alertes concernant les données VMS et JPE.`}
          <StyledChevronIcon
            $isOpen={areAllWarningsOpened}
            onClick={() => setAreAllWarningsOpened(!areAllWarningsOpened)}
          />
        </HealthcheckWarnings>
      )}
      {healthcheckTextWarning.length > 1 &&
        !previewFilteredVesselsMode &&
        healthcheckTextWarning.map((warning, index) => (
          <MultipleWarningsHeadband
            isLast={healthcheckTextWarning.length === index + 1}
            isOpen={areAllWarningsOpened}
            topOffset={index + 1}
          >
            {warning}
          </MultipleWarningsHeadband>
        ))}
    </>
  )
}

const StyledChevronIcon = styled(ChevronIcon)`
  margin-left: 16px;
  display: inline-block !important;
  vertical-align: sub;
  cursor: pointer;
`

const WarningIcon = styled(WarningSVG)`
  width: 20px;
  vertical-align: sub;
  margin-right: 8px;
  height: 18px;
`

const HealthcheckWarnings = styled.div`
  font: normal normal bold 16px/22px Marianne;
  background: ${p => p.theme.color.goldenPoppy} 0% 0% no-repeat padding-box;
  width: calc(100vw - 26px);
  height: 22px;
  text-align: center;
  padding: 13px;
  border-bottom: 2px solid #e3be05;
  color: ${p => p.theme.color.gunMetal};
`

const MultipleWarningsHeadband = styled.div<{
  isLast: boolean
  isOpen: boolean
  topOffset: number
}>`
  position: absolute;
  top: ${p => p.topOffset * 50}px;
  background: #fdf3c3 0% 0% no-repeat padding-box;
  width: calc(100vw - 26px);
  height: ${p => (p.isOpen ? 22 : 0)}px;
  text-align: center;
  padding: 13px;
  border-bottom: 2px solid #e3be05;
  color: ${p => p.theme.color.gunMetal};
  z-index: 99999;
  font: normal normal bold 16px/22px Marianne;
  transition: all 0.5s;
  opacity: ${p => (p.isOpen ? 1 : 0)};
  ${p => p.isLast && `box-shadow: 0px 2px ${p.isOpen ? 4 : 0}px #707785bf;`}
`
