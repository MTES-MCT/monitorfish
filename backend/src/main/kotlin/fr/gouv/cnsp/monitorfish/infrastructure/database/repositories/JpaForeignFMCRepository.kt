package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC
import fr.gouv.cnsp.monitorfish.domain.repositories.ForeignFMCRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBForeignFMCRepository
import org.springframework.stereotype.Repository

@Repository
class JpaForeignFMCRepository(private val dbForeignFMCRepository: DBForeignFMCRepository) : ForeignFMCRepository {

    override fun findAll(): List<ForeignFMC> {
        return dbForeignFMCRepository.findAll().map { it.toForeignFMC() }
    }
}
