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
  zoneName: `De mme que pour les thmatiques, le nom des zones doit être aussi explicite que possible. 
  Le couple thmatique / zone fonctionne comme un tout, qui permet à l'utilisateur de comprendre rapidement
   quelle rglementation il consulte. Le nom de la zone peut tre - un nom gographique 
   ("Ile-Rousse", ou "Bande des 3 miles"), - ou numérique ("Zone 1"), - ou encore spcifiant une autre caractristique 
   ("Zone d'autorisation ponctuelle", ou "Zone pour navire > 10m")`,
  zoneTheme: `Avant de créer une nouvelle thématique, vérifiez bien qu'il n'en existe pas déjà une qui pourrait correspondre. 
  Le nom de la thématique doit permettre de connaître en un coup d'œil le lieu et le sujet de la réglementation : 
  des espèces, et/ou des engins, et/ou d'autres points réglementaires spécifiques. 
  Il peut être intéressant notamment de mentionner si la zone est totalement 
  interdite à la pêche avec le mot "interdiction". 
  NB : le lieu indiqué peut être une façade maritime (NAMO), une région (Bretagne), un département (Vendée), 
  une commune (Saint-Malo), une zone géographique (Cotentin), une mer (Mer Baltique), 
  un secteur européen (Ouest-Écosse-Rockhall)...`
}
