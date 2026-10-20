package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PatchableMissionActionDataInput

fun PatchableMissionActionDataInput.toPatchableMissionAction() =
    PatchableMissionAction(
        actionDatetimeUtc = actionDatetimeUtc,
        actionEndDatetimeUtc = actionEndDatetimeUtc,
        observationsByUnit = observationsByUnit,
    )
