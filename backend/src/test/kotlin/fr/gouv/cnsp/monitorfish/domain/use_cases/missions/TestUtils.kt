package fr.gouv.cnsp.monitorfish.domain.use_cases.missions

import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionNature
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyMissions(number: Int): List<Mission> {
        val ids = (1..number).toList()

        return ids.map {
            return@map Mission(
                id = it,
                controlUnits = listOf(),
                missionTypes = listOf(MissionType.SEA),
                missionNature = listOf(MissionNature.FISH),
                startDateTimeUtc = ZonedDateTime.now(),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
            )
        }
    }
}
