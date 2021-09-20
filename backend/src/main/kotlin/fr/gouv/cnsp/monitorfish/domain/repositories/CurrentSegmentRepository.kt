package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.CurrentSegment

interface CurrentSegmentRepository {
    fun findCurrentSegment(internalReferenceNumber: String): CurrentSegment?
}