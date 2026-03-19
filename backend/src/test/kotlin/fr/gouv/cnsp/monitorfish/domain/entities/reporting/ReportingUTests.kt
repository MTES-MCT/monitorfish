package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class ReportingUTests {
    private val now: ZonedDateTime = ZonedDateTime.now()

    private val baseInfractionSuspicion =
        Reporting.InfractionSuspicion(
            id = 1,
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = ReportingSource.UNIT,
            controlUnitId = 1,
            title = "Title",
            natinfCode = 1234,
            threat = "T",
            threatCharacterization = "TC",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
            latitude = 1.0,
            longitude = 2.0,
            satelliteType = SatelliteSource.COPERNICUS,
            otherSourceType = null,
            isFishing = false,
        )

    private val baseObservation =
        Reporting.Observation(
            id = 2,
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = ReportingSource.UNIT,
            controlUnitId = 1,
            title = "Title",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
            latitude = 3.0,
            longitude = 4.0,
            satelliteType = SatelliteSource.OTHER,
            otherSourceType = null,
            isFishing = false,
        )

    private fun makeCommand(
        type: ReportingType,
        latitude: Double? = 10.0,
        longitude: Double? = 20.0,
    ) = ReportingUpdateCommand(
        flagState = CountryCode.FR,
        reportingDate = now,
        latitude = latitude,
        longitude = longitude,
        satelliteType = SatelliteSource.OTHER,
        otherSourceType = OtherSource.NGO,
        isFishing = true,
        reportingSource = ReportingSource.UNIT,
        controlUnitId = 1,
        title = "Updated",
        natinfCode = 5678,
        threat = "T2",
        threatCharacterization = "TC2",
        type = type,
    )

    @Test
    fun `update Should update an Observation to an Observation`() {
        val command = makeCommand(ReportingType.OBSERVATION)

        val result = baseObservation.update(command)

        assertThat(result).isInstanceOf(Reporting.Observation::class.java)
        result as Reporting.Observation
        assertThat(result.title).isEqualTo("Updated")
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
    }

    @Test
    fun `update Should convert an Observation to an InfractionSuspicion with correct fields from command`() {
        val command = makeCommand(ReportingType.INFRACTION_SUSPICION)

        val result = baseObservation.update(command)

        assertThat(result).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        result as Reporting.InfractionSuspicion
        assertThat(result.type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
        assertThat(result.natinfCode).isEqualTo(5678)
        assertThat(result.threat).isEqualTo("T2")
        assertThat(result.threatCharacterization).isEqualTo("TC2")
        // Immutable fields preserved from original entity
        assertThat(result.id).isEqualTo(baseObservation.id)
        assertThat(result.creationDate).isEqualTo(baseObservation.creationDate)
        assertThat(result.createdBy).isEqualTo(baseObservation.createdBy)
    }

    @Test
    fun `update Should update an InfractionSuspicion to an InfractionSuspicion`() {
        val command = makeCommand(ReportingType.INFRACTION_SUSPICION)

        val result = baseInfractionSuspicion.update(command)

        assertThat(result).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        result as Reporting.InfractionSuspicion
        assertThat(result.title).isEqualTo("Updated")
        assertThat(result.natinfCode).isEqualTo(5678)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
    }

    @Test
    fun `update Should convert an InfractionSuspicion to an Observation with correct fields from command`() {
        val command = makeCommand(ReportingType.OBSERVATION)

        val result = baseInfractionSuspicion.update(command)

        assertThat(result).isInstanceOf(Reporting.Observation::class.java)
        result as Reporting.Observation
        assertThat(result.type).isEqualTo(ReportingType.OBSERVATION)
        assertThat(result.latitude).isEqualTo(10.0)
        assertThat(result.longitude).isEqualTo(20.0)
        assertThat(result.isFishing).isTrue()
        assertThat(result.satelliteType).isEqualTo(SatelliteSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.NGO)
        // Immutable fields preserved from original entity
        assertThat(result.id).isEqualTo(baseInfractionSuspicion.id)
        assertThat(result.creationDate).isEqualTo(baseInfractionSuspicion.creationDate)
        assertThat(result.createdBy).isEqualTo(baseInfractionSuspicion.createdBy)
    }

    @Test
    fun `update Should fall back to entity threat and threatCharacterization When command provides null`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = 5678,
                threat = null,
                threatCharacterization = null,
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val result = baseInfractionSuspicion.update(command) as Reporting.InfractionSuspicion

        assertThat(result.threat).isEqualTo(baseInfractionSuspicion.threat)
        assertThat(result.threatCharacterization).isEqualTo(baseInfractionSuspicion.threatCharacterization)
    }

    @Test
    fun `update Should throw When natinfCode is null on InfractionSuspicion to InfractionSuspicion`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = null,
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val throwable = catchThrowable { baseInfractionSuspicion.update(command) }

        assertThat(throwable).isInstanceOf(IllegalStateException::class.java)
        assertThat(throwable.message).contains("NATINF code is required")
    }

    @Test
    fun `update Should throw When natinfCode is null on Observation to InfractionSuspicion`() {
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "Updated",
                natinfCode = null,
                threat = "T2",
                threatCharacterization = "TC2",
                type = ReportingType.INFRACTION_SUSPICION,
            )

        val throwable = catchThrowable { baseObservation.update(command) }

        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `update Should rewrite reportingSource and otherSourceType When DML source produces an Observation`() {
        // Observation init block rewrites DML → OTHER and sets otherSourceType = OtherSource.DM
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.DML,
                authorContact = "contact@example.fr",
                title = "Updated",
                type = ReportingType.OBSERVATION,
            )

        val result = baseObservation.update(command) as Reporting.Observation

        assertThat(result.reportingSource).isEqualTo(ReportingSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.DM)
    }

    @Test
    fun `update Should rewrite reportingSource and otherSourceType When DIRM source produces an Observation via cross-type`() {
        // Same init block rewrite applies when InfractionSuspicion is converted to Observation
        val command =
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                reportingDate = now,
                latitude = 10.0,
                longitude = 20.0,
                reportingSource = ReportingSource.DIRM,
                authorContact = "contact@example.fr",
                title = "Updated",
                type = ReportingType.OBSERVATION,
            )

        val result = baseInfractionSuspicion.update(command) as Reporting.Observation

        assertThat(result.reportingSource).isEqualTo(ReportingSource.OTHER)
        assertThat(result.otherSourceType).isEqualTo(OtherSource.DIRM)
    }

    @Nested
    inner class InfractionSuspicionInit {
        private fun makeInfractionSuspicion(
            reportingSource: ReportingSource,
            otherSourceType: OtherSource? = null,
        ) = Reporting.InfractionSuspicion(
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = reportingSource,
            otherSourceType = otherSourceType,
            title = "Title",
            natinfCode = 1234,
            threat = "T",
            threatCharacterization = "TC",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
        )

        @Test
        fun `init Should rewrite DML with null otherSourceType to OTHER and DM`() {
            val inf = makeInfractionSuspicion(ReportingSource.DML, null)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(inf.otherSourceType).isEqualTo(OtherSource.DM)
        }

        @Test
        fun `init Should rewrite DML with non-null otherSourceType to OTHER and DM`() {
            val inf = makeInfractionSuspicion(ReportingSource.DML, OtherSource.NGO)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(inf.otherSourceType).isEqualTo(OtherSource.DM)
        }

        @Test
        fun `init Should rewrite DIRM with null otherSourceType to OTHER and DIRM`() {
            val inf = makeInfractionSuspicion(ReportingSource.DIRM, null)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(inf.otherSourceType).isEqualTo(OtherSource.DIRM)
        }

        @Test
        fun `init Should rewrite DIRM with non-null otherSourceType to OTHER and DIRM`() {
            val inf = makeInfractionSuspicion(ReportingSource.DIRM, OtherSource.NGO)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(inf.otherSourceType).isEqualTo(OtherSource.DIRM)
        }

        @Test
        fun `init Should leave UNIT source and null otherSourceType unchanged`() {
            val inf = makeInfractionSuspicion(ReportingSource.UNIT, null)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.UNIT)
            assertThat(inf.otherSourceType).isNull()
        }

        @Test
        fun `init Should leave OPS source and non-null otherSourceType unchanged`() {
            val inf = makeInfractionSuspicion(ReportingSource.OPS, OtherSource.NGO)

            assertThat(inf.reportingSource).isEqualTo(ReportingSource.OPS)
            assertThat(inf.otherSourceType).isEqualTo(OtherSource.NGO)
        }
    }

    @Nested
    inner class ObservationInit {
        private fun makeObservation(
            reportingSource: ReportingSource,
            otherSourceType: OtherSource? = null,
        ) = Reporting.Observation(
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = reportingSource,
            otherSourceType = otherSourceType,
            title = "Title",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
        )

        @Test
        fun `init Should rewrite DML with null otherSourceType to OTHER and DM`() {
            val obs = makeObservation(ReportingSource.DML, null)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(obs.otherSourceType).isEqualTo(OtherSource.DM)
        }

        @Test
        fun `init Should rewrite DML with non-null otherSourceType to OTHER and DM`() {
            val obs = makeObservation(ReportingSource.DML, OtherSource.NGO)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(obs.otherSourceType).isEqualTo(OtherSource.DM)
        }

        @Test
        fun `init Should rewrite DIRM with null otherSourceType to OTHER and DIRM`() {
            val obs = makeObservation(ReportingSource.DIRM, null)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(obs.otherSourceType).isEqualTo(OtherSource.DIRM)
        }

        @Test
        fun `init Should rewrite DIRM with non-null otherSourceType to OTHER and DIRM`() {
            val obs = makeObservation(ReportingSource.DIRM, OtherSource.NGO)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.OTHER)
            assertThat(obs.otherSourceType).isEqualTo(OtherSource.DIRM)
        }

        @Test
        fun `init Should leave UNIT source and null otherSourceType unchanged`() {
            val obs = makeObservation(ReportingSource.UNIT, null)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.UNIT)
            assertThat(obs.otherSourceType).isNull()
        }

        @Test
        fun `init Should leave OPS source and non-null otherSourceType unchanged`() {
            val obs = makeObservation(ReportingSource.OPS, OtherSource.NGO)

            assertThat(obs.reportingSource).isEqualTo(ReportingSource.OPS)
            assertThat(obs.otherSourceType).isEqualTo(OtherSource.NGO)
        }
    }

    @Nested
    inner class Verify {
        private fun makeInfractionSuspicion(
            reportingSource: ReportingSource = ReportingSource.UNIT,
            controlUnitId: Int? = 1,
            authorContact: String? = null,
            otherSourceType: OtherSource? = null,
            isIUU: Boolean = false,
            latitude: Double? = null,
            longitude: Double? = null,
        ) = Reporting.InfractionSuspicion(
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = reportingSource,
            controlUnitId = controlUnitId,
            authorContact = authorContact,
            otherSourceType = otherSourceType,
            isIUU = isIUU,
            latitude = latitude,
            longitude = longitude,
            title = "Title",
            natinfCode = 1234,
            threat = "T",
            threatCharacterization = "TC",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
        )

        private fun makeObservation(
            reportingSource: ReportingSource = ReportingSource.UNIT,
            controlUnitId: Int? = 1,
            authorContact: String? = null,
            otherSourceType: OtherSource? = null,
            isIUU: Boolean = false,
            latitude: Double? = null,
            longitude: Double? = null,
        ) = Reporting.Observation(
            flagState = CountryCode.FR,
            creationDate = now,
            lastUpdateDate = now,
            reportingDate = now,
            reportingSource = reportingSource,
            controlUnitId = controlUnitId,
            authorContact = authorContact,
            otherSourceType = otherSourceType,
            isIUU = isIUU,
            latitude = latitude,
            longitude = longitude,
            title = "Title",
            isArchived = false,
            isDeleted = false,
            createdBy = "user@test.fr",
        )

        // isIUU checks

        @Test
        fun `verify Should pass When isIUU is false and lat-lon are null`() {
            makeInfractionSuspicion(isIUU = false, latitude = null, longitude = null).verify()
        }

        @Test
        fun `verify Should pass When isIUU is true and both lat and lon are set`() {
            makeInfractionSuspicion(isIUU = true, latitude = 1.0, longitude = 2.0).verify()
        }

        @Test
        fun `verify Should throw When isIUU is true and latitude is null`() {
            val throwable =
                catchThrowable {
                    makeInfractionSuspicion(isIUU = true, latitude = null, longitude = 2.0).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("latitude must be set")
        }

        @Test
        fun `verify Should throw When isIUU is true and longitude is null`() {
            val throwable =
                catchThrowable {
                    makeInfractionSuspicion(isIUU = true, latitude = 1.0, longitude = null).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("longitude must be set")
        }

        // Actor / source checks

        @Test
        fun `verify Should pass When source is UNIT and controlUnitId is set`() {
            makeInfractionSuspicion(reportingSource = ReportingSource.UNIT, controlUnitId = 42).verify()
        }

        @Test
        fun `verify Should throw When source is UNIT and controlUnitId is null`() {
            val throwable =
                catchThrowable {
                    makeInfractionSuspicion(reportingSource = ReportingSource.UNIT, controlUnitId = null).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("unit must be set")
        }

        @Test
        fun `verify Should pass When source is OTHER and authorContact and otherSourceType are set`() {
            makeInfractionSuspicion(
                reportingSource = ReportingSource.OTHER,
                controlUnitId = null,
                authorContact = "contact@example.fr",
                otherSourceType = OtherSource.NGO,
            ).verify()
        }

        @Test
        fun `verify Should throw When source is OTHER and authorContact is null`() {
            val throwable =
                catchThrowable {
                    makeInfractionSuspicion(
                        reportingSource = ReportingSource.OTHER,
                        controlUnitId = null,
                        authorContact = null,
                        otherSourceType = OtherSource.NGO,
                    ).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("author contact must be set")
        }

        @Test
        fun `verify Should throw When source is OTHER and otherSourceType is null`() {
            val throwable =
                catchThrowable {
                    makeInfractionSuspicion(
                        reportingSource = ReportingSource.OTHER,
                        controlUnitId = null,
                        authorContact = "contact@example.fr",
                        otherSourceType = null,
                    ).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("actor type must be set")
        }

        // Observation delegates to the same logic — one smoke test suffices

        @Test
        fun `verify Should throw for Observation When isIUU is true and latitude is null`() {
            val throwable =
                catchThrowable {
                    makeObservation(isIUU = true, latitude = null, longitude = 2.0).verify()
                }

            assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
            assertThat(throwable.message).contains("latitude must be set")
        }
    }

    @Test
    fun `update Should throw an IllegalArgumentException When called on an Alert`() {
        val alert =
            Reporting.Alert(
                id = 3,
                flagState = CountryCode.FR,
                creationDate = now,
                lastUpdateDate = now,
                reportingDate = now,
                isArchived = false,
                isDeleted = false,
                createdBy = "user@test.fr",
                alertType = AlertType.MISSING_DEP_ALERT,
                natinfCode = 1234,
                threat = "T",
                threatCharacterization = "TC",
                name = "Alert name",
            )

        val throwable = catchThrowable { alert.update(makeCommand(ReportingType.OBSERVATION)) }

        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("Alerts cannot be updated")
    }
}
