package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class Voyage(
        val isLastVoyage: Boolean,
        val previousBeforeDateTime: ZonedDateTime?,
        val nextBeforeDateTime: ZonedDateTime?,
        val ersMessagesAndAlerts: ERSMessagesAndAlerts)