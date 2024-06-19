package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

enum class PriorNotificationState {
    /** "Hors diffusion". */
    OUT_OF_VERIFICATION_SCOPE,

    /** "En cours de diffusion". */
    PENDING_SEND,

    /** "À vérifier". */
    PENDING_VERIFICATION,

    /** "Diffusé". */
    SENT,

    /** "Vérifié et diffusé". */
    VERIFIED_AND_SENT,
}
