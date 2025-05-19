package fr.gouv.cnsp.monitorfish.domain.use_cases.gear

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearCodeGroupRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import org.slf4j.LoggerFactory
import java.time.Clock
import java.time.ZonedDateTime

@UseCase
class GetAllGears(
    private val gearRepository: GearRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val gearCodeGroupRepository: GearCodeGroupRepository,
    private val clock: Clock,
) {
    private val logger = LoggerFactory.getLogger(GetAllGears::class.java)

    fun execute(): List<Gear> {
        val currentYear = ZonedDateTime.now(clock).year

        val gearsWithRequiredMesh =
            fleetSegmentRepository.findAllSegmentsGearsWithRequiredMesh(currentYear)
        val allGears = gearRepository.findAll()

        val allGearsWithGroup =
            allGears
                .map {
                    val groupId =
                        try {
                            val gearCodeGroup = gearCodeGroupRepository.find(it.code)

                            gearCodeGroup.groupId
                        } catch (e: CodeNotFoundException) {
                            logger.warn(e.message)

                            null
                        }

                    val isMeshRequiredForSegment = gearsWithRequiredMesh.contains(it.code)

                    return@map it.copy(
                        groupId = groupId,
                        isMeshRequiredForSegment = isMeshRequiredForSegment,
                    )
                }.sortedBy { it.code }

        return allGearsWithGroup
    }
}
