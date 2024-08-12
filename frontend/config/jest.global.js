/**
 * @see https://jestjs.io/docs/configuration#globalsetup-string
 */
export default () => {
  process.env.TZ = 'America/New_York'
}
