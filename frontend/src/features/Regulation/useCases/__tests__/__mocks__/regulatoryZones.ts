import type { RegulatoryZone } from '../../../types'

export const regulatoryZones: RegulatoryZone[] = [
  {
    color: 'color',
    fishingPeriod: {
      always: false,
      annualRecurrence: true,
      authorized: false,
      dateRanges: [],
      dates: [],
      daytime: false,
      holidays: true,
      otherInfo: '',
      timeIntervals: [],
      weekdays: ['vendredi', 'samedi', 'dimanche']
    },
    gearRegulation: {
      authorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: ['Chaluts']
      },
      otherInfo: undefined,
      unauthorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
    },
    geometry: {
      coordinates: [1, 2],
      type: 'Point'
    },
    id: 123,
    lawType: 'Reg. MEMN',
    nextId: '123',
    otherInfo: 'blabla',
    region: 'Normandie, Bretagne',
    regulatoryReferences: [
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 109/2019 - dÃ©lib 2019/C-PR-OC-08 / MEMN',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-109-2019-delib-2019-c-pr-oc-08-a8855.html?id_rub=634'
      },
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© MinistÃ©riel du 11/08/2008',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-ministeriel-du-11-08-2008-a460.html?id_rub=634'
      },
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 009/2021 / MEMN',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-009-2021-memn-a10903.html?id_rub=634'
      }
    ],
    showed: true,
    speciesRegulation: {
      authorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [
          { code: 'URC', name: 'OURSINS NCA', remarks: '500 kg' },
          { code: 'URX', name: 'OURSINS,ETC. NCA', remarks: '500 kg' }
        ],
        speciesGroups: []
      },
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [],
        speciesGroups: []
      }
    },
    topic: 'Ouest Cotentin Bivalves',
    zone: 'Praires Ouest cotentin'
  },
  {
    color: 'color',
    fishingPeriod: {
      always: false,
      annualRecurrence: true,
      authorized: false,
      dateRanges: [],
      dates: [],
      daytime: false,
      holidays: true,
      otherInfo: '',
      timeIntervals: [],
      weekdays: ['vendredi', 'samedi', 'dimanche']
    },
    gearRegulation: {
      authorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      },
      otherInfo: undefined,
      unauthorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
    },
    geometry: {
      coordinates: [1, 2],
      type: 'Point'
    },
    id: 1234,
    lawType: 'Reg. MEMN  TWO',
    nextId: '123',
    otherInfo: 'blabla',
    region: 'Normandie, Bretagne  TWO',
    regulatoryReferences: [
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 243/2020 / MEMN',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-243-2020-memn-a10718.html?id_rub=634'
      },
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 168/2020 ModifiÃ© - dÃ©lib 2020/PR-B-16 / MEMN',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-168-2020-modifie-delib-2020-pr-a10301.html?id_rub=634'
      }
    ],
    showed: true,
    speciesRegulation: {
      authorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [
          { code: 'WPO', name: 'OURSH NCA', remarks: '500 kg' },
          { code: 'WPI', name: 'AIIILE ,ETC. NCA', remarks: '500 kg' }
        ],
        speciesGroups: []
      },
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [],
        speciesGroups: []
      }
    },
    topic: 'Ouest Cotentin Bivalves',
    zone: 'Praires Ouest cotentin TWO'
  },
  {
    color: 'color',
    fishingPeriod: {
      always: false,
      annualRecurrence: true,
      authorized: false,
      dateRanges: [],
      dates: [],
      daytime: false,
      holidays: true,
      otherInfo: '',
      timeIntervals: [],
      weekdays: ['vendredi', 'samedi', 'dimanche']
    },
    gearRegulation: {
      authorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      },
      otherInfo: undefined,
      unauthorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
    },
    geometry: {
      coordinates: [1, 2],
      type: 'Point'
    },
    id: 12345,
    lawType: 'Reg. NAMO',
    nextId: '123',
    otherInfo: 'blabla',
    region: 'Morbihan, Bretagne',
    regulatoryReferences: [
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 123/1987 / NAMO',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-123-1987-memn-a10718.html?id_rub=634'
      }
    ],
    showed: true,
    speciesRegulation: {
      authorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [{ code: 'WHG', name: 'MERLAN', remarks: '500 kg' }],
        speciesGroups: []
      },
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [],
        speciesGroups: []
      }
    },
    topic: 'Morbihan Merlan/Merlu',
    zone: 'Interdiction Merlan'
  },
  {
    color: 'color',
    fishingPeriod: {
      always: false,
      annualRecurrence: true,
      authorized: false,
      dateRanges: [],
      dates: [],
      daytime: false,
      holidays: true,
      otherInfo: '',
      timeIntervals: [],
      weekdays: ['vendredi', 'samedi', 'dimanche']
    },
    gearRegulation: {
      authorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: ['OTB']
      },
      otherInfo: undefined,
      unauthorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
    },
    geometry: {
      coordinates: [1, 2],
      type: 'Point'
    },
    id: 123456,
    lawType: 'Reg. NAMO',
    nextId: '123',
    otherInfo: 'blabla',
    region: 'Morbihan, Bretagne',
    regulatoryReferences: [
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 456/1987 / NAMO',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-456-1987-memn-a10718.html?id_rub=634'
      }
    ],
    showed: true,
    speciesRegulation: {
      authorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [{ code: 'HKE', name: 'Merlu européen', remarks: '500 kg' }],
        speciesGroups: []
      },
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [],
        speciesGroups: []
      }
    },
    topic: 'Morbihan Merlan/Merlu',
    zone: 'Interdiction Merlu'
  },
  {
    color: 'color',
    fishingPeriod: {
      always: false,
      annualRecurrence: true,
      authorized: false,
      dateRanges: [],
      dates: [],
      daytime: false,
      holidays: true,
      otherInfo: '',
      timeIntervals: [],
      weekdays: ['vendredi', 'samedi', 'dimanche']
    },
    gearRegulation: {
      authorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      },
      otherInfo: undefined,
      unauthorized: {
        allGears: false,
        allPassiveGears: undefined,
        allTowedGears: undefined,
        derogation: undefined,
        otherInfo: undefined,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: ['Chalut']
      }
    },
    geometry: {
      coordinates: [1, 2],
      type: 'Point'
    },
    id: 1234567,
    lawType: 'Reg. NAMO',
    nextId: '123',
    otherInfo: 'blabla',
    region: 'Finistère, Bretagne',
    regulatoryReferences: [
      {
        endDate: 'infinite',
        reference: 'ArrÃªtÃ© PrÃ©fectoral 789/3256 / NAMO',
        startDate: new Date(),
        textType: ['creation'],
        url: 'http://legipeche.metier.i2/arrete-prefectoral-789-3256-memn-a10718.html?id_rub=634'
      }
    ],
    showed: true,
    speciesRegulation: {
      authorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [{ code: 'MUR', name: 'Rouget de roche', remarks: '500 kg' }],
        speciesGroups: []
      },
      otherInfo: undefined,
      unauthorized: {
        allSpecies: false,
        otherInfo: undefined,
        species: [],
        speciesGroups: []
      }
    },
    topic: 'Finistère Rouget',
    zone: 'Interdiction'
  }
]
