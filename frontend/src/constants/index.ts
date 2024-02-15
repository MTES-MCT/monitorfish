import Countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'

import type { Option } from '@mtes-mct/monitor-ui'

Countries.registerLocale(COUNTRIES_FR)

export const BOOLEAN_AS_OPTIONS: Array<Option<boolean>> = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false }
]

export const FIVE_MINUTES = 5 * 60 * 1000

export const COUNTRIES_AS_OPTIONS: Option<string>[] = Object.keys(Countries.getAlpha2Codes()).map(country => ({
  label: Countries.getName(country, 'fr'),
  value: country.toLowerCase()
}))
