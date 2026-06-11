import { THEME } from '@mtes-mct/monitor-ui'

export function getEnvironmentBorderStyle(isEnvironmentBoxVisible: boolean) {
  return `
   border: ${isEnvironmentBoxVisible ? '4px' : '0'} solid ${THEME.color.goldenPoppy};
   border-top: ${isEnvironmentBoxVisible ? '6px' : '0'} solid ${THEME.color.goldenPoppy};
  `
}
