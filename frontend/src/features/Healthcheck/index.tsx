import styled from 'styled-components'

import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import WarningSVG from '../icons/Picto_alerte.svg?react'

export function Healthcheck() {
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)

  return (
    <>
      {healthcheckTextWarning && !previewFilteredVesselsMode && (
        <HealthcheckWarnings>
          <Warning>
            <WarningIcon />
            {healthcheckTextWarning}
          </Warning>
        </HealthcheckWarnings>
      )}
    </>
  )
}

const WarningIcon = styled(WarningSVG)`
  width: 20px;
  vertical-align: sub;
  margin-right: 8px;
  height: 18px;
`

const Warning = styled.div`
  font: normal normal bold 16px/22px Marianne;
`

const HealthcheckWarnings = styled.div`
  background: ${p => p.theme.color.goldenPoppy} 0% 0% no-repeat padding-box;
  width: calc(100vw - 26px);
  height: 22px;
  text-align: center;
  padding: 13px;
  border-bottom: 2px solid #e3be05;
`
