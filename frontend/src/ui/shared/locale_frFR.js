import { fr } from 'date-fns/locale'

export const Calendar = {
  sunday: 'Dim',
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Merc',
  thursday: 'Jeudi',
  friday: 'Vend',
  saturday: 'Sam',
  ok: 'OK',
  today: "Aujourd'hui",
  yesterday: 'Hier',
  hours: 'Heures',
  minutes: 'Minutes',
  seconds: 'Secondes',
  formattedMonthPattern: 'MMM, yyyy',
  formattedDayPattern: 'MMM dd, yyyy',
  dateLocale: fr
};

export default {
  common: {
    loading: 'Chargement...',
    emptyMessage: 'Aucune donnée'
  },
  Plaintext: {
    unfilled: 'Vide',
    notSelected: 'Non sélectionné',
    notUploaded: 'Non téléchargé'
  },
  Pagination: {
    more: 'Plus',
    prev: 'Précédent',
    next: 'Suivant',
    first: 'Premier',
    last: 'Dernier',
    limit: '{0} / page',
    total: 'Total : {0}',
    skip: 'Aller à {0}'
  },
  Calendar,
  DatePicker: {
    ...Calendar
  },
  DateRangePicker: {
    ...Calendar,
    last7Days: '7 derniers jours'
  },
  Picker: {
    noResultsText: 'Aucun résultat trouvé',
    placeholder: 'Sélectionner',
    searchPlaceholder: 'Rechercher',
    checkAll: 'Tout'
  },
  InputPicker: {
    newItem: 'Nouvel item',
    createOption: 'Créer option "{0}"'
  },
  Uploader: {
    inited: 'Initial',
    progress: 'En cours',
    error: 'Erreur',
    complete: 'Terminé',
    emptyFile: 'Vide',
    upload: 'Charger'
  },
  CloseButton: {
    closeLabel: 'Fermer'
  },
  Breadcrumb: {
    expandText: 'Montrer le chemin'
  },
  Toggle: {
    on: 'Ouvrir',
    off: 'Fermer'
  }
};
