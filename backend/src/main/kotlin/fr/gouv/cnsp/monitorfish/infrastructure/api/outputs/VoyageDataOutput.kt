package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Voyage
import java.time.ZonedDateTime

data class VoyageDataOutput(
        val isLastVoyage: Boolean,
        val previousBeforeDateTime: ZonedDateTime?,
        val nextBeforeDateTime: ZonedDateTime?,
        val ersMessagesAndAlerts: ERSMessagesAndAlertsDataOutput) {
    companion object {
        fun fromVoyage(voyage: Voyage): VoyageDataOutput {
            return VoyageDataOutput(
                    isLastVoyage = voyage.isLastVoyage,
                    previousBeforeDateTime = voyage.previousBeforeDateTime,
                    nextBeforeDateTime = voyage.nextBeforeDateTime,
                    ersMessagesAndAlerts = ERSMessagesAndAlertsDataOutput
                            .fromERSMessagesAndAlerts(voyage.ersMessagesAndAlerts)
            )
        }
    }
}