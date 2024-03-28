package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Facade
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class GetMissionActionFacade(
    private val portsRepository: PortRepository,
    private val facadeAreasRepository: FacadeAreasRepository,
) {
    fun execute(action: MissionAction): Facade? {
        return when (action.actionType) {
            MissionActionType.SEA_CONTROL -> getFacadeFromCoordinates(action)
            MissionActionType.LAND_CONTROL -> getFacadeFromPort(action)
            MissionActionType.AIR_CONTROL -> getFacadeFromCoordinates(action)
            MissionActionType.AIR_SURVEILLANCE -> null
            MissionActionType.OBSERVATION -> null
        }
    }

    private fun getFacadeFromCoordinates(action: MissionAction): Facade? {
        if (action.latitude == null || action.longitude == null) {
            return null
        }

        val point = GeometryFactory().createPoint(Coordinate(action.longitude, action.latitude))
        val facade = facadeAreasRepository.findByIncluding(point).firstOrNull()?.facade ?: return null

        return Facade.from(facade)
    }

    private fun getFacadeFromPort(action: MissionAction): Facade? {
        if (action.portLocode == null) {
            return null
        }

        val facade = portsRepository.findByLocode(action.portLocode).facade ?: return null

        return Facade.from(facade)
    }
}
