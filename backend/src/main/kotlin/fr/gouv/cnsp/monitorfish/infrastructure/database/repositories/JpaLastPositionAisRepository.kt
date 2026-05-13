package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionAisRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionAisRepository
import org.springframework.stereotype.Repository

@Repository
class JpaLastPositionAisRepository(
    private val dbLastPositionAisRepository: DBLastPositionAisRepository,
) : LastPositionAisRepository {
    override fun findAllByCfrIsNull(): List<LastPositionAIS> =
        dbLastPositionAisRepository
            .findByCfrIsNull()
            .map { it.toLastPositionAis() }

    override fun findAllByCfrIsNullAndIsAtPort(isAtPort: Boolean): List<LastPositionAIS> =
        dbLastPositionAisRepository
            .findByCfrIsNullAndIsAtPort(isAtPort)
            .map { it.toLastPositionAis() }
}
