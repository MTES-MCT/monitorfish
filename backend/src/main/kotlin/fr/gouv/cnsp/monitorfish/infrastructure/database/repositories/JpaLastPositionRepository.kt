package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RiskFactorEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselProfileEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaLastPositionRepository(
    private val dbLastPositionRepository: DBLastPositionRepository,
    private val mapper: ObjectMapper,
) : LastPositionRepository {
    @Cacheable(value = ["vessels_all_position"])
    override fun findAll(): List<LastPosition> =
        dbLastPositionRepository
            .findAll()
            // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
            .filterNotNull()
            .map {
                it.toLastPosition(mapper)
            }

    @Cacheable(value = ["active_vessel"])
    override fun findByVesselIdentifier(
        vesselIdentifier: VesselIdentifier,
        value: String,
    ): LastPosition? =
        try {
            dbLastPositionRepository.findByVesselIdentifier(vesselIdentifier.name, value).toLastPosition(mapper)
        } catch (e: EmptyResultDataAccessException) {
            null
        }

    @Cacheable(value = ["active_vessels"])
    override fun findActiveVesselWithReferentialData(): List<EnrichedActiveVessel> {
        val nowMinusOneMonth = ZonedDateTime.now().minusMonths(1)
        return dbLastPositionRepository
            .findActiveVesselWithReferentialData(nowMinusOneMonth)
            .map {
                EnrichedActiveVessel(
                    lastPosition =
                        it.lastPosition?.let { lastPosition ->
                            // There is no way to do a subquery in the JPQL query's FULL JOIN
                            if (lastPosition.dateTime > nowMinusOneMonth || lastPosition.beaconMalfunctionId != null) {
                                return@let lastPosition.toLastPosition(mapper)
                            }

                            return@let null
                        },
                    vesselProfile = it.vesselProfile?.toVesselProfile(),
                    vessel = it.vessel?.toVessel(),
                    /**
                     * To avoid Spring Data JPA's hydration of `ProducerOrganizationMembershipEntity` for performance reason, we select
                     * producerOrganizationName directly and build the class with dummy (unused) other fields.
                     */
                    producerOrganization =
                        ProducerOrganizationMembership(
                            internalReferenceNumber = it.vessel?.internalReferenceNumber ?: "",
                            joiningDate = "",
                            organizationName = it.producerOrganizationName ?: "",
                        ),
                    riskFactor = it.riskFactor?.toVesselRiskFactor(mapper) ?: VesselRiskFactor(),
                    landingPort = null,
                )
            }.filter { it.hasEitherLastPositionOrVesselProfileWithVessel() }
    }

    override fun findLastPositionDate(): ZonedDateTime =
        try {
            dbLastPositionRepository.findLastPositionDateTime().atZone(UTC)
        } catch (e: EmptyResultDataAccessException) {
            // Date of birth of the CNSP
            ZonedDateTime.of(2012, 4, 17, 0, 0, 0, 1, UTC)
        }

    @Transactional
    override fun removeAlertToLastPositionByVesselIdentifierEquals(
        alertName: String,
        vesselIdentifier: VesselIdentifier,
        value: String,
        isValidated: Boolean,
    ) {
        // TODO Handle case of POSITION_ALERT, and add the id of the alert
        dbLastPositionRepository.removeAlertByVesselIdentifierEquals(
            vesselIdentifier = vesselIdentifier.name,
            value = value,
            alertName = alertName,
            isValidated = isValidated,
        )
    }

    override fun deleteAll() {
        dbLastPositionRepository.deleteAllInBatch()
    }
}

data class EnrichedActiveVesselDTO(
    val lastPosition: LastPositionEntity?,
    val vesselProfile: VesselProfileEntity?,
    val vessel: VesselEntity?,
    val riskFactor: RiskFactorEntity?,
    val producerOrganizationName: String?,
)
