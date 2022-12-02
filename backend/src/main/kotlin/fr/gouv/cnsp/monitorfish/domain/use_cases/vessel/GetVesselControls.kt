package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.controls.ControlSummary
import fr.gouv.cnsp.monitorfish.domain.entities.controls.ControlType
import fr.gouv.cnsp.monitorfish.domain.entities.controls.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselControls(
    private val controlRepository: ControlRepository,
    private val infractionRepository: InfractionRepository,
    private val portRepository: PortRepository,
    private val gearRepository: GearRepository
) {
    private val logger = LoggerFactory.getLogger(GetVesselControls::class.java)

    fun execute(vesselId: Int, afterDateTime: ZonedDateTime): ControlSummary {
        logger.debug("Searching controls for vessel $vesselId after $afterDateTime")
        val controlAndInfractionIds = controlRepository.findVesselControlsAfterDateTime(vesselId, afterDateTime)
        logger.debug("Found ${controlAndInfractionIds.size} controls for vessel $vesselId")

        val controlWithInfractions = controlAndInfractionIds.map {
            val infractions = infractionRepository.findInfractions(it.infractionIds)
            logger.debug("Found ${infractions.size} infractions for control ${it.control.id} of vessel $vesselId")

            it.control.portLocode?.let { port ->
                try {
                    it.control.portName = portRepository.find(port).name
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
            }

            it.control.gearControls.forEach { gearControl ->
                gearControl.gearCode?.let { gear ->
                    try {
                        gearControl.gearName = gearRepository.find(gear).name
                    } catch (e: CodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }
            }

            it.control.infractions = infractions
            it.control
        }

        val numberOfSeaControls = controlWithInfractions
            .filter { it.controlType == ControlType.SEA.value }
            .size
        val numberOfLandControls = controlWithInfractions
            .filter { it.controlType == ControlType.LAND.value }
            .size
        val numberOfAerialControls = controlWithInfractions
            .filter { it.controlType == ControlType.AERIAL.value }
            .size

        val numberOfDiversions = controlWithInfractions
            .filter { it.diversion == true }
            .size
        val numberOfEscortsToQuay = controlWithInfractions
            .filter { it.escortToQuay == true }
            .size
        val numberOfSeizures = controlWithInfractions
            .filter { it.seizure == true }
            .size

        val numberOfFishingInfractions = controlWithInfractions
            .flatMap { it.infractions }
            .filter { it.infractionCategory == InfractionCategory.FISHING.value }
            .size

        val numberOfSecurityInfractions = controlWithInfractions
            .flatMap { it.infractions }
            .filter { it.infractionCategory == InfractionCategory.SECURITY.value }
            .size

        return ControlSummary(
            vesselId = vesselId,
            numberOfSeaControls = numberOfSeaControls,
            numberOfLandControls = numberOfLandControls,
            numberOfAerialControls = numberOfAerialControls,
            numberOfDiversions = numberOfDiversions,
            numberOfEscortsToQuay = numberOfEscortsToQuay,
            numberOfSeizures = numberOfSeizures,
            numberOfFishingInfractions = numberOfFishingInfractions,
            numberOfSecurityInfractions = numberOfSecurityInfractions,
            controls = controlWithInfractions
        )
    }
}
