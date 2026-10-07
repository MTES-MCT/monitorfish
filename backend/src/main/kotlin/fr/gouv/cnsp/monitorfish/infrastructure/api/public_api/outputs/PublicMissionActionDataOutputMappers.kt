package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.EnrichedMissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.DiscardedSpeciesControlDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.PublicMissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.toMissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.toContract

fun EnrichedMissionAction.toPublicMissionActionDataOutput() =
    PublicMissionActionDataOutput(
        missionAction =
            missionAction
                .toMissionActionDataOutput(useThreatHierarchyForForm = false)
                .withDiscardedSpeciesNames(discardedSpeciesNamesByCode),
        vesselLength = vessel?.length,
        vesselType = vessel?.vesselType,
        imo = vessel?.imo,
        proprietorName = vessel?.proprietorName,
        proprietorPhones = vessel?.proprietorPhones,
        proprietorEmails = vessel?.proprietorEmails,
        proprietorNationality = vessel?.proprietorNationality,
        proprietorAddress = vessel?.proprietorAddress,
        chartererName = vessel?.operatorName,
        chartererPhones = vessel?.operatorPhones,
        chartererEmail = vessel?.operatorEmail,
        chartererNationality = vessel?.operatorNationality,
        chartererAddress = vessel?.operatorAddress,
        tripNumber = tripNumber,
        pnoReportId = pnoReportId,
        pnoPurpose = pnoPurpose?.toContract(),
        lastDeparturePortLocode = lastDeparturePortLocode,
        lastDeparturePortName = lastDeparturePortName,
        lastDepartureDateTime = lastDepartureDateTime,
    )

private fun MissionActionDataOutput.withDiscardedSpeciesNames(speciesNamesByCode: Map<String, String>) =
    copy(discardedSpecies = discardedSpecies.map { it.withNames(speciesNamesByCode) })

private fun DiscardedSpeciesControlDataOutput.withNames(speciesNamesByCode: Map<String, String>) =
    copy(
        speciesName = speciesNamesByCode[speciesCode],
        discardReasonName = discardReason?.let { DiscardReason.valueOf(it.name).label },
    )
