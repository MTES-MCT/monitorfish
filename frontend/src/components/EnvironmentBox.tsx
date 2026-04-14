import { THEME } from '@mtes-mct/monitor-ui'
import { getEnvironmentData } from '@utils/getEnvironmentData'
import styled from 'styled-components'

export function EnvironmentBox() {
  const { environmentMessage, isEnvironmentBoxVisible, version } = getEnvironmentData()

  if (!isEnvironmentBoxVisible) {
    return null
  }

  return (
    <Wrapper>
      <span>{environmentMessage}</span>
      <span> version {version}</span>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.goldenPoppy};
  color: ${p => p.theme.color.charcoal};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  justify-content: space-between;
  padding-left: 4px;
  padding-right: 8px;
  position: absolute;
  top: 0px;
  width: 99%;
  z-index: 10000;
`

export function getEnvironmentBorderStyle(isEnvironmentBoxVisible: boolean) {
  return `
   border: ${isEnvironmentBoxVisible ? '4px' : '0'} solid ${THEME.color.goldenPoppy};
   border-top: ${isEnvironmentBoxVisible ? '6px' : '0'} solid ${THEME.color.goldenPoppy};
  `
}
