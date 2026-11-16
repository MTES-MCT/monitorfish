import type { RiskElement } from './types'

/** Ordered as displayed in the vessel sidebar */
export const LOGBOOK_RISK_ELEMENTS: RiskElement.DisplayedRiskElement[] = [
  {
    code: 'MOT_MR',
    description:
      'La marée est non conforme lorsque le navire ne respecte pas la marge de 10% entre les poids déclarés dans les FAR et ceux déclarés dans la LAN.',
    label: 'Marge 10%'
  }
]
