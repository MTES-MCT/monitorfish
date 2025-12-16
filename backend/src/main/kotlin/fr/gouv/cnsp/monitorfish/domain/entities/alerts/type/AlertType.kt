package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import java.time.ZonedDateTime
import kotlin.concurrent.thread

enum class AlertType(
    val specification: PositionAlertSpecification?,
) {
    POSITION_ALERT(
        specification = null,
    ),
    MISSING_DEP_ALERT(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "Sortie en mer sans émission de message DEP",
                description = """_Dans une fenêtre de +/- 6h autour de la sortie de port détectée._

Pour les navires français de +12 m (à l'exclusion des exemptés de JPE) n'ayant pas fait de DEP.
La sortie de port est détectée sur les dernières 48h, avec le navire en mer depuis au moins 2h.""",
                isUserDefined = false,
                natinf = 27689,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 48.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf("FR"),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2025-09-11T10:24:46.021615+02:00"),
            ),
    ),
    MISSING_FAR_ALERT(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "FAR manquant en 24h",
                description = """_Sur la journée de la veille_

Pour tous les navires français et pour les navires étrangers dont on a le JPE en ZEE française (aujourd'hui les Belges), qui ont été détectés "en pêche" la veille et n'ont pas fait de FAR.

Signalement archivé automatiquement dès sa création : il sert à garder une trace pour la statistique mais n'est pas utilisé directement pour l'opérationnel.""",
                isUserDefined = false,
                natinf = 27689,
                threat = "Obligations déclaratives",
                threatCharacterization = "FAR (JPE)",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 24.0,
                onlyFishingPositions = false,
                hasAutomaticArchiving = true,
                flagStatesIso2 = listOf("FR", "BE"),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2025-09-11T10:24:46.021615+02:00"),
            ),
    ),
    MISSING_FAR_48_HOURS_ALERT(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "FAR manquant en 48h",
                description = """_Sur la journée de la veille et de l'avant-veille_

Mêmes règles que pour l'alerte "FAR manquant en 24h" mais sur 2 jours consécutifs.""",
                isUserDefined = false,
                natinf = 27689,
                threat = "Obligations déclaratives",
                threatCharacterization = "FAR (JPE)",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 24.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf("FR", "BE"),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2025-09-11T10:24:46.021615+02:00"),
            ),
    ),
    SUSPICION_OF_UNDER_DECLARATION_ALERT(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "Suspicion de sous-déclaration",
                description = """_Sur les 7 jours précédents_

Pour les navires français de + 12 m qui déclarent un poids de captures incohérent par rapport à leur effort de pêche.
Permet de détecter des navires qui font des FAR 0 à répétition ou des FAR avec quelques kilos.

_Effort de pêche = nb d'heures de pêche x puissance motrice en kW/h.
Les navires remontent si kg des FAR < 0,015 kg x effort de pêche (kW/h)_
    """,
                isUserDefined = false,
                natinf = 27689,
                threat = "Obligations déclaratives",
                threatCharacterization = "FAR (JPE)",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 24.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf("FR"),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2025-09-11T10:24:46.021615+02:00"),
            ),
    ),
    ;

    fun getValue(): Alert =
        Alert(
            type = this,
            natinfCode = this.specification?.natinf,
            name = this.specification?.name ?: "",
            description = this.specification?.description ?: "",
        )
}
