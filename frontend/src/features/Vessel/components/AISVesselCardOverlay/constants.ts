import type { OverlayCardMargins } from '@features/Map/components/Overlay/types'

type ShipTypeRange = { label: string; max: number; min: number }

export const SHIP_TYPE_RANGES: ShipTypeRange[] = [
  { label: 'Non disponible', max: 0, min: 0 },
  { label: 'Réservé', max: 19, min: 10 },
  { label: 'Aile en effet de sol', max: 28, min: 20 },
  { label: 'Aéronef SAR', max: 29, min: 29 },
  { label: 'Pêche', max: 30, min: 30 },
  { label: 'Remorqueur', max: 32, min: 31 },
  { label: 'Dragueur', max: 33, min: 33 },
  { label: 'Navire de plongée', max: 34, min: 34 },
  { label: 'Opérations militaires', max: 35, min: 35 },
  { label: 'Voilier', max: 36, min: 36 },
  { label: 'Embarcation de plaisance', max: 37, min: 37 },
  { label: 'Réservé', max: 39, min: 38 },
  { label: 'Engin à grande vitesse', max: 49, min: 40 },
  { label: 'Bateau pilote', max: 50, min: 50 },
  { label: 'SAR', max: 51, min: 51 },
  { label: 'Remorqueur', max: 52, min: 52 },
  { label: 'Navire de port', max: 53, min: 53 },
  { label: 'Anti-pollution', max: 54, min: 54 },
  { label: 'Police maritime', max: 55, min: 55 },
  { label: 'Navire local', max: 57, min: 56 },
  { label: 'Transport médical', max: 58, min: 58 },
  { label: 'Navire spécial', max: 59, min: 59 },
  { label: 'Passagers', max: 69, min: 60 },
  { label: 'Cargo', max: 70, min: 70 },
  { label: 'Cargo - Dangereux (A)', max: 71, min: 71 },
  { label: 'Cargo - Dangereux (B)', max: 72, min: 72 },
  { label: 'Cargo - Dangereux (C)', max: 73, min: 73 },
  { label: 'Cargo - Dangereux (D)', max: 74, min: 74 },
  { label: 'Cargo', max: 79, min: 75 },
  { label: 'Pétrolier', max: 80, min: 80 },
  { label: 'Pétrolier - Dangereux (A)', max: 81, min: 81 },
  { label: 'Pétrolier - Dangereux (B)', max: 82, min: 82 },
  { label: 'Pétrolier - Dangereux (C)', max: 83, min: 83 },
  { label: 'Pétrolier - Dangereux (D)', max: 84, min: 84 },
  { label: 'Pétrolier', max: 89, min: 85 },
  { label: 'Autre', max: 99, min: 90 }
]

export const AIS_VESSEL_OVERLAY_CARD_MARGIN: OverlayCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -230,
  yMiddle: -115,
  yTop: 20
}

/** Approximate rendered height of the AIS vessel card (px). Must match |yBottom| of the margins above. */
export const AIS_CARD_HEIGHT = 220
export const AIS_CARD_WIDTH = 387
