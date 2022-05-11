package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FAOArea

interface FAOAreasRepository {
    fun findAll() : List<FAOArea>
}
