package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
import java.time.ZonedDateTime

data class VoyageDataOutput(
        val isLastVoyage: Boolean,
        val isFirstVoyage: Boolean,
        val startDate: ZonedDateTime?,
        val endDate: ZonedDateTime?,
        val ersMessagesAndAlerts: ERSMessagesAndAlertsDataOutput) {
    companion object {
        fun fromVoyage(voyage: Voyage): VoyageDataOutput {
            return VoyageDataOutput(
                    isLastVoyage = voyage.isLastVoyage,
                    isFirstVoyage = voyage.isFirstVoyage,
                    startDate = voyage.startDate,
                    endDate = voyage.endDate,
                    ersMessagesAndAlerts = ERSMessagesAndAlertsDataOutput
                            .fromERSMessagesAndAlerts(voyage.ersMessagesAndAlerts)
            )
        }
    }
}