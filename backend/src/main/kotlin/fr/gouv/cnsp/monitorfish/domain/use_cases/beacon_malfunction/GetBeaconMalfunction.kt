package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetBeaconMalfunction(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
    private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
    private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val beaconMalfunctionNotificationsRepository: BeaconMalfunctionNotificationsRepository,
) {
    private val logger = LoggerFactory.getLogger(GetBeaconMalfunction::class.java)

    fun execute(beaconMalfunctionId: Int): BeaconMalfunctionResumeAndDetails {
        val lastPositions = lastPositionRepository.findAll()
        val beaconMalfunction = beaconMalfunctionsRepository.find(beaconMalfunctionId)
        val beaconMalfunctionComments =
            beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(
                beaconMalfunctionId,
            )
        val beaconMalfunctionActions =
            beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(
                beaconMalfunctionId,
            )
        val beaconMalfunctionNotifications =
            beaconMalfunctionNotificationsRepository.findAllByBeaconMalfunctionId(
                beaconMalfunctionId,
            )

        val riskFactor =
            lastPositions.find(
                BeaconMalfunction.getVesselFromBeaconMalfunction(beaconMalfunction),
            )?.riskFactor
        beaconMalfunction.riskFactor = riskFactor

        if (riskFactor == null) {
            logger.warn(
                "No risk factor for vessel ${beaconMalfunction.internalReferenceNumber} found in last positions table",
            )
        }

        val oneYearBefore = ZonedDateTime.now().minusYears(1)
        val vesselBeaconMalfunctions =
            beaconMalfunctionsRepository.findAllByVesselId(
                beaconMalfunction.vesselId,
                oneYearBefore,
            )

        val beaconMalfunctionsWithDetails =
            vesselBeaconMalfunctions.map { vesselBeaconMalfunction ->
                val comments =
                    beaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(
                        vesselBeaconMalfunction.id,
                    )
                val actions =
                    beaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(
                        vesselBeaconMalfunction.id,
                    )

                BeaconMalfunctionWithDetails(vesselBeaconMalfunction, comments, actions)
            }

        val vesselBeaconMalfunctionsResume =
            VesselBeaconMalfunctionsResume.fromBeaconMalfunctions(
                beaconMalfunctionsWithDetails,
            )

        val notifications =
            beaconMalfunctionNotifications
                .groupBy { it.toGroupByKeys() }
                .map {
                    BeaconMalfunctionNotifications(
                        dateTimeUtc = it.key.dateTimeUtc,
                        beaconMalfunctionId = it.key.beaconMalfunctionId,
                        notificationType = it.key.notificationType,
                        notifications = it.value,
                    )
                }

        return BeaconMalfunctionResumeAndDetails(
            beaconMalfunction = beaconMalfunction,
            resume = vesselBeaconMalfunctionsResume,
            comments = beaconMalfunctionComments,
            actions = beaconMalfunctionActions,
            notifications = notifications,
        )
    }
}
