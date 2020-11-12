package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.InvalidAPIResponseException
import kotlin.jvm.Throws

interface VesselRepository {
    @Throws(InvalidAPIResponseException::class)
    fun findVessel(internalReferenceNumber: String): Vessel
}
