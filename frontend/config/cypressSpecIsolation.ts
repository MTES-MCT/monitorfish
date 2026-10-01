/**
 * Isolates each Cypress spec from the side effects (database writes, backend caches) of the previous ones.
 *
 * - `before:run`: the freshly seeded database is copied into a template database.
 * - `before:spec`: the database is recreated from this template and the backend caches are cleared.
 *
 * The backend cache reset requires `MONITORFISH_E2E_CACHE_RESET_ENABLED=true` (set in `docker-compose.cypress.yml`).
 */

import postgres from 'postgres'

const DATABASE_NAME = 'monitorfishdb'
const TEMPLATE_DATABASE_NAME = 'monitorfishdb_e2e_template'

function getMaintenanceConnection() {
  return postgres({
    database: 'postgres',
    host: process.env.CYPRESS_DB_HOST ?? 'localhost',
    max: 1,
    onnotice: () => {},
    password: 'postgres',
    port: Number(process.env.CYPRESS_DB_PORT ?? 5432),
    username: 'postgres'
  })
}

export async function snapshotDatabase(): Promise<void> {
  const sql = getMaintenanceConnection()

  try {
    await sql.unsafe(`DROP DATABASE IF EXISTS ${TEMPLATE_DATABASE_NAME} WITH (FORCE)`)

    // A database can't be used as a template while there are connections to it (backend pool, TimescaleDB workers):
    // we prevent new ones before terminating the existing ones.
    await sql.unsafe(`ALTER DATABASE ${DATABASE_NAME} ALLOW_CONNECTIONS false`)
    try {
      await sql`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = ${DATABASE_NAME} AND pid <> pg_backend_pid()
      `
      await sql.unsafe(`CREATE DATABASE ${TEMPLATE_DATABASE_NAME} TEMPLATE ${DATABASE_NAME}`)
    } finally {
      await sql.unsafe(`ALTER DATABASE ${DATABASE_NAME} ALLOW_CONNECTIONS true`)
    }

    // Keep the template free of connections so that it can always be copied
    await sql.unsafe(`ALTER DATABASE ${TEMPLATE_DATABASE_NAME} ALLOW_CONNECTIONS false`)
  } finally {
    await sql.end()
  }
}

export async function restoreDatabase(): Promise<void> {
  const sql = getMaintenanceConnection()

  try {
    await sql.unsafe(`DROP DATABASE ${DATABASE_NAME} WITH (FORCE)`)
    await sql.unsafe(`CREATE DATABASE ${DATABASE_NAME} TEMPLATE ${TEMPLATE_DATABASE_NAME}`)
  } finally {
    await sql.end()
  }
}

export async function clearBackendCaches(baseUrl: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/v1/e2e/caches`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(
      `Could not clear backend caches (HTTP ${response.status}). Is MONITORFISH_E2E_CACHE_RESET_ENABLED=true set on the backend?`
    )
  }
}
