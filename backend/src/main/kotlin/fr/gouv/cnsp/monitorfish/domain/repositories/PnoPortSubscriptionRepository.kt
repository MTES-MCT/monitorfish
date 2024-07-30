package fr.gouv.cnsp.monitorfish.domain.repositories

interface PnoPortSubscriptionRepository {
    fun has(portLocode: String): Boolean
}
