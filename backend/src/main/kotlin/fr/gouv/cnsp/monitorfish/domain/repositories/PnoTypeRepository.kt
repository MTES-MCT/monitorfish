package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType

interface PnoTypeRepository {
    fun findAll(): List<PnoType>
}
