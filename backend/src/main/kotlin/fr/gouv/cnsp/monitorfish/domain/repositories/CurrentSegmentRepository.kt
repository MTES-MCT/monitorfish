package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselCurrentSegment

interface CurrentSegmentRepository {
    fun findVesselCurrentSegment(internalReferenceNumber: String): VesselCurrentSegment?
}