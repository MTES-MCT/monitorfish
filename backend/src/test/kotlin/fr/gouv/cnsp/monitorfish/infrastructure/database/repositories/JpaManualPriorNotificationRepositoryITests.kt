package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneOffset
import java.time.ZonedDateTime

class JpaManualPriorNotificationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaManualPriorNotificationRepository: JpaManualPriorNotificationRepository

    @Autowired
    private lateinit var jpaRiskFactorRepository: JpaRiskFactorRepository

    @Autowired
    private lateinit var jpaVesselRepository: JpaVesselRepository

    private var allManualPriorNotificationsLength: Int = 0

    val defaultPriorNotificationsFilter = PriorNotificationsFilter(
        willArriveAfter = "2000-01-01T00:00:00Z",
        willArriveBefore = "2099-12-31T00:00:00Z",
    )

    @BeforeEach
    fun beforeEach() {
        allManualPriorNotificationsLength =
            jpaManualPriorNotificationRepository.findAll(defaultPriorNotificationsFilter).size
    }

    @Test
    @Transactional
    fun `findAll Should return all manual prior notifications`() {
        // When
        val result = jpaManualPriorNotificationRepository.findAll(defaultPriorNotificationsFilter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications from BEL & ITA vessels`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(flagStates = listOf("BEL", "ITA"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        val resultVessels = result.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(resultVessels).hasSize(result.size)
        assertThat(resultVessels.all { listOf(CountryCode.BE, CountryCode.IT).contains(it.flagState) }).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications with or without reportings`() {
        val expectedLogbookReportIdsWithOneOrMoreReportings = listOf("00000000-0000-4000-0000-000000000002")

        // Given
        val firstFilter = defaultPriorNotificationsFilter.copy(hasOneOrMoreReportings = true)

        // When
        val firstResult = jpaManualPriorNotificationRepository.findAll(firstFilter)

        // Then
        assertThat(firstResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            firstResult.all {
                it.reportId in expectedLogbookReportIdsWithOneOrMoreReportings
            },
        ).isTrue()

        // Given
        val secondFilter = defaultPriorNotificationsFilter.copy(hasOneOrMoreReportings = false)

        // When
        val secondResult = jpaManualPriorNotificationRepository.findAll(secondFilter)

        // Then
        assertThat(secondResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            secondResult.none {
                it.reportId in expectedLogbookReportIdsWithOneOrMoreReportings
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return all manual prior notifications for less than 12 meters long vessels and none for more than 12 meters long vessels`() {
        // Given
        val firstFilter = defaultPriorNotificationsFilter.copy(isLessThanTwelveMetersVessel = true)

        // When
        val firstResult = jpaManualPriorNotificationRepository.findAll(firstFilter)

        // Then
        assertThat(firstResult).hasSize(allManualPriorNotificationsLength)
        val firstResultVessels = firstResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultVessels).hasSize(firstResult.size)
        assertThat(firstResultVessels.all { it.length!! < 12 }).isTrue()

        // Given
        val secondFilter = defaultPriorNotificationsFilter.copy(isLessThanTwelveMetersVessel = false)

        // When
        val secondResult = jpaManualPriorNotificationRepository.findAll(secondFilter)

        // Then
        assertThat(secondResult).isEmpty()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for vessels controlled after or before January 1st, 2024`() {
        // Given
        val firstFilter = defaultPriorNotificationsFilter.copy(lastControlledAfter = "2024-01-01T00:00:00Z")

        // When
        val firstResult = jpaManualPriorNotificationRepository.findAll(firstFilter)

        // Then
        assertThat(firstResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        val firstResultRiskFactors = firstResult.mapNotNull {
            jpaRiskFactorRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultRiskFactors).hasSize(firstResult.size)
        assertThat(
            firstResultRiskFactors.all {
                it.lastControlDatetime!!.isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()

        // Given
        val secondFilter = defaultPriorNotificationsFilter.copy(lastControlledBefore = "2024-01-01T00:00:00Z")

        // When
        val secondResult = jpaManualPriorNotificationRepository.findAll(secondFilter)

        // Then
        assertThat(secondResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        val secondResultRiskFactors = secondResult.mapNotNull {
            jpaRiskFactorRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(secondResultRiskFactors).hasSize(secondResult.size)
        assertThat(
            secondResultRiskFactors.all {
                it.lastControlDatetime!!.isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for FRNCE & FRVNE ports`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(portLocodes = listOf("FRNCE", "FRVNE"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                listOf("FRNCE", "FRVNE").contains(it.logbookMessageAndValue.value.port)
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for NAVIRE RENOMMÉ vessel`() {
        // Given
        val firstFilter = defaultPriorNotificationsFilter.copy(searchQuery = "renom")

        // When
        val firstResult = jpaManualPriorNotificationRepository.findAll(firstFilter)

        // Then
        assertThat(firstResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            firstResult.all { it.logbookMessageAndValue.logbookMessage.vesselName == "NAVIRE RENOMMÉ (ANCIEN NOM)" },
        ).isTrue()
        val firstResultVessels = firstResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultVessels).hasSize(firstResult.size)
        assertThat(firstResultVessels.all { it.vesselName == "NAVIRE RENOMMÉ (NOUVEAU NOM)" }).isTrue()

        // Given
        val secondFilter = defaultPriorNotificationsFilter.copy(searchQuery = "eNÔm")

        // When
        val secondResult = jpaManualPriorNotificationRepository.findAll(secondFilter)

        // Then
        assertThat(secondResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            secondResult.all { it.logbookMessageAndValue.logbookMessage.vesselName == "NAVIRE RENOMMÉ (ANCIEN NOM)" },
        ).isTrue()
        val secondResultVessels = secondResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(secondResultVessels).hasSize(secondResult.size)
        assertThat(secondResultVessels.all { it.vesselName == "NAVIRE RENOMMÉ (NOUVEAU NOM)" }).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for BIB & BFT species`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(specyCodes = listOf("BIB", "BFT"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                it.logbookMessageAndValue.value.catchOnboard
                    .any { catch -> listOf("BIB", "BFT").contains(catch.species) }
            },
        ).isTrue()
        assertThat(
            result.all {
                it.logbookMessageAndValue.value.catchToLand
                    .any { catch -> listOf("BIB", "BFT").contains(catch.species) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for Préavis type A & Préavis type C types`() {
        // Given
        val filter =
            defaultPriorNotificationsFilter.copy(priorNotificationTypes = listOf("Préavis type A", "Préavis type C"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                it.logbookMessageAndValue.value.pnoTypes
                    .any { type -> listOf("Préavis type A", "Préavis type C").contains(type.name) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for NWW05 & NWW09 segments`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(tripSegmentCodes = listOf("NWW05", "NWW09"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                it.logbookMessageAndValue.logbookMessage.tripSegments!!
                    .any { tripSegment ->
                        listOf("NWW05", "NWW09").contains(
                            tripSegment.code,
                        )
                    }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for LNP & TBS gears`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(tripGearCodes = listOf("LNP", "TBS"))

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                it.logbookMessageAndValue.logbookMessage.tripGears!!
                    .any { tripGear -> listOf("LNP", "TBS").contains(tripGear.gear) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return manual prior notifications for vessels arriving after or before January 1st, 2024`() {
        // Given
        val firstFilter = PriorNotificationsFilter(
            willArriveAfter = "2024-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaManualPriorNotificationRepository.findAll(firstFilter)

        // Then
        assertThat(firstResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            firstResult.all {
                it.logbookMessageAndValue.value.predictedArrivalDatetimeUtc!!
                    .isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2024-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaManualPriorNotificationRepository.findAll(secondFilter)

        // Then
        assertThat(secondResult).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            secondResult.all {
                it.logbookMessageAndValue.value.predictedArrivalDatetimeUtc!!
                    .isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAll Should return the expected manual prior notifications with multiple filters`() {
        // Given
        val filter = defaultPriorNotificationsFilter.copy(
            priorNotificationTypes = listOf("Préavis type A", "Préavis type C"),
            tripGearCodes = listOf("OTT", "TB"),
        )

        // When
        val result = jpaManualPriorNotificationRepository.findAll(filter)

        // Then
        assertThat(result).hasSizeBetween(1, allManualPriorNotificationsLength - 1)
        assertThat(
            result.all {
                it.logbookMessageAndValue.value.pnoTypes
                    .any { type -> listOf("Préavis type A", "Préavis type C").contains(type.name) }
            },
        ).isTrue()
        assertThat(
            result.all {
                it.logbookMessageAndValue.logbookMessage.tripGears!!
                    .any { tripGear -> listOf("OTT", "TB").contains(tripGear.gear) }
            },
        ).isTrue()
        assertThat(
            result.all {
                it.logbookMessageAndValue.value.predictedArrivalDatetimeUtc!!
                    .isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findByReportId Should return the expected manual prior notification`() {
        // Given
        val reportId = "00000000-0000-4000-0000-000000000002"

        // When
        val result = jpaManualPriorNotificationRepository.findByReportId(reportId)

        // Then
        assertThat(result!!.reportId).isEqualTo("00000000-0000-4000-0000-000000000002")
        assertThat(result.logbookMessageAndValue.logbookMessage.vesselName).isEqualTo("DOS FIN")
    }

    @Test
    @Transactional
    fun `save Should create and update a manual prior notification`() {
        val originalPriorNotificationsSize = jpaManualPriorNotificationRepository
            .findAll(defaultPriorNotificationsFilter)
            .size

        // Given
        val newPriorNotification =
            PriorNotification(
                reportId = null,
                authorTrigram = "ABC",
                createdAt = null,
                didNotFishAfterZeroNotice = false,
                isManuallyCreated = false,
                logbookMessageAndValue = LogbookMessageAndValue(
                    LogbookMessage(
                        id = null,
                        internalReferenceNumber = "CFR123",
                        // Replaced by the generated `createdAt` during the save operation.
                        integrationDateTime = ZonedDateTime.now(),
                        message = PNO().apply {
                            catchOnboard = emptyList()
                            catchToLand = emptyList()
                            economicZone = null
                            effortZone = null
                            faoZone = null
                            latitude = null
                            longitude = null
                            pnoTypes = emptyList()
                            port = "FRVNE"
                            portName = "Vannes"
                            predictedArrivalDatetimeUtc = ZonedDateTime.now().withZoneSameInstant(ZoneOffset.UTC)
                            predictedLandingDatetimeUtc = ZonedDateTime.now().withZoneSameInstant(ZoneOffset.UTC)
                            purpose = LogbookMessagePurpose.LAN
                            riskFactor = 2.1
                            statisticalRectangle = null
                            tripStartDate = null
                        },
                        messageType = "PNO",
                        // Replaced by the generated `createdAt` during the save operation.
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = null,
                        operationType = LogbookOperationType.DAT,
                        // Replaced by the generated `sentAt` during the save operation.
                        reportDateTime = ZonedDateTime.now(),
                        transmissionFormat = null,
                        vesselName = "Vessel Name",
                        vesselId = 123,
                    ),
                    PNO::class.java,
                ),
                port = null,
                reportingCount = null,
                seafront = null,
                sentAt = ZonedDateTime.now(),
                updatedAt = null,
                vessel = null,
                lastControlDateTime = null,
            )

        // When
        val createdPriorNotification = jpaManualPriorNotificationRepository.save(newPriorNotification)
        val priorNotifications = jpaManualPriorNotificationRepository
            .findAll(defaultPriorNotificationsFilter)
            .sortedBy { it.createdAt }

        // Then
        val lastPriorNotification = priorNotifications.last()
        assertThat(priorNotifications).hasSize(originalPriorNotificationsSize + 1)
        assertThat(lastPriorNotification)
            .usingRecursiveComparison()
            .ignoringFields("logbookMessageTyped")
            .isEqualTo(createdPriorNotification)
        assertThat(lastPriorNotification.logbookMessageAndValue.logbookMessage)
            .isEqualTo(createdPriorNotification.logbookMessageAndValue.logbookMessage)
        assertThat(createdPriorNotification.logbookMessageAndValue.value.riskFactor)
            .isEqualTo(2.1)
    }

    @Test
    @Transactional
    fun `updateState Should update writable state values for an existing PNO logbook report`() {
        // Given
        val currentManualPriorNotification = jpaManualPriorNotificationRepository
            .findByReportId("00000000-0000-4000-0000-000000000001")!!
        assertThat(currentManualPriorNotification.logbookMessageAndValue.value.isBeingSent).isEqualTo(false)
        assertThat(currentManualPriorNotification.logbookMessageAndValue.value.isVerified).isEqualTo(false)

        // When
        jpaManualPriorNotificationRepository.updateState(
            "00000000-0000-4000-0000-000000000001",
            isBeingSent = true,
            isVerified = true,
        )

        // Then
        val updatedManualPriorNotification = jpaManualPriorNotificationRepository
            .findByReportId("00000000-0000-4000-0000-000000000001")!!
        assertThat(updatedManualPriorNotification.logbookMessageAndValue.value.isBeingSent).isEqualTo(true)
        assertThat(updatedManualPriorNotification.logbookMessageAndValue.value.isVerified).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `findAllToVerify Should return manual PNO to verify`() {
        // When
        val result = jpaManualPriorNotificationRepository.findAllToVerify()

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(result.filter { it.logbookMessageAndValue.value.isVerified == false }).hasSize(1)
        assertThat(result.filter { it.logbookMessageAndValue.value.isInVerificationScope == true }).hasSize(1)
    }

    @Test
    @Transactional
    fun `invalidate Should invalidate an existing PNO logbook report`() {
        // Given
        val currentManualPriorNotification = jpaManualPriorNotificationRepository
            .findByReportId("00000000-0000-4000-0000-000000000001")!!
        assertThat(currentManualPriorNotification.logbookMessageAndValue.value.isInvalidated).isNull()

        // When
        jpaManualPriorNotificationRepository.invalidate(
            "00000000-0000-4000-0000-000000000001",
        )

        // Then
        val updatedManualPriorNotification = jpaManualPriorNotificationRepository
            .findByReportId("00000000-0000-4000-0000-000000000001")!!
        assertThat(updatedManualPriorNotification.logbookMessageAndValue.value.isInvalidated).isEqualTo(true)
    }
}
