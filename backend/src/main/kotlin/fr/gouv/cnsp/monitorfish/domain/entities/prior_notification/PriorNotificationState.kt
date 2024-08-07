package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

enum class PriorNotificationState {
    /** "Envoi auto. demandé". */
    AUTO_SEND_REQUESTED,

    /** "Envoi auto. fait". */
    AUTO_SEND_DONE,

    /** "Échec de diffusion". */
    FAILED_SEND,

    /** "Hors vérification". */
    OUT_OF_VERIFICATION_SCOPE,

    /** "Envoi auto. en cours". */
    PENDING_AUTO_SEND,

    /** "Diffusion en cours". */
    PENDING_SEND,

    /** "À vérifier (CNSP)". */
    PENDING_VERIFICATION,

    /** "Vérifié et diffusé". */
    VERIFIED_AND_SENT,
}
