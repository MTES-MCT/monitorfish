package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers

interface UserLayersRepository {
    fun findByHashedEmail(hashedEmail: String): UserLayers?

    fun upsert(userLayers: UserLayers)
}
