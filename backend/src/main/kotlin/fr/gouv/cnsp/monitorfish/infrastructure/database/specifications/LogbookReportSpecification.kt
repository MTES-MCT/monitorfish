package fr.gouv.cnsp.monitorfish.infrastructure.database.specifications

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import jakarta.persistence.criteria.Join
import org.springframework.data.jpa.domain.Specification

class LogbookReportSpecification {
    companion object {
        fun withVesselLengthGreaterThan(minLength: Double): Specification<LogbookReportEntity> {
            return Specification { root, query, criteriaBuilder ->
                val vesselJoin: Join<LogbookReportEntity, VesselEntity> = root.join("vessel")
                criteriaBuilder.greaterThan(vesselJoin.get<Double>("length"), minLength)
            }
        }
    }
}
