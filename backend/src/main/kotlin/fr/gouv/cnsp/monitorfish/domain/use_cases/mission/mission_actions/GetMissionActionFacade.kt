package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.slf4j.LoggerFactory

@UseCase
class GetMissionActionFacade(
    private val portsRepository: PortRepository,
    private val facadeAreasRepository: FacadeAreasRepository,
) {
    private val logger = LoggerFactory.getLogger(GetMissionActionFacade::class.java)

    fun execute(action: MissionAction): Seafront? =
        when (action.actionType) {
            MissionActionType.SEA_CONTROL -> getFacadeFromCoordinates(action)
            MissionActionType.LAND_CONTROL -> getFacadeFromPort(action)
            MissionActionType.AIR_CONTROL -> getFacadeFromCoordinates(action)
            MissionActionType.AIR_SURVEILLANCE -> null
            MissionActionType.OBSERVATION -> null
        }

    private fun getFacadeFromCoordinates(action: MissionAction): Seafront? {
        if (action.latitude == null || action.longitude == null) {
            return null
        }

        val point = GeometryFactory().createPoint(Coordinate(action.longitude, action.latitude))
        val facade = facadeAreasRepository.findByIncluding(point).firstOrNull()?.facade ?: return null

        return Seafront.from(facade)
    }

    private fun getFacadeFromPort(action: MissionAction): Seafront? {
        val portLocode = action.portLocode ?: return null
        val facade = findPortFacade(portLocode) ?: return null

        return Seafront.from(facade)
    }

    private fun findPortFacade(portLocode: String): String? =
        try {
            portsRepository.findByLocode(portLocode).facade
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)

            null
        }
}
