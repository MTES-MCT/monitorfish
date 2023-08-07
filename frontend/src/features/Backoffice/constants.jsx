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
  'Provence-Alpes-Côte d’Azur',
  'Guadeloupe',
  'Martinique',
  'Guyane',
  'La Réunion',
  'Mayotte'
]

export const INFO_TEXT = {
  TOPIC: 'Avant de créer une nouvelle thématique, vérifiez bien qu\'il n\'en existe pas déjà une\n qui pourrait correspondre.',
  TOPIC_NEXT: `Le nom de la thématique doit permettre de connaître en un coup d'œil le lieu
  et le sujet de la réglementation. Il peut être intéressant de mentionner une zone
  totalement interdite à la pêche avec le mot "interdiction" (dans le champ "autres indications").\n
  NB : le lieu indiqué peut être une façade maritime (NAMO),
  une région (Bretagne), un département (Vendée), une commune (Saint-Malo),
  une zone géographique (Cotentin), une mer (Mer Baltique), etc.`,
  ZONE_NAME: `Comme pour les thématiques, le nom des zones doit être aussi explicite
  que possible. Le couple thématique / zone fonctionne comme un tout, qui permet
  à l'utilisateur de comprendre rapidement quelle réglementation il consulte.\n
  Le nom de la zone peut être :
  - un nom géographique ("Ile-Rousse", ou "Bande des 3 miles"),
  - ou numérique ("Zone 1"),
  - ou spécifiant une autre caractéristique ("Zone pour navire > 10m").`,
  TOWED_GEAR: 'Chaluts, dragues et sennes traînantes',
  PASSIVE_GEAR: 'Filets maillants et emmêlants, filets soulevés, pièges et casiers, lignes et hameçons'
}

export const INFINITE = 'infinite'

export const STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  READY: 'READY'
}
