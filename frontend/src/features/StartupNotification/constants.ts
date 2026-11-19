import type { StartupNotification } from '@features/StartupNotification/types'

/**
 * Notifications displayed in a modal at startup, in this order, one at a time.
 *
 * @description
 * To add a message, add an entry with a new `id`. Users who already dismissed the other messages
 * will only see this one.
 */
export const STARTUP_NOTIFICATIONS: StartupNotification[] = [
  {
    body: `Les photos des navires s'affichent à nouveau dans l'onglet « Résumé » de la fiche navire, grâce à **Open Vessel Photos**, une photothèque ouverte de navires sous licence libre.

Beaucoup de navires n'ont pas encore de photo : **vous pouvez nous aider à les compléter !** Si vous photographiez un navire lors d'un contrôle, partagez-la en quelques clics depuis le bouton « Ajouter une photo du navire » de la fiche navire : le CFR et le MMSI sont déjà renseignés, et vous serez notifié·e dans MonitorFish dès qu'elle sera acceptée.

Chaque photo partagée aide l'ensemble des utilisateurs de MonitorFish.

Merci pour vos contributions !`,
    for: 'ALL',
    id: 'vessel-photos-2026-11',
    title: 'Les photos des navires sont de retour !',
    until: '2027-01-19'
  },
  {
    body: `Suite à vos retours sur le questionnaire d'utilisation du logiciel MonitorFish, le CNSP organise un webinaire de présentation et de prise en main de l'outil.

Ce webinaire permettra de vous présenter en direct les différents modules de MonitorFish et de répondre à vos questions.

Le webinaire aura lieu le **mardi 15 septembre de 10h à 12h (HL)**, et sera accessible en visio conférence au lien ci-dessous.`,
    for: 'ALL',
    id: 'webinaire-2026-09',
    link: {
      label: `Webinaire MonitorFish`,
      url: 'https://webinaire.numerique.gouv.fr/meeting/signin/invite/45144/hash/30e73d257d74b2983f1f83c5d694d3212611bac7'
    },
    title: 'Webinaire MonitorFish',
    until: '2026-09-16'
  },
  {
    body: `Un questionnaire vous a été envoyé fin juillet afin de mieux comprendre la manière dont vous vous servez de MonitorFish et d'identifier des points d'amélioration qui vous seraient utiles.

Si vous ne l'avez pas déjà fait, n'hésitez pas, c'est le moment d'y répondre ! (temps de réponse estimé 5 à 10 min).`,
    for: 'EXTERNAL',
    id: 'survey-2026-07',
    link: {
      label: `Répondre à l'enquête`,
      url: 'https://grist.numerique.gouv.fr/o/docs/forms/bdEF1UoEz9SPSKPUL6gw5f/4'
    },
    title: 'Enquête MonitorFish'
  }
]
