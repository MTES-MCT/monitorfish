package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit

interface LegacyControlUnitRepository {
    fun findAll(): List<LegacyControlUnit>
}
