package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionPK
import org.springframework.data.jpa.repository.JpaRepository

interface DBAisPositionRepository : JpaRepository<AisPositionEntity, AisPositionPK>
