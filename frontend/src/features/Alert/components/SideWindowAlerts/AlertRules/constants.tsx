import ReactMarkdown from 'react-markdown'

import type { AlertMenuItem } from '@features/Alert/constants'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'

export const ALERT_RULES_TABLE_COLUMNS: Array<AccessorColumnDef<AlertMenuItem, any>> = [
  {
    accessorFn: row => row.name,
    cell: info => <>{info.getValue<string>()}</>,
    header: () => "Nom de l'alerte",
    id: 'name',
    size: 220
  },
  {
    accessorFn: row => row.frequency,
    cell: info => info.getValue<string>(),
    header: () => 'Fréquence',
    id: 'frequency',
    size: 160
  },
  {
    accessorFn: row => row.rules,
    cell: info => <ReactMarkdown>{info.getValue<string>()}</ReactMarkdown>,
    header: () => 'Règles de déclenchement',
    id: 'rules',
    size: 440
  },
  {
    accessorFn: row => row.endRule,
    cell: info => info.getValue<string>(),
    header: () => 'Règles de fin',
    id: 'endRule',
    size: 150
  },
  {
    accessorFn: row => row.archivingRule,
    cell: info => info.getValue<string>(),
    header: () => "Règles d'archivage des signalements",
    id: 'archivingRule',
    size: 250
  }
]
