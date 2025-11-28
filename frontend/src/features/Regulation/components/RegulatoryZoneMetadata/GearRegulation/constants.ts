import { SORTED_CATEGORY_LIST } from '../../../../../domain/entities/backoffice'

export const CategoryLabel: Record<(typeof SORTED_CATEGORY_LIST)[number], string> = {
  Chaluts: 'Tous les chaluts',
  Dragues: 'Toutes les dragues',
  'Engins de récolte': 'Tous les engins de récolte',
  'Engins divers': 'Tous les engins divers',
  'Filets maillants et filets emmêlants': 'Tous les filets maillants et filets emmêlants',
  'Filets soulevés': 'Tous les filets soulevés',
  'Filets tournants': 'Tous les filets tournants',
  Gangui: 'Tous les gangui',
  'Lignes et hameçons': 'Toutes les lignes et hameçons',
  Palangres: 'Toutes les palangres',
  'Pièges et casiers': 'Tous les pièges et casiers',
  'Sennes tournantes coulissantes': 'Toutes les sennes tournantes coulissantes',
  'Sennes traînantes': 'Toutes les sennes traînantes'
}
