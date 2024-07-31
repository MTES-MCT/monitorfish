package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

enum class PriorNotificationState {
    /** "Envoi auto. demandé". */
    AUTO_SEND_REQUESTED,

    /** "En cours d'envoi auto.". */
    AUTO_SEND_IN_PROGRESS,

    /** "Envoi auto. fait". */
    AUTO_SEND_DONE,

    /** "Échec de diffusion". */
    FAILED_SEND,

    /** "Hors vérification". */
    OUT_OF_VERIFICATION_SCOPE,

    /** "En cours de d'envoi auto". */
    PENDING_AUTO_SEND,

    /** "En cours de diffusion". */
    PENDING_SEND,

    /** "À vérifier (CNSP)". */
    PENDING_VERIFICATION,

    /** "Vérifié et diffusé". */
    VERIFIED_AND_SENT,
}
