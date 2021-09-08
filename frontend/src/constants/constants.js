export const COLORS = {
  background: '#FFFFFF',
  white: '#FFFFFF',
  orange: '#F6D012',
  gainsboro: '#E5E5EB',
  lightGray: '#CCCFD6',
  charcoal: '#3B4559',
  slateGray: '#707785',
  slateGrayLittleOpacity: 'rgba(112, 119, 133, 0.7)',
  mediumSeaGreen: '#29b361',
  gunMetal: '#282F3E',
  shadowBlue: '#6B839E',
  shadowBlueLittleOpacity: 'rgba(107, 131, 158, 0.15)',
  grayLighter: '#F0F0F0',
  gray: '#EEEEEE',
  grayDarkerTwo: '#9A9A9A',
  textBueGray: '#848DAE',
  textWhite: '#EDEDF5',
  squareBorder: '#E0E0E0',
  grayVesselHidden: '#B2B2B2',
  red: '#E1000F',
  blue: '#0A18DF',
  vesselLightColor: '#cacce0',
  vesselColor: '#3B4559',
  trackFishing: '#2A4670',
  trackTransit: '#1C9B7B'
}

export const HIT_PIXEL_TO_TOLERANCE = 3

export const BACKOFFICE_SEARCH_PROPERTIES = ['layerName', 'zone', 'region', 'seafront', 'regulatoryReferences']

export const FRENCH_REGION_LIST = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Ile-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d’Azur'
]

export const INFO_TEXT = {
  zoneTheme: `Avant de créer une nouvelle thématique, vérifiez bien qu'il n'en existe pas déjà une qui pourrait correspondre.
  
  Le nom de la thématique doit permettre de connaître en un coup d'œil le lieu et le sujet de la réglementation.
  Il peut être intéressant de mentionner une zone totalement interdite à la pêche avec le mot "interdiction" (dans le champ "autres indications").
  
  NB : le lieu indiqué peut être une façade maritime (NAMO), une région (Bretagne), un département (Vendée), une commune (Saint-Malo), une zone géographique (Cotentin), une mer (Mer Baltique), etc.`,
  zoneName: `Comme pour les thématiques, le nom des zones doit être aussi explicite que possible. Le couple thématique / zone fonctionne comme un tout, qui permet à l'utilisateur de comprendre rapidement quelle réglementation il consulte.
  
  Le nom de la zone peut être
  - un nom géographique ("Ile-Rousse", ou "Bande des 3 miles"),
  - ou numérique ("Zone 1"),
  - ou spécifiant une autre caractéristique ("Zone pour navire > 10m")`
}

export const INFINITE = 'infinite'
