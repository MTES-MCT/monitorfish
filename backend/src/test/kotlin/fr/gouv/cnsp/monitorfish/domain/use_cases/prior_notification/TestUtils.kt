package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoTypeRule

object TestUtils {
    fun getDummyPnoTypes(): List<PnoType> {
        val pnoType1 =
            PnoType(
                id = 1,
                name = "Préavis type 1",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 1,
                            species = listOf("HKE", "BSS", "COD", "ANF", "SOL"),
                            faoAreas =
                                listOf(
                                    "27.3.a",
                                    "27.4",
                                    "27.6",
                                    "27.7",
                                    "27.8.a",
                                    "27.8.b",
                                    "27.8.c",
                                    "27.8.d",
                                    "27.9.a",
                                ),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 0.0,
                        ),
                        PnoTypeRule(
                            id = 2,
                            species = listOf("HKE"),
                            faoAreas = listOf("37"),
                            cgpmAreas = listOf("30.01", "30.05", "30.06", "30.07", "30.09", "30.10", "30.11"),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 0.0,
                        ),
                        PnoTypeRule(
                            id = 3,
                            species = listOf("HER", "MAC", "HOM", "WHB"),
                            faoAreas = listOf("27", "34.1.2", "34.2"),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 10000.0,
                        ),
                    ),
            )

        val pnoType2 =
            PnoType(
                id = 2,
                name = "Préavis type 2",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 4,
                            species = listOf("HKE", "BSS", "COD", "ANF", "SOL"),
                            faoAreas =
                                listOf(
                                    "27.3.a",
                                    "27.4",
                                    "27.6",
                                    "27.7",
                                    "27.8.a",
                                    "27.8.b",
                                    "27.8.c",
                                    "27.8.d",
                                    "27.9.a",
                                ),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 2000.0,
                        ),
                        PnoTypeRule(
                            id = 5,
                            species = listOf("HER", "MAC", "HOM", "WHB"),
                            faoAreas =
                                listOf(
                                    "27",
                                    "34.1.2",
                                    "34.2",
                                ),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 10000.0,
                        ),
                    ),
            )

        val pnoType3 =
            PnoType(
                id = 3,
                name = "Préavis par pavillon",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 6,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(CountryCode.GB, CountryCode.VE),
                            minimumQuantityKg = 0.0,
                        ),
                    ),
            )

        val pnoType4 =
            PnoType(
                id = 4,
                name = "Préavis par engin",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 7,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf("SB"),
                            flagStates = listOf(),
                            minimumQuantityKg = 0.0,
                        ),
                    ),
            )

        val pnoType5 =
            PnoType(
                id = 5,
                name = "Préavis par engin et pavillon",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 7,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf("OTB"),
                            flagStates = listOf(CountryCode.AD),
                            minimumQuantityKg = 0.0,
                        ),
                    ),
            )

        val pnoType6 =
            PnoType(
                id = 6,
                name = "Préavis par espèce, fao et pavillon",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 8,
                            species = listOf("AMZ"),
                            faoAreas = listOf("37"),
                            cgpmAreas = listOf("30.01", "30.05", "30.06", "30.07", "30.09", "30.10", "30.11"),
                            gears = listOf(),
                            flagStates = listOf(CountryCode.AD),
                            minimumQuantityKg = 250.0,
                        ),
                    ),
            )

        val pnoType7 =
            PnoType(
                id = 7,
                name = "Préavis type 7",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 9,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf("OTT"),
                            flagStates = listOf(CountryCode.GB),
                            minimumQuantityKg = 2000.0,
                        ),
                        PnoTypeRule(
                            id = 10,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf("PTB"),
                            flagStates = listOf(CountryCode.BB),
                            minimumQuantityKg = 10000.0,
                        ),
                    ),
            )

        return listOf(pnoType1, pnoType2, pnoType3, pnoType4, pnoType5, pnoType6, pnoType7)
    }
}
