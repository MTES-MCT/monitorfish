package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionAlertSpecificationRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository

@Repository
class JpaPositionAlertSpecificationSpecificationRepository(
    private val dbPositionAlertSpecificationRepository: DBPositionAlertSpecificationRepository,
    private val mapper: ObjectMapper,
) : PositionAlertSpecificationRepository {
    override fun findAllByIsDeletedIsFalse(): List<PositionAlertSpecification> =
        dbPositionAlertSpecificationRepository
            .findAllByIsDeletedIsFalse()
            .map { it.toPositionAlertSpecification(mapper) }

    @Transactional
    override fun activate(id: Int) {
        dbPositionAlertSpecificationRepository.activate(id)
    }

    @Transactional
    override fun deactivate(id: Int) {
        dbPositionAlertSpecificationRepository.deactivate(id)
    }

    @Transactional
    override fun delete(id: Int) {
        dbPositionAlertSpecificationRepository.delete(id)
    }
}
