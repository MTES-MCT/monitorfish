package fr.gouv.cnsp.monitorfish.domain.repositories

interface PnoVesselSubscriptionRepository {
    fun has(vesselId: Int): Boolean
}
