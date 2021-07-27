export const COLORS = {
  background: '#FFFFFF',
  grayBackground: '#EDEDED',
  grayLighter: '#F0F0F0',
  gray: '#EEEEEE',
  grayDarker: '#D6D6D6',
  grayDarkerTwo: '#9A9A9A',
  grayDarkerThree: '#515151',
  textBueGray: '#848DAE',
  textGray: '#969696',
  textWhite: '#EDEDF5',
  squareBorder: '#E0E0E0',
  grayVesselHidden: '#B2B2B2',
  red: '#E1000F',
  white: '#FFFFFF',
  orange: '#F6D012',
  blue: '#0A18DF',
  vesselLightColor: '#cacce0',
  vesselColor: 'rgb(5, 5, 94)'
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
  zoneName: `Avant de créer une nouvelle thématique, vérifiez bien qu'il n'en existe pas déjà une qui pourrait correspondre.
  
  Le nom de la thématique doit permettre de connaître en un coup d'œil le lieu et le sujet de la réglementation.
  Il peut être intéressant de mentionner une zone totalement interdite à la pêche avec le mot "interdiction" (dans le champ "autres indications").
  
  NB : le lieu indiqué peut être une façade maritime (NAMO), une région (Bretagne), un département (Vendée), une commune (Saint-Malo), une zone géographique (Cotentin), une mer (Mer Baltique), etc.`,
  zoneTheme: `Comme pour les thématiques, le nom des zones doit être aussi explicite que possible. Le couple thématique / zone fonctionne comme un tout, qui permet à l'utilisateur de comprendre rapidement quelle réglementation il consulte.
  
  Le nom de la zone peut être
  - un nom géographique ("Ile-Rousse", ou "Bande des 3 miles"),
  - ou numérique ("Zone 1"),
  - ou spécifiant une autre caractéristique ("Zone pour navire > 10m")`
}
