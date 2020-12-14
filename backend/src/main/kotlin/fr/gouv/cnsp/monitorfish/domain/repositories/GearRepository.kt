package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Gear

interface GearRepository {
    fun findAll() : List<Gear>
}
