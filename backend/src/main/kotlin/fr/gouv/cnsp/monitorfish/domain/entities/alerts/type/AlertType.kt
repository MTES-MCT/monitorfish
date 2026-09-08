package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import java.time.ZonedDateTime

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
                description =
                    """_Sur la journée de la veille_

Pour tous les navires français et pour les navires étrangers dont on a le JPE en ZEE française (aujourd'hui les Belges), qui ont été détectés "en pêche" la veille et n'ont pas fait de FAR.

""" +
                        "Signalement archivé automatiquement dès sa création : il sert à garder une trace pour la " +
                        "statistique mais n'est pas utilisé directement pour l'opérationnel.",
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
    AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "Activité AIS détectée sans émission VMS",
                description =
                    """_Sur les positions AIS reçues entre 1h et 4h._

Pour les navires en mer qui émettent des positions AIS alors qu'ils n'ont pas émis de position VMS depuis plus de 4h.""",
                isUserDefined = false,
                natinf = 27688,
                threat = "Mesures techniques et de conservation",
                threatCharacterization = "VMS - absence",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 0.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf(),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2026-06-29T16:16:39+02:00"),
            ),
    ),
    DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "Activité de pêche déclarée pendant une avarie VMS",
                description =
                    """_Sur les messages JPE (DEP, FAR) reçus récemment._

Pour les navires qui déclarent une activité de pêche pendant une avarie VMS en cours.
Fonctionne aussi pour les navires au JPE papier, avec un délai.""",
                isUserDefined = false,
                natinf = 27688,
                threat = "Mesures techniques et de conservation",
                threatCharacterization = "VMS - absence",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 0.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf(),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2026-06-29T16:16:39+02:00"),
            ),
    ),
    SALE_DURING_BEACON_MALFUNCTION(
        specification =
            PositionAlertSpecification(
                id = null,
                name = "Note de vente pendant une avarie VMS",
                description =
                    """_Sur les notes de vente reçues récemment._

Pour les navires pour lesquels une note de vente est émise pendant une avarie VMS en cours.
Fonctionne aussi pour les notes de vente papier, avec un délai.""",
                isUserDefined = false,
                natinf = 27688,
                threat = "Mesures techniques et de conservation",
                threatCharacterization = "VMS - absence",
                isActivated = true,
                repeatEachYear = false,
                trackAnalysisDepth = 0.0,
                hasAutomaticArchiving = true,
                onlyFishingPositions = false,
                flagStatesIso2 = listOf(),
                createdBy = "MonitorFish",
                createdAtUtc = ZonedDateTime.parse("2026-06-29T16:16:39+02:00"),
            ),
    ),
    ;

    fun getValue(): Alert =
        Alert(
            type = this,
            natinfCode = this.specification?.natinf ?: 0,
            name = this.specification?.name ?: "",
            description = this.specification?.description ?: "",
            threat = this.specification?.threat ?: "Famille inconnue",
            threatCharacterization = this.specification?.threatCharacterization ?: "Type inconnu",
        )
}
