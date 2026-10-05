package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels

interface FavoriteVesselsRepository {
    fun findAllByHashedEmail(hashedEmail: String): FavoriteVessels?

    fun upsert(favoriteVessels: FavoriteVessels)
}
