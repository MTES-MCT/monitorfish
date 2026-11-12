package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PnoType(
    val id: Int,
    val name: String,
    val minimumNotificationPeriod: Double,
    val hasDesignatedPorts: Boolean,
    val isDurationClass: Boolean = false,
    val pnoTypeRules: List<PnoTypeRule>,
) {
    fun toPriorNotificationType(): PriorNotificationType =
        PriorNotificationType(
            hasDesignatedPorts = hasDesignatedPorts,
            isDurationClass = isDurationClass,
            minimumNotificationPeriod = minimumNotificationPeriod,
            name = name,
        )
}
