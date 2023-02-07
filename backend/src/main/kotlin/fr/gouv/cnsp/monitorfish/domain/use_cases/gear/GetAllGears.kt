package fr.gouv.cnsp.monitorfish.domain.use_cases.gear

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.GearCodeGroupRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAllGears(
    private val gearRepository: GearRepository,
    private val GearCodeGroupRepository: GearCodeGroupRepository,
) {
    private val logger = LoggerFactory.getLogger(GetAllGears::class.java)
    fun execute(): List<Gear> {
        val allGears = gearRepository.findAll()
        val allGearsWithGroup = allGears
            .map {
                try {
                    val gearCodeGroup = GearCodeGroupRepository.find(it.code)
                    it.groupId = gearCodeGroup.groupId
                } catch (e: CodeNotFoundException) {
                    logger.warn(e.message)
                }
                it
            }

        return allGearsWithGroup
    }
}
