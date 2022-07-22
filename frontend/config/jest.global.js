/**
 * @see https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = () => {
  process.env.TZ = 'America/New_York'
}
