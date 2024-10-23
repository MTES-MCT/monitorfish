package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

interface ControlUnitRepository {
    fun findAll(): List<FullControlUnit>
}
