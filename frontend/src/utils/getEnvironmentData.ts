const environment = import.meta.env.FRONTEND_SENTRY_ENV
const version = import.meta.env.FRONTEND_MONITORFISH_VERSION
const environmentMessage = "ENVIRONNEMENT D'INTEGRATION"
const isEnvironmentBoxVisible = environment === 'integration'
export function getEnvironmentData() {
  return {
    environmentMessage,
    isEnvironmentBoxVisible,
    version
  }
}
