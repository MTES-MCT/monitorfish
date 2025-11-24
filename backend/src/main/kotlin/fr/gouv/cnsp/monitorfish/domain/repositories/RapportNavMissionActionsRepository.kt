package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.RapportNavMissionAction

interface RapportNavMissionActionsRepository {
    suspend fun findRapportNavMissionActionsById(missionId: Int): RapportNavMissionAction
}
